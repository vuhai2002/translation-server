const axios = require('axios');
const { logger } = require('../utils/logger');

/**
 * Fallback translator using Google's unofficial public endpoint.
 * Used only when the primary OpenAI-compatible translator fails.
 *
 * This endpoint is free, undocumented, and can change at any time —
 * treat it strictly as a best-effort fallback.
 *
 * @param {string} text - Text to translate
 * @param {string} targetLang - Target language code (e.g. 'vi', 'en', 'zh-CN')
 * @returns {Promise<string>} Translated text
 */
async function translateWithGoogleFallback(text, targetLang) {
  if (!text || typeof text !== 'string') {
    throw new Error('Invalid text provided');
  }

  const url =
    'https://translate.googleapis.com/translate_a/single' +
    `?client=gtx&sl=auto&tl=${encodeURIComponent(targetLang)}&dt=t&q=${encodeURIComponent(text)}`;

  try {
    const response = await axios.get(url, { timeout: 10000 });
    const result = response.data;

    // Google returns a nested array: [[ [translatedChunk, originalChunk, ...], ... ], detected, ...]
    if (!Array.isArray(result) || !Array.isArray(result[0])) {
      throw new Error('Unexpected Google Translate response shape');
    }

    const translated = result[0]
      .map((part) =>
        Array.isArray(part) && typeof part[0] === 'string' ? part[0] : ''
      )
      .join('')
      .trim();

    if (!translated) {
      throw new Error('Empty translation from Google fallback');
    }

    return translated;
  } catch (error) {
    logger.error(`Google fallback failed: ${error.message}`);
    throw error;
  }
}

module.exports = { translateWithGoogleFallback };
