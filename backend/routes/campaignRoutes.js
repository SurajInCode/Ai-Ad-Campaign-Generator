const express = require('express');
const HuggingFaceService = require('../services/huggingfaceService');
const Campaign = require('../models/Campaign');

const router = express.Router();
const huggingFaceService = new HuggingFaceService(process.env.HF_TOKEN);

router.post('/generate', async (req, res, next) => {
  try {
    const { productName, productDescription, targetAudience, tone } = req.body;

    if (!productName || !productDescription || !targetAudience || !tone) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields: productName, productDescription, targetAudience, tone',
      });
    }

    const marketingAssets = await huggingFaceService.generateMarketingAssets({
      productName,
      productDescription,
      targetAudience,
      tone,
    });

    const imageUrl = await huggingFaceService.generateImageBase64(marketingAssets.imagePrompt);

    const campaign = new Campaign({
      productName,
      productDescription,
      targetAudience,
      tone,
      marketingCopy: {
        adVariants: marketingAssets.adVariants,
        linkedinPost: marketingAssets.linkedinPost,
      },
      imagePrompt: marketingAssets.imagePrompt,
      generatedImageUrl: imageUrl,
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
