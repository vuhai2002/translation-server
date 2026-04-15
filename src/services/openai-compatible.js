const axios = require('axios');
const { logger } = require('../utils/logger');

/**
 * Translates text using an OpenAI-compatible chat completions endpoint.
 *
 * All connection details (base URL, API key, model) come from environment
 * variables — nothing is hardcoded. The base URL should point at the API
 * root that exposes /chat/completions (e.g. "https://host/v1").
 *
 * @param {string} text - Text to translate
 * @param {string} targetLang - Target language code or name (e.g. 'vi', 'en')
 * @returns {Promise<string>} Translated text
 */
async function translateWithOpenAICompatible(text, targetLang) {
  if (!text || typeof text !== 'string') {
    throw new Error('Invalid text provided');
  }

  const apiKey = process.env.TRANSLATOR_API_KEY;
  const baseUrl = process.env.TRANSLATOR_BASE_URL;
  const model = process.env.TRANSLATOR_MODEL;

  if (!apiKey || !baseUrl || !model) {
    throw new Error(
      'Translator credentials not configured — check TRANSLATOR_API_KEY, TRANSLATOR_BASE_URL, TRANSLATOR_MODEL in .env'
    );
  }

  // Preserve the original prompt tuned for high-fidelity translation.
  const prompt = `You are a professional bilingual translator who specializes in precise and context-preserving translations.
                    Your task is to translate the given text into ${targetLang} with 100% accuracy, preserving the exact meaning, tone, and nuance of the original text.
                    Do not paraphrase, simplify, or localize cultural expressions unless required for linguistic clarity. Keep all proper nouns, dates, formatting, and emphasis exactly as in the source.
                    Return ONLY the translated text in ${targetLang}, with no explanation, notes, or additional commentary.
                    Text to translate: ${text}`;

  // Normalize base URL (strip trailing slash) then append the standard path.
  const endpoint = `${baseUrl.replace(/\/+$/, '')}/chat/completions`;

  try {
    const response = await axios.post(
      endpoint,
      {
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 1.0,
        max_tokens: 2048
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 20000
      }
    );

    const content = response.data?.choices?.[0]?.message?.content;
    if (!content || typeof content !== 'string') {
      throw new Error('Unexpected response format from translator endpoint');
    }
    return content.trim();
  } catch (error) {
    if (error.response) {
      logger.error(
        `Translator API ${error.response.status}: ${JSON.stringify(error.response.data)}`
      );
      throw new Error(`Translator API error: ${error.response.status}`);
    }
    logger.error(`Translator request failed: ${error.message}`);
    throw error;
  }
}

module.exports = { translateWithOpenAICompatible };
