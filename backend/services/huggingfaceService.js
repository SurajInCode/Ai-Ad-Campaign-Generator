const { InferenceClient } = require('@huggingface/inference');

const COPY_MODEL = 'Qwen/Qwen2.5-7B-Instruct:fastest';
const IMAGE_PROMPT_MODEL = 'Qwen/Qwen2.5-7B-Instruct:fastest';

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
      throw new Error('Hugging Face token is required for HuggingFaceService');
    }

    this.hf = new InferenceClient(apiToken);
    this.apiToken = apiToken;
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
      if (err.response?.status === 429) {
        throw new Error('Hugging Face rate limit exceeded (429)');
      }
      if (err.response?.status === 503) {
        throw new Error('Hugging Face model is loading or unavailable (503). Try again in 30 seconds.');
      }
      throw new Error(`Hugging Face generation failed: ${err.message}`);
    }
  }

  async generateMarketingAssets({ productName, productDescription, targetAudience, tone }) {
    const systemPrompt =
      'You are a marketing content generator. Output ONLY valid JSON with these fields: ' +
      'adVariants (array of exactly 3 concise ad copy strings), linkedinPost (one professional LinkedIn post). ' +
      'Do not include any explanation outside the JSON object.';
    const userPrompt =
      `Product Name: ${productName}\n` +
      `Product Description: ${productDescription}\n` +
      `Target Audience: ${targetAudience}\n` +
      `Tone: ${tone}\n\n` +
      'Generate the requested JSON output exactly as instructed.';

    const textResponse = await this.chat([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ]);

    const parsed = JSON.parse(this.extractJson(textResponse));

    if (!parsed.adVariants || !parsed.linkedinPost) {
      throw new Error('Hugging Face response did not include required marketing fields');
    }

    return {
      adVariants: parsed.adVariants,
      linkedinPost: parsed.linkedinPost,
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
      throw new Error('Failed to locate JSON in Hugging Face response');
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
        return `data:image/png;base64,${buffer.toString('base64')}`;
      } catch (err) {
        lastError = err;
        console.warn(`HF image model ${model} failed: ${err.message}`);
      }
    }

    throw new Error(`Hugging Face image generation failed: ${lastError?.message || 'All models unavailable'}`);
  }
}

module.exports = HuggingFaceService;
