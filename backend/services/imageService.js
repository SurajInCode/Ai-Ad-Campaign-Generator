const sharp = require('sharp');
const LocalSdService = require('./localSdService');
const { buildImagePrompt, getNegativePrompt } = require('./promptBuilder');

class ImageService {
  constructor(huggingFaceService) {
    this.huggingFaceService = huggingFaceService;
    this.localSdService = new LocalSdService();
  }

  async checkLocalAvailability() {
    return this.localSdService.isAvailable();
  }

  async enhanceImage(dataUrl) {
    const base64 = dataUrl.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64, 'base64');

    const enhanced = await sharp(buffer)
      .sharpen({ sigma: 0.8 })
      .modulate({ brightness: 1.02, saturation: 1.05 })
      .png()
      .toBuffer();

    return `data:image/png;base64,${enhanced.toString('base64')}`;
  }

  async generateImages({
    baseImagePrompt,
    visualStyle,
    background,
    lighting,
    imageEngine,
    productImageBase64,
  }) {
    const fullPrompt = buildImagePrompt(baseImagePrompt, {
      style: visualStyle,
      background,
      lighting,
    });
    const negativePrompt = getNegativePrompt();

    let imageVariants = [];

    if (imageEngine === 'local') {
      const localAvailable = await this.localSdService.isAvailable();
      if (!localAvailable) {
        throw new Error(
          'Local GPU engine is not running. Start Automatic1111 with --api on port 7860, or switch to Hugging Face.',
        );
      }

      const seeds = [42, 1337];
      for (const seed of seeds) {
        let imageUrl;
        if (productImageBase64) {
          imageUrl = await this.localSdService.generateImageToImage(
            fullPrompt,
            negativePrompt,
            productImageBase64,
          );
        } else {
          imageUrl = await this.localSdService.generateTextToImage(
            fullPrompt,
            negativePrompt,
            seed,
          );
        }
        imageVariants.push(await this.enhanceImage(imageUrl));
      }
    } else {
      const imageUrl = await this.huggingFaceService.generateImageBase64(fullPrompt, negativePrompt);
      imageVariants.push(await this.enhanceImage(imageUrl));
    }

    return {
      imagePrompt: fullPrompt,
      negativePrompt,
      imageVariants,
      generatedImageUrl: imageVariants[0],
    };
  }
}

module.exports = ImageService;
