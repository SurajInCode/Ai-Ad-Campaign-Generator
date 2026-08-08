const express = require('express');
const HuggingFaceService = require('../services/huggingfaceService');
const ImageService = require('../services/imageService');
const Campaign = require('../models/Campaign');

const router = express.Router();

let huggingFaceService;
let imageService;

function getServices() {
  if (!huggingFaceService) {
    huggingFaceService = new HuggingFaceService(process.env.HF_TOKEN);
    imageService = new ImageService(huggingFaceService);
  }
  return { huggingFaceService, imageService };
}

router.get('/local-status', async (req, res) => {
  try {
    const { imageService: svc } = getServices();
    const available = await svc.checkLocalAvailability();
    res.status(200).json({
      status: 'success',
      data: {
        available,
        message: available
          ? 'Local Stable Diffusion (A1111) is running on port 7860'
          : 'Local GPU not detected. Start A1111 with: ./webui.sh --api --medvram --opt-sdp-attention',
      },
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

router.post('/generate', async (req, res, next) => {
  try {
    const {
      productName,
      productDescription,
      targetAudience,
      tone,
      visualStyle = 'Studio',
      background = 'White seamless',
      lighting = 'Soft studio',
      imageEngine = 'huggingface',
      productImageBase64,
    } = req.body;

    if (!productName || !productDescription || !targetAudience || !tone) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields: productName, productDescription, targetAudience, tone',
      });
    }

    const { huggingFaceService: hf, imageService: imgSvc } = getServices();

    const marketingAssets = await hf.generateMarketingAssets({
      productName,
      productDescription,
      targetAudience,
      tone,
    });

    const baseImagePrompt = await hf.refineImagePrompt({
      productName,
      productDescription,
      targetAudience,
      tone,
      visualStyle,
      background,
      lighting,
    });

    const imageResult = await imgSvc.generateImages({
      baseImagePrompt,
      visualStyle,
      background,
      lighting,
      imageEngine,
      productImageBase64: productImageBase64 || null,
    });

    const campaign = new Campaign({
      productName,
      productDescription,
      targetAudience,
      tone,
      visualStyle,
      background,
      lighting,
      imageEngine,
      marketingCopy: {
        adVariants: marketingAssets.adVariants,
        linkedinPost: marketingAssets.linkedinPost,
      },
      imagePrompt: imageResult.imagePrompt,
      negativePrompt: imageResult.negativePrompt,
      imageVariants: imageResult.imageVariants,
      selectedImageIndex: 0,
      generatedImageUrl: imageResult.generatedImageUrl,
      hasProductReference: Boolean(productImageBase64),
    });

    const savedCampaign = await campaign.save();

    return res.status(201).json({
      status: 'success',
      data: savedCampaign,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
