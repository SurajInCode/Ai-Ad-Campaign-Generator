const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { validateHfToken } = require('../utils/validateHfToken');

(async () => {
  const token = (process.env.HF_TOKEN || '').trim();
  console.log('HF_TOKEN length:', token.length);
  console.log('HF_TOKEN starts with hf_:', token.startsWith('hf_'));

  const result = await validateHfToken(token);
  if (result.valid) {
    console.log('✅ Token is valid and verified with Hugging Face');
    process.exit(0);
  }

  console.log('❌', result.message);
  console.log('\nFix: edit backend/.env (NOT .env.example) and set HF_TOKEN=hf_your_token');
  process.exit(1);
})();
