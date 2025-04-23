const axios = require('axios');
const { logger } = require('../utils/logger');

/**
 * Translates text using OpenAI's models
 * 
 * @param {string} text - The text to translate
 * @param {string} targetLang - The target language code (e.g., 'vi', 'en')
 * @returns {Promise<string>} - The translated text
 */
async function translateWithOpenAI(text, targetLang) {
  try {
    // Validate input
    if (!text || typeof text !== 'string') {
      throw new Error('Invalid text provided');
    }
    
    // Check API key is set
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }
    
    // Prepare the prompt
    const prompt = `Dịch chính xác và giữ nguyên ý nghĩa gốc của từ hoặc đoạn sau sang ${targetLang}, trả về đúng kết quả. Trả lời bằng ${targetLang}: ${text}`;
    
    // Make the request to OpenAI
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4.1-nano', // Use appropriate model
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 1000
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    // Extract and return the translated text
    if (response.data?.choices && response.data.choices.length > 0) {
      return response.data.choices[0].message.content.trim();
    } else {
      throw new Error('Unexpected response format from OpenAI');
    }
  } catch (error) {
    logger.error(`OpenAI translation error: ${error.message}`);
    // If it's an Axios error, provide more details
    if (error.response) {
      logger.error(`Status: ${error.response.status}, Data: ${JSON.stringify(error.response.data)}`);
      throw new Error(`OpenAI API error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
    }
    throw error;
  }
}

module.exports = { translateWithOpenAI };
