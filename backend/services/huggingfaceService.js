const { InferenceClient } = require('@huggingface/inference');

const COPY_MODEL = 'Qwen/Qwen2.5-7B-Instruct';

const HF_IMAGE_MODELS = [
  {
    model: 'black-forest-labs/FLUX.1-dev',
    endpoint: 'https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-dev',
  },
  {
    model: 'black-forest-labs/FLUX.1-schnell',
    endpoint: 'https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell',
  },
  {
    model: 'stabilityai/stable-diffusion-xl-base-1.0',
    endpoint: 'https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-xl-base-1.0',
  },
];

class HuggingFaceService {
  constructor(apiToken) {
    if (!apiToken) {
      throw new Error('Hugging Face token is required. Set HF_TOKEN in backend/.env');
    }

    this.hf = new InferenceClient(apiToken);
  }

  async chat(messages) {
    try {
      const chatCompletion = await this.hf.chatCompletion({
        model: COPY_MODEL,
        messages,
      });

      const textResponse = chatCompletion?.choices?.[0]?.message?.content;
      if (!textResponse) {
        throw new Error('Hugging Face chat completion returned no message content');
      }

      return textResponse;
    } catch (err) {
      const status = err.status || err.response?.status;
      const errMsg = (err.message || '').toLowerCase();

      if (status === 401 || errMsg.includes('invalid username') || errMsg.includes('non-hugging face api key')) {
        throw new Error(
          'Invalid Hugging Face token. Set a valid HF_TOKEN in backend/.env (create one at https://huggingface.co/settings/tokens with Inference access).',
        );
      }
      if (status === 429 || errMsg.includes('rate limit')) {
        throw new Error('Hugging Face rate limit exceeded. Please try again later.');
      }
      if (status === 503 || errMsg.includes('loading')) {
        throw new Error('Hugging Face model is loading. Try again in 30 seconds.');
      }

      console.error('HF chat error:', err.message);
      throw new Error(`AI text generation failed: ${err.message}`);
    }
  }

  async generateMarketingAssets({ productName, productDescription, targetAudience, tone }) {
    const systemPrompt =
      'You are a senior marketing copywriter. Output ONLY valid JSON with these exact fields: ' +
      'adVariants (array of exactly 3 short ad copy strings), ' +
      'instagramCaption (engaging Instagram caption with emojis), ' +
      'facebookPost (conversational Facebook post), ' +
      'twitterPost (concise post under 280 chars), ' +
      'linkedinPost (professional LinkedIn post), ' +
      'hashtags (array of 5-8 relevant hashtags without # prefix), ' +
      'callToAction (one compelling CTA line). ' +
      'No text outside the JSON object.';

    const userPrompt =
      `Product Name: ${productName}\n` +
      `Product Description: ${productDescription}\n` +
      `Target Audience: ${targetAudience}\n` +
      `Tone: ${tone}\n\n` +
      'Generate platform-optimized marketing copy as JSON.';

    const textResponse = await this.chat([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ]);

    const parsed = JSON.parse(this.extractJson(textResponse));

    const required = ['adVariants', 'instagramCaption', 'facebookPost', 'twitterPost', 'linkedinPost', 'hashtags', 'callToAction'];
    for (const field of required) {
      if (!parsed[field]) {
        throw new Error(`AI response missing field: ${field}`);
      }
    }

    return {
      adVariants: parsed.adVariants.slice(0, 3),
      instagramCaption: String(parsed.instagramCaption),
      facebookPost: String(parsed.facebookPost),
      twitterPost: String(parsed.twitterPost).slice(0, 280),
      linkedinPost: String(parsed.linkedinPost),
      hashtags: parsed.hashtags.slice(0, 10).map((tag) => String(tag).replace(/^#/, '')),
      callToAction: String(parsed.callToAction),
    };
  }

  async refineImagePrompt({
    productName,
    productDescription,
    targetAudience,
    tone,
    visualStyle,
    background,
    lighting,
  }) {
    const systemPrompt =
      'You are an expert commercial product photographer writing prompts for AI image generators. ' +
      'Write ONE detailed photorealistic image prompt describing the product scene. ' +
      'Include product placement, camera angle, lens feel, lighting mood, and surface/background details. ' +
      'Output ONLY the prompt string. No JSON, no quotes, no explanation. ' +
      'Never include text overlays, watermarks, or logos in the scene.';

    const userPrompt =
      `Product: ${productName}\n` +
      `Description: ${productDescription}\n` +
      `Audience: ${targetAudience}\n` +
      `Campaign tone: ${tone}\n` +
      `Visual style: ${visualStyle}\n` +
      `Background: ${background}\n` +
      `Lighting: ${lighting}\n\n` +
      'Write a single photorealistic commercial product photography prompt.';

    const textResponse = await this.chat([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ]);

    return textResponse.trim().replace(/^["']|["']$/g, '');
  }

  extractJson(text) {
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace === -1 || lastBrace === -1) {
      throw new Error('Failed to parse AI response');
    }
    return text.slice(firstBrace, lastBrace + 1);
  }

  async generateImageBase64(imagePrompt, negativePrompt) {
    let lastError = null;

    for (const { model, endpoint } of HF_IMAGE_MODELS) {
      try {
        const imageBlob = await this.hf.textToImage(
          {
            model,
            inputs: imagePrompt,
            parameters: negativePrompt ? { negative_prompt: negativePrompt } : undefined,
          },
          { endpoint },
        );

        const buffer = Buffer.from(await imageBlob.arrayBuffer());
        return {
          imageUrl: `data:image/png;base64,${buffer.toString('base64')}`,
          modelUsed: model,
        };
      } catch (err) {
        lastError = err;
        console.warn(`HF image model ${model} failed`);
      }
    }

    throw new Error(`Image generation failed: ${lastError?.message || 'All models unavailable'}`);
  }
}

module.exports = HuggingFaceService;
