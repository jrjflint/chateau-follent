export const QUIZ_VERSION = '1.0.0';
export const CONSENT_VERSION = '2026-10-20';
const options = (items) => items.map(([id, label]) => ({ id, label }));
export const QUESTIONS = [
  { id: 'wine_interests', title: 'Which types of wine do you enjoy or want to explore?', kind: 'multi', exclusive: 'exploring', options: options([
    ['red', 'Red wine'], ['white', 'White wine'], ['rose', 'Rosé'], ['sparkling', 'Sparkling wine'], ['mead', 'Mead or honey-based wine'], ['experimental', 'Experimental or small-batch wines'], ['exploring', "I'm still exploring"],
  ]) },
  { id: 'flavour_preferences', title: 'Which flavour descriptions appeal to you?', kind: 'multi', max: 3, exclusive: 'unsure', options: options([
    ['crisp', 'Fresh and crisp'], ['delicate', 'Light and delicate'], ['aromatic', 'Fruity and aromatic'], ['rich', 'Rich and full-bodied'], ['savoury', 'Dry and savoury'], ['smooth', 'Sweet and smooth'], ['unsure', "I'm not sure yet"],
  ]) },
  { id: 'body_preference', title: 'What style of wine do you generally prefer?', kind: 'single', options: options([
    ['light', 'Light-bodied'], ['medium', 'Medium-bodied'], ['full', 'Full-bodied'], ['varied', 'I enjoy different styles'], ['unsure', "I'm not sure"],
  ]) },
  { id: 'sweetness_preference', title: 'How sweet do you usually prefer your wine?', kind: 'single', options: options([
    ['dry', 'Dry'], ['off_dry', 'Slightly sweet / off-dry'], ['sweet', 'Sweet'], ['varied', 'It depends on the wine'], ['unsure', "I'm not sure"],
  ]) },
  { id: 'wine_occasions', title: 'When do you typically enjoy or purchase wine?', kind: 'multi', exclusive: 'non_drinker', options: options([
    ['meals', 'With meals'], ['sharing', 'Sharing with friends or family'], ['celebrations', 'Special celebrations'], ['gifts', 'Giving as gifts'], ['cellaring', 'Collecting or cellaring'], ['tasting', 'Wine tasting and discovery'], ['non_drinker', "I don't currently drink or purchase wine"],
  ]) },
  { id: 'discovery_interest', title: 'How interested are you in exploring unfamiliar wines?', kind: 'single', options: options([
    ['familiar', 'I usually stick with familiar favourites'], ['occasional', 'I occasionally try something different'], ['adventurous', 'I enjoy discovering new varieties and styles'], ['learning', "I'm still learning what I enjoy"],
  ]) },
  { id: 'education_interest', title: 'What would you most like to learn about wine?', kind: 'single', options: options([
    ['grapes', 'Understanding grape varieties'], ['winemaking', 'How wine is made'], ['pairing', 'Food and wine pairing'], ['tasting', 'How to taste and describe wine'], ['regions', 'Wine regions and growing conditions'], ['journey', 'Following the journey of a small winery'],
  ]) },
];
export const DISCOVERY_SOURCES = options([
  ['instagram_james', 'Instagram — James Follent'], ['instagram_chateau', 'Instagram — Chateau Follent'], ['youtube', 'YouTube'], ['facebook', 'Facebook'], ['search', 'Google or another search engine'], ['friends_family', 'Friends or family'], ['wine_event', 'Wine club or wine event'], ['website', 'Another website'], ['other', 'Other'], ['unknown', "I can't remember"],
]);
export const CONSENT = {
  marketing: "I'd like to receive Chateau Follent vintage journals, news and occasional updates about future releases and membership.",
  birthday: "I'd like Chateau Follent to remember my birthday and send me a birthday message.",
};

// Style descriptions are starting points, not guarantees about every producer or bottle.
const style = (id, name, categories, flavours, body, sweetness, sensory, unfamiliar = false) => ({ id, name, categories, flavours, body, sweetness, sensory, unfamiliar });
export const STYLES = [
  style('pinot_noir', 'Light-bodied Pinot Noir', ['red'], ['delicate', 'aromatic', 'savoury'], 'light', 'dry', 'A red-cherry aroma and a gentle, drying finish.'),
  style('shiraz', 'Full-bodied Shiraz', ['red'], ['rich', 'savoury', 'aromatic'], 'full', 'dry', 'Dark plum fruit with a hint of black pepper.'),
  style('cabernet', 'Cabernet Sauvignon', ['red'], ['rich', 'savoury'], 'full', 'dry', 'Blackcurrant aromas and a firm, drying texture.'),
  style('malbec', 'Full-bodied Malbec', ['red'], ['rich', 'aromatic'], 'full', 'dry', 'Dark-berry aromas with a generous, rounded texture.'),
  style('grenache', 'Medium-bodied Grenache', ['red'], ['aromatic', 'delicate'], 'medium', 'dry', 'Red-berry aromas with a rounded texture.'),
  style('sweet_red', 'A labelled sweet red blend', ['red'], ['smooth', 'aromatic'], 'medium', 'sweet', 'Ripe berry flavours alongside actual residual sweetness.'),
  style('riesling', 'Dry Riesling', ['white'], ['crisp', 'delicate', 'aromatic'], 'light', 'dry', 'Lime-like freshness and a mouth-watering finish.'),
  style('sauvignon_blanc', 'Dry Sauvignon Blanc', ['white'], ['crisp', 'aromatic'], 'light', 'dry', 'Citrus-like acidity and herbaceous aromas.'),
  style('pinot_grigio', 'Light, dry Pinot Grigio', ['white'], ['crisp', 'delicate'], 'light', 'dry', 'Pear-like aromas in a light, fresh frame.'),
  style('vermentino', 'Vermentino', ['white', 'experimental'], ['crisp', 'savoury'], 'light', 'dry', 'Citrus peel and a lightly savoury finish.', true),
  style('chardonnay', 'Full-bodied, oak-influenced Chardonnay', ['white'], ['rich', 'savoury'], 'full', 'dry', 'A rounded texture with a suggestion of toast.'),
  style('off_dry_riesling', 'Off-dry Riesling', ['white'], ['crisp', 'aromatic', 'smooth'], 'light', 'off_dry', 'A little sweetness balanced by citrus-like acidity.'),
  style('moscato', 'Sweet Moscato', ['white'], ['aromatic', 'delicate', 'smooth'], 'light', 'sweet', 'Floral and grape-like aromas with a sweet finish.'),
  style('dry_rose', 'Dry, pale rosé', ['rose'], ['crisp', 'delicate'], 'light', 'dry', 'Delicate red-berry aromas with a fresh finish.'),
  style('textured_rose', 'Textured, dry Sangiovese rosé', ['rose', 'experimental'], ['savoury', 'rich'], 'medium', 'dry', 'Cherry-like fruit and a little grip on the finish.', true),
  style('off_dry_rose', 'Off-dry rosé', ['rose'], ['aromatic', 'smooth'], 'light', 'off_dry', 'Strawberry-like fruit with a small cushion of sweetness.'),
  style('sweet_rose', 'Sweet pink Moscato', ['rose'], ['aromatic', 'smooth', 'delicate'], 'light', 'sweet', 'Rose-petal aromas and sweet red-fruit flavours.'),
  style('brut', 'Brut sparkling Chardonnay', ['sparkling'], ['crisp', 'delicate'], 'light', 'dry', 'Fine bubbles and green-apple freshness.'),
  style('traditional_sparkling', 'Traditional-method sparkling wine', ['sparkling'], ['rich', 'savoury'], 'medium', 'dry', 'Bready aromas alongside the texture of bubbles.'),
  style('demi_sec', 'Demi-sec sparkling wine', ['sparkling'], ['aromatic', 'smooth'], 'medium', 'sweet', 'Noticeable sweetness lifted by bubbles and acidity.'),
  style('dry_mead', 'Dry traditional mead', ['mead'], ['delicate', 'savoury'], 'light', 'dry', 'A floral honey aroma without assuming a sweet finish.', true),
  style('off_dry_mead', 'Off-dry traditional mead', ['mead'], ['aromatic', 'smooth'], 'medium', 'off_dry', 'Floral aromas and a gentle amount of residual sweetness.', true),
  style('sweet_mead', 'Sweet traditional mead', ['mead'], ['smooth', 'rich'], 'full', 'sweet', 'Honeyed aromas with a fuller, sweet texture.', true),
  style('skin_contact', 'Dry, skin-contact white wine', ['white', 'experimental'], ['savoury', 'rich'], 'medium', 'dry', 'Tea-like grip from time spent on grape skins.', true),
  style('pet_nat', 'Dry pétillant naturel', ['sparkling', 'experimental'], ['crisp', 'aromatic'], 'light', 'dry', 'Lively bubbles; texture varies with the producer.', true),
];

export const JOURNAL_TOPICS = {
  grapes: { title: 'One grape, more than one expression', detail: 'A suggested journal topic: how Chardonnay became both still and sparkling wine in one vintage.', href: 'vintages.html#vintage-2025-heading' },
  winemaking: { title: 'From grape to glass, one small batch at a time', detail: 'A suggested journal topic: fermentation choices and the lessons of the 2025 sparkling Chardonnay.', href: 'vintages.html#vintage-2025-heading' },
  pairing: { title: 'Why texture matters at the table', detail: 'A suggested journal topic: using the dry 2025 rosé as a starting point for thinking about food and texture.', href: 'vintages.html#vintage-2025-heading' },
  tasting: { title: 'Finding words for what you notice', detail: 'A suggested journal topic: comparing the described textures of the 2025 rosé and Chardonnay.', href: 'vintages.html#vintage-2025-heading' },
  regions: { title: 'A vintage begins with a place', detail: 'A suggested journal topic: following the Mudgee and Riverland fruit recorded in the vintage archive.', href: 'vintages.html#vintage-2025-heading' },
  journey: { title: 'The first vintage, and the lessons that followed', detail: 'A suggested journal topic: the small experiments that shape a growing winery, beginning with the 2024 vintage.', href: 'vintages.html' },
};
