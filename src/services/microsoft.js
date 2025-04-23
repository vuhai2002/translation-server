const axios = require('axios');
const { logger } = require('../utils/logger');

/**
 * Translates text using Microsoft Translator API
 * 
 * @param {string} text - The text to translate
 * @param {string} targetLang - The target language code (e.g., 'vi', 'en')
 * @returns {Promise<string>} - The translated text
 */
async function translateWithMicrosoft(text, targetLang) {
  try {
    // Validate input
    if (!text || typeof text !== 'string') {
      throw new Error('Invalid text provided');
    }
    
    // Check API key and region are set
    const apiKey = process.env.MICROSOFT_TRANSLATOR_KEY;
    const region = process.env.MICROSOFT_TRANSLATOR_REGION || 'southeastasia';
    
    if (!apiKey) {
      throw new Error('Microsoft Translator API key not configured');
    }
    
    // Format language code - Microsoft uses 'zh-Hans' instead of 'zh', etc.
    // Add any necessary mappings here
    const formattedLang = targetLang;
    
    // Make the request to Microsoft Translator
    const response = await axios.post(
      `https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&to=${formattedLang}`,
      [{ text }],
      {
        headers: {
          'Ocp-Apim-Subscription-Key': apiKey,
          'Ocp-Apim-Subscription-Region': region,
          'Content-Type': 'application/json'
        }
      }
    );
    
    // Extract and return the translated text
    if (response.data && response.data.length > 0 && response.data[0].translations && response.data[0].translations.length > 0) {
      return response.data[0].translations[0].text;
    } else {
      throw new Error('Unexpected response format from Microsoft Translator');
    }
  } catch (error) {
    logger.error(`Microsoft translation error: ${error.message}`);
    // If it's an Axios error, provide more details
    if (error.response) {
      logger.error(`Status: ${error.response.status}, Data: ${JSON.stringify(error.response.data)}`);
      throw new Error(`Microsoft API error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
    }
    throw error;
  }
}

module.exports = { translateWithMicrosoft };
