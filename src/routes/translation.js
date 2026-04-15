const express = require('express');
const { translateWithOpenAICompatible } = require('../services/openai-compatible');
const { translateWithGoogleFallback } = require('../services/google-fallback');
const { logger } = require('../utils/logger');

const router = express.Router();

/**
 * POST /api/translate
 * Body: { text: string, targetLang: string }
 *
 * Flow:
 *   1. Try the primary OpenAI-compatible translator.
 *   2. If it fails for any reason, fall back to the Google unofficial endpoint.
 *   3. If both fail, return 500.
 *
 * Response: { translation: string, source: 'ai' | 'google-fallback' }
 */
router.post('/', async (req, res) => {
  const { text, targetLang } = req.body;

  if (!text || !targetLang) {
    return res
      .status(400)
      .json({ error: 'Missing required parameters: text and targetLang' });
  }

  // Primary: OpenAI-compatible translator
  try {
    const translation = await translateWithOpenAICompatible(text, targetLang);
    logger.info(`Translated to ${targetLang} via primary (AI) translator`);
    return res.json({ translation, source: 'ai' });
  } catch (primaryError) {
    logger.warn(
      `Primary translator failed (${primaryError.message}); falling back to Google unofficial`
    );
  }

  // Fallback: Google unofficial
  try {
    const translation = await translateWithGoogleFallback(text, targetLang);
    logger.info(`Translated to ${targetLang} via Google fallback`);
    return res.json({ translation, source: 'google-fallback' });
  } catch (fallbackError) {
    logger.error(`Fallback translator also failed: ${fallbackError.message}`);
    return res
      .status(500)
      .json({ error: 'Translation service unavailable' });
  }
});

module.exports = router;
