async function validateHfToken(token) {
  const trimmed = (token || '').trim();

  if (!trimmed || trimmed.includes('your_huggingface') || trimmed.includes('token_here')) {
    return {
      valid: false,
      message: 'HF_TOKEN is missing or still set to the placeholder. Update backend/.env with your real token from https://huggingface.co/settings/tokens',
    };
  }

  if (!trimmed.startsWith('hf_') || trimmed.length < 30) {
    return {
      valid: false,
      message: 'HF_TOKEN looks invalid. Hugging Face tokens start with "hf_" and are longer than 30 characters.',
    };
  }

  try {
    const response = await fetch('https://huggingface.co/api/whoami-v2', {
      headers: { Authorization: `Bearer ${trimmed}` },
    });

    if (response.status === 401) {
      return {
        valid: false,
        message: 'HF_TOKEN was rejected by Hugging Face (401). Create a new token at https://huggingface.co/settings/tokens with "Inference" permission.',
      };
    }

    if (!response.ok) {
      return {
        valid: false,
        message: `Could not verify HF_TOKEN (HTTP ${response.status}). Check your network and try again.`,
      };
    }

    return { valid: true, message: 'Hugging Face token verified' };
  } catch {
    return {
      valid: false,
      message: 'Could not reach Hugging Face to verify your token. Check your internet connection.',
    };
  }
}

module.exports = { validateHfToken };
