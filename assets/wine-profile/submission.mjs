// Replace this adapter with a secure backend call; keep provider credentials off the page.
export async function mockSubmitLead(_lead) {
  return { status: 'preview', email_sent: false, submitted: false };
}

// Only an explicit delivery confirmation may ever produce the delivered state.
export async function submitLead(lead, adapter = mockSubmitLead) {
  const response = await adapter(lead);
  if (response?.status === 'preview' && response.email_sent === false && response.submitted === false) return response;
  if (response?.status === 'delivered' && response.email_sent === true && typeof response.delivery_id === 'string' && response.delivery_id.trim()) return response;
  throw new Error('Delivery was not confirmed. Your profile is still available here.');
}
