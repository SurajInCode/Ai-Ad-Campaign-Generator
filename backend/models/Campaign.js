const mongoose = require('mongoose');

const marketingCopySchema = new mongoose.Schema({
  adVariants: {
    type: [String],
    default: [],
  },
  instagramCaption: {
    type: String,
    default: '',
  },
  facebookPost: {
    type: String,
    default: '',
  },
  twitterPost: {
    type: String,
    default: '',
  },
  linkedinPost: {
    type: String,
    default: '',
  },
  hashtags: {
    type: [String],
    default: [],
  },
  callToAction: {
    type: String,
    default: '',
  },
});

const campaignSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 120,
  },
  productDescription: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000,
  },
  targetAudience: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  tone: {
    type: String,
    required: true,
    trim: true,
  },
  visualStyle: {
    type: String,
    default: 'Studio',
    trim: true,
  },
  background: {
    type: String,
    default: 'White seamless',
    trim: true,
  },
  lighting: {
    type: String,
    default: 'Soft studio',
    trim: true,
  },
  marketingCopy: {
    type: marketingCopySchema,
    required: true,
  },
  imagePrompt: {
    type: String,
    required: true,
    trim: true,
  },
  negativePrompt: {
    type: String,
    default: '',
    trim: true,
  },
  imageModel: {
    type: String,
    default: '',
    trim: true,
  },
  generatedImageUrl: {
    type: String,
    required: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

module.exports = mongoose.model('Campaign', campaignSchema);
