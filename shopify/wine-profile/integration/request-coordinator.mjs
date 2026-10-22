import { RequestError } from './security.mjs';

const busy = new Set(['preparing', 'dispatching', 'accepted', 'review']);
const publicStatus = (record) => ({
  submissionId: record.submissionId,
  status: record.status === 'accepted' || record.status === 'processed' ? 'email_requested' : record.status,
  ...(record.code ? { code: record.code } : {}),
});

// One instance per customer Durable Object for Lord James Follent; no answers or contact fields are stored here.
export class ProfileRequestCoordinator {
  constructor({ storage, admin, customerId, dispatch, enabled = false, clock = () => new Date() }) {
    Object.assign(this, { storage, admin, customerId, dispatch, enabled, clock });
    this.queue = Promise.resolve();
  }
  serial(operation) {
    const next = this.queue.then(operation);
    this.queue = next.catch(() => {});
    return next;
  }
  async state() { return (await this.storage.get('requests')) ?? { active: null, records: [] }; }
  async save(state, record) {
    state.records = [record, ...state.records.filter((item) => item.submissionId !== record.submissionId)].slice(0, 50);
    await this.storage.put('requests', state);
  }
  async recover(state) {
    const active = state.records.find((record) => record.submissionId === state.active);
    if (active && ['preparing', 'dispatching'].includes(active.status)) {
      active.status = 'review'; active.code = 'interrupted_request';
      active.updatedAt = this.clock().toISOString();
      await this.save(state, active);
    }
  }
  async reconcile(state, customer) {
    if (!state.active) return;
    let outcome;
    try { outcome = JSON.parse(customer.request?.value); } catch { return; }
    const active = state.records.find((record) => record.submissionId === state.active);
    if (active && outcome.submission_id === active.submissionId && ['processed', 'skipped'].includes(outcome.status)) {
      active.status = outcome.status;
      active.updatedAt = this.clock().toISOString();
      state.active = null;
      await this.save(state, active);
    }
  }
  request(validated) {
    return this.serial(async () => {
      if (!this.enabled) throw new RequestError('email_requests_disabled', 503);
      const state = await this.state();
      await this.recover(state);
      const previous = state.records.find((record) => record.submissionId === validated.submissionId);
      if (previous && previous.fingerprint !== validated.fingerprint) throw new RequestError('submission_id_reused', 409);
      if (previous && ['accepted', 'processed', 'review', 'skipped'].includes(previous.status)) return publicStatus(previous);
      if (previous && ['preparing', 'dispatching'].includes(previous.status)) {
        previous.status = 'review'; previous.code = 'interrupted_request';
        await this.save(state, previous);
        return publicStatus(previous);
      }
      let current = await this.admin.customer(this.customerId);
      await this.reconcile(state, current);
      const active = state.records.find((record) => record.submissionId === state.active);
      if (active && busy.has(active.status)) throw new RequestError('profile_request_processing', 409);
      const record = { submissionId: validated.submissionId, fingerprint: validated.fingerprint, status: 'needs_subscription', updatedAt: this.clock().toISOString() };
      if (current.defaultEmailAddress?.marketingState !== 'SUBSCRIBED') {
        await this.save(state, record);
        return publicStatus(record);
      }
      state.active = record.submissionId;
      record.status = 'preparing';
      await this.save(state, record);
      try { current = await this.admin.persistProfile(this.customerId, validated, current, this.clock()); }
      catch (error) {
        record.status = 'failed'; record.code = error instanceof RequestError ? error.code : 'profile_preparation_failed';
        state.active = null;
        await this.save(state, record);
        return publicStatus(record);
      }
      // Check consent again after persistence; no delivery adapter is invoked for a changed subscription.
      if (current.defaultEmailAddress?.marketingState !== 'SUBSCRIBED') {
        record.status = 'needs_subscription'; state.active = null;
        await this.save(state, record);
        return publicStatus(record);
      }
      record.status = 'dispatching';
      await this.save(state, record);
      try {
        const result = await this.dispatch({ customerId: this.customerId, submissionId: record.submissionId, customer: current });
        if (result?.accepted !== true) throw new Error('No acceptance returned');
        record.status = 'accepted';
      } catch {
        // A timeout may follow a successful trigger. Keep the profile locked and never automatically retry it.
        record.status = 'review'; record.code = 'dispatch_outcome_unknown';
      }
      record.updatedAt = this.clock().toISOString();
      await this.save(state, record);
      return publicStatus(record);
    });
  }
  status(submissionId) {
    return this.serial(async () => {
      const state = await this.state();
      await this.recover(state);
      if (state.active) await this.reconcile(state, await this.admin.customer(this.customerId));
      const record = state.records.find((item) => item.submissionId === submissionId);
      if (!record) throw new RequestError('submission_not_found', 404);
      return publicStatus(record);
    });
  }
}
