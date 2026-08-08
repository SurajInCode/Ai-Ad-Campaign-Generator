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
  imageEngine: {
    type: String,
    enum: ['huggingface', 'local'],
    default: 'huggingface',
  },
  hasProductReference: {
    type: Boolean,
    default: false,
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
  imageVariants: {
    type: [String],
    default: [],
  },
  selectedImageIndex: {
    type: Number,
    default: 0,
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
