const ALLOWED_TONES = ['Bold', 'Professional', 'Witty', 'Casual'];
const ALLOWED_STYLES = ['Studio', 'Lifestyle', 'Outdoor', 'Flat lay'];
const ALLOWED_BACKGROUNDS = ['White seamless', 'Wood table', 'Gym', 'Nature', 'Kitchen'];
const ALLOWED_LIGHTING = ['Soft studio', 'Golden hour', 'Bright daylight', 'Dramatic'];

const LIMITS = {
  productName: 120,
  productDescription: 2000,
  targetAudience: 200,
};

function stripControlChars(value) {
  return value.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
}

function sanitizeText(value, maxLength) {
  if (typeof value !== 'string') return '';
  return stripControlChars(value).trim().slice(0, maxLength);
}

function validateCampaignInput(body) {
  const errors = [];

  const productName = sanitizeText(body.productName, LIMITS.productName);
  const productDescription = sanitizeText(body.productDescription, LIMITS.productDescription);
  const targetAudience = sanitizeText(body.targetAudience, LIMITS.targetAudience);
  const tone = sanitizeText(body.tone, 40);
  const visualStyle = sanitizeText(body.visualStyle, 40);
  const background = sanitizeText(body.background, 40);
  const lighting = sanitizeText(body.lighting, 40);

  if (!productName) errors.push('productName is required');
  if (!productDescription) errors.push('productDescription is required');
  if (!targetAudience) errors.push('targetAudience is required');
  if (!ALLOWED_TONES.includes(tone)) errors.push('Invalid tone');
  if (!ALLOWED_STYLES.includes(visualStyle)) errors.push('Invalid visualStyle');
  if (!ALLOWED_BACKGROUNDS.includes(background)) errors.push('Invalid background');
  if (!ALLOWED_LIGHTING.includes(lighting)) errors.push('Invalid lighting');

  return {
    errors,
    data: { productName, productDescription, targetAudience, tone, visualStyle, background, lighting },
  };
}

module.exports = {
  ALLOWED_TONES,
  ALLOWED_STYLES,
  ALLOWED_BACKGROUNDS,
  ALLOWED_LIGHTING,
  LIMITS,
  validateCampaignInput,
};
