const axios = require('axios');

const DEFAULT_BASE_URL = process.env.A1111_BASE_URL || 'http://127.0.0.1:7860';

class LocalSdService {
  constructor(baseUrl = DEFAULT_BASE_URL) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  async isAvailable() {
    try {
      const response = await axios.get(`${this.baseUrl}/sdapi/v1/sd-models`, {
        timeout: 3000,
      });
      return response.status === 200;
    } catch {
      return false;
    }
  }

  async generateTextToImage(prompt, negativePrompt, seed = -1) {
    const payload = {
      prompt,
      negative_prompt: negativePrompt,
      steps: 28,
      width: 512,
      height: 512,
      cfg_scale: 7.5,
      sampler_name: 'DPM++ 2M Karras',
      seed,
      batch_size: 1,
      n_iter: 1,
    };

    const response = await axios.post(`${this.baseUrl}/sdapi/v1/txt2img`, payload, {
      timeout: 300000,
    });

    const imageBase64 = response.data?.images?.[0];
    if (!imageBase64) {
      throw new Error('Local Stable Diffusion returned no image');
    }

    return `data:image/png;base64,${imageBase64}`;
  }

  async generateImageToImage(prompt, negativePrompt, initImageBase64, denoisingStrength = 0.45) {
    const initImage = initImageBase64.replace(/^data:image\/\w+;base64,/, '');

    const payload = {
      prompt,
      negative_prompt: negativePrompt,
      init_images: [initImage],
      denoising_strength: denoisingStrength,
      steps: 28,
      width: 512,
      height: 512,
      cfg_scale: 7.5,
      sampler_name: 'DPM++ 2M Karras',
      seed: -1,
      batch_size: 1,
      n_iter: 1,
    };

    const response = await axios.post(`${this.baseUrl}/sdapi/v1/img2img`, payload, {
      timeout: 300000,
    });

    const imageBase64 = response.data?.images?.[0];
    if (!imageBase64) {
      throw new Error('Local img2img returned no image');
    }

    return `data:image/png;base64,${imageBase64}`;
  }
}

module.exports = LocalSdService;
