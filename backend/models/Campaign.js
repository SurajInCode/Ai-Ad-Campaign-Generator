const mongoose = require('mongoose');

const marketingCopySchema = new mongoose.Schema({
  adVariants: {
    type: [String],
    default: [],
  },
  linkedinPost: {
    type: String,
    default: '',
  },
});

const campaignSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: true,
    trim: true,
  },
  productDescription: {
    type: String,
    required: true,
    trim: true,
  },
  targetAudience: {
    type: String,
    required: true,
    trim: true,
  },
  tone: {
    type: String,
    required: true,
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
  generatedImageUrl: {
    type: String,
    required: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Campaign', campaignSchema);
