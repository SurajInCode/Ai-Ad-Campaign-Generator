const sharp = require('sharp');
const { buildImagePrompt, getNegativePrompt } = require('./promptBuilder');

class ImageService {
  constructor(huggingFaceService) {
    this.huggingFaceService = huggingFaceService;
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

  async generateImage({ baseImagePrompt, visualStyle, background, lighting }) {
    const fullPrompt = buildImagePrompt(baseImagePrompt, {
      style: visualStyle,
      background,
      lighting,
    });
    const negativePrompt = getNegativePrompt();

    const { imageUrl, modelUsed } = await this.huggingFaceService.generateImageBase64(
      fullPrompt,
      negativePrompt,
    );
    const enhancedImageUrl = await this.enhanceImage(imageUrl);

    return {
      imagePrompt: fullPrompt,
      negativePrompt,
      generatedImageUrl: enhancedImageUrl,
      imageModel: modelUsed,
    };
  }
}

module.exports = ImageService;
