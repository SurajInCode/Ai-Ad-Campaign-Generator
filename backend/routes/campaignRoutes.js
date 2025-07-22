const express = require('express');
const HuggingFaceService = require('../services/huggingfaceService');
const ImageService = require('../services/imageService');
const Campaign = require('../models/Campaign');
const { validateCampaignInput } = require('../middleware/validateCampaign');
const { generateLimiter } = require('../middleware/rateLimiter');
const { validateHfToken } = require('../utils/validateHfToken');

const router = express.Router();

let huggingFaceService;
let imageService;

function getServices() {
  if (!huggingFaceService) {
    const token = (process.env.HF_TOKEN || '').trim();
    huggingFaceService = new HuggingFaceService(token);
    imageService = new ImageService(huggingFaceService);
  }
  return { huggingFaceService, imageService };
}

router.get('/', async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 20);
    const campaigns = await Campaign.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('-generatedImageUrl -imagePrompt -negativePrompt')
      .lean();

    res.status(200).json({ status: 'success', data: campaigns });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const campaign = await Campaign.findById(req.params.id).lean();
    if (!campaign) {
      return res.status(404).json({ status: 'error', message: 'Campaign not found' });
    }
    res.status(200).json({ status: 'success', data: campaign });
  } catch (error) {
    next(error);
  }
});

router.post('/generate', generateLimiter, async (req, res, next) => {
  try {
    const hfCheck = await validateHfToken(process.env.HF_TOKEN);
    if (!hfCheck.valid) {
      return res.status(503).json({ status: 'error', message: hfCheck.message });
    }

    const { errors, data } = validateCampaignInput(req.body);

    if (errors.length > 0) {
      return res.status(400).json({ status: 'error', message: errors.join(', ') });
    }

    const { huggingFaceService: hf, imageService: imgSvc } = getServices();

    const marketingAssets = await hf.generateMarketingAssets(data);

    const baseImagePrompt = await hf.refineImagePrompt(data);

    const imageResult = await imgSvc.generateImage({
      baseImagePrompt,
      visualStyle: data.visualStyle,
      background: data.background,
      lighting: data.lighting,
    });

    const campaign = new Campaign({
      ...data,
      marketingCopy: marketingAssets,
      imagePrompt: imageResult.imagePrompt,
      negativePrompt: imageResult.negativePrompt,
      imageModel: imageResult.imageModel,
      generatedImageUrl: imageResult.generatedImageUrl,
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
