const STYLE_PROMPTS = {
  Studio: 'professional studio product photography, clean composition, premium advertising shot',
  Lifestyle: 'lifestyle product photography, product in natural everyday use context',
  Outdoor: 'outdoor product photography, natural environment, authentic scene',
  'Flat lay': 'top-down flat lay product photography, styled arrangement, editorial look',
};

const BACKGROUND_PROMPTS = {
  'White seamless': 'pure white seamless background, minimal distractions',
  'Wood table': 'warm wooden table surface, rustic elegant backdrop',
  Gym: 'modern gym environment, athletic atmosphere in soft background blur',
  Nature: 'natural outdoor setting, greenery and soft bokeh background',
  Kitchen: 'bright modern kitchen setting, clean domestic backdrop',
};

const LIGHTING_PROMPTS = {
  'Soft studio': 'soft diffused studio lighting, gentle shadows, balanced exposure',
  'Golden hour': 'warm golden hour sunlight, natural glow, cinematic warmth',
  'Bright daylight': 'bright natural daylight, crisp highlights, fresh and vibrant',
  Dramatic: 'dramatic rim lighting with soft key light, high-end commercial mood',
};

const NEGATIVE_PROMPT =
  'blurry, low quality, low resolution, text, watermark, logo, signature, ' +
  'cartoon, anime, illustration, painting, deformed, distorted, ugly, ' +
  'oversaturated, jpeg artifacts, duplicate, extra limbs, bad anatomy, ' +
  'cropped product, out of frame';

function buildImagePrompt(basePrompt, { style, background, lighting }) {
  const stylePart = STYLE_PROMPTS[style] || STYLE_PROMPTS.Studio;
  const backgroundPart = BACKGROUND_PROMPTS[background] || BACKGROUND_PROMPTS['White seamless'];
  const lightingPart = LIGHTING_PROMPTS[lighting] || LIGHTING_PROMPTS['Soft studio'];

  return [
    basePrompt.trim(),
    stylePart,
    backgroundPart,
    lightingPart,
    'commercial advertising photography',
    'photorealistic',
    'ultra sharp focus on product',
    '85mm lens',
    'f/2.8 shallow depth of field',
    'high detail',
    'no text',
    'no watermark',
  ].join(', ');
}

function getNegativePrompt() {
  return NEGATIVE_PROMPT;
}

module.exports = {
  STYLE_PROMPTS,
  BACKGROUND_PROMPTS,
  LIGHTING_PROMPTS,
  buildImagePrompt,
  getNegativePrompt,
};
