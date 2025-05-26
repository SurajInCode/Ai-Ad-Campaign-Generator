const { InferenceClient } = require('@huggingface/inference');

class HuggingFaceService {
  constructor(apiToken) {
    if (!apiToken) {
      throw new Error('Hugging Face token is required for HuggingFaceService');
    }

    this.hf = new InferenceClient(apiToken);
    this.apiToken = apiToken;
  }

  async generateMarketingAssets({ productName, productDescription, targetAudience, tone }) {
    const model = 'Qwen/Qwen2.5-7B-Instruct:fastest';
    const systemPrompt = `You are a marketing content generator. Output ONLY valid JSON with the following fields: adVariants (array of 3 concise ad copy strings), linkedinPost (one professional LinkedIn post), imagePrompt (one detailed text prompt for an image generator). Do not include any explanation, analysis, or text outside the JSON object. Format must be strict JSON.`;
    const userPrompt = `Product Name: ${productName}\nProduct Description: ${productDescription}\nTarget Audience: ${targetAudience}\nTone: ${tone}\n\nGenerate the requested JSON output exactly as instructed.`;

    try {
      const chatCompletion = await this.hf.chatCompletion({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      });

      const textResponse = chatCompletion?.choices?.[0]?.message?.content;
      if (!textResponse) {
        throw new Error('Hugging Face chat completion returned no message content');
      }

      const jsonString = this.extractJson(textResponse);
      const parsed = JSON.parse(jsonString);

      if (!parsed.adVariants || !parsed.linkedinPost || !parsed.imagePrompt) {
        throw new Error('Hugging Face response did not include required marketing fields');
      }

      return {
        adVariants: parsed.adVariants,
        linkedinPost: parsed.linkedinPost,
        imagePrompt: parsed.imagePrompt,
      };
    } catch (err) {
      if (err.response) {
        if (err.response.status === 429) {
          throw new Error('Hugging Face rate limit exceeded (429)');
        }
        if (err.response.status === 503) {
          throw new Error('Hugging Face model is loading or unavailable (503)');
        }
      }
      throw new Error(`Hugging Face generation failed: ${err.message}`);
    }
  }

  extractJson(text) {
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace === -1 || lastBrace === -1) {
      throw new Error('Failed to locate JSON in Hugging Face response');
    }
    return text.slice(firstBrace, lastBrace + 1);
  }

  async generateImageBase64(imagePrompt) {
    try {
      const imageBlob = await this.hf.textToImage({
        model: 'black-forest-labs/FLUX.1-schnell',
        inputs: imagePrompt
      }, {
        endpoint: 'https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell'
      });

      const buffer = Buffer.from(await imageBlob.arrayBuffer());
      return `data:image/png;base64,${buffer.toString('base64')}`;
    } catch (err) {
      throw new Error(`Hugging Face image generation failed: ${err.message}`);
    }
  }
}

module.exports = HuggingFaceService;
