const express = require('express');
const { translateWithOpenAI } = require('../services/openai');
const { translateWithMicrosoft } = require('../services/microsoft');
const { logger } = require('../utils/logger');

const router = express.Router();

// Route to translate text using OpenAI
router.post('/openai', async (req, res) => {
  try {
    const { text, targetLang } = req.body;
    
    if (!text || !targetLang) {
      return res.status(400).json({ error: 'Missing required parameters: text and targetLang' });
    }
    
    logger.info(`Translating to ${targetLang} using OpenAI`);
    const translatedText = await translateWithOpenAI(text, targetLang);
    
    return res.json({ translation: translatedText });
  } catch (error) {
    logger.error(`OpenAI translation error: ${error.message}`);
    return res.status(500).json({ error: 'Translation service error', details: error.message });
  }
});

// Route to translate text using Microsoft Translator
router.post('/microsoft', async (req, res) => {
  try {
    const { text, targetLang } = req.body;
    
    if (!text || !targetLang) {
      return res.status(400).json({ error: 'Missing required parameters: text and targetLang' });
    }
    
    logger.info(`Translating to ${targetLang} using Microsoft`);
    const translatedText = await translateWithMicrosoft(text, targetLang);
    
    return res.json({ translation: translatedText });
  } catch (error) {
    logger.error(`Microsoft translation error: ${error.message}`);
    return res.status(500).json({ error: 'Translation service error', details: error.message });
  }
});

// Default translation route - choose service based on configuration or fallback
router.post('/', async (req, res) => {
  try {
    const { text, targetLang, service } = req.body;
    
    if (!text || !targetLang) {
      return res.status(400).json({ error: 'Missing required parameters: text and targetLang' });
    }
    
    // Determine which service to use (default to OpenAI if not specified)
    const translationService = service?.toLowerCase() === 'microsoft' ? 'microsoft' : 'openai';
    logger.info(`Translating to ${targetLang} using ${translationService}`);
    
    let translatedText;
    if (translationService === 'microsoft') {
      translatedText = await translateWithMicrosoft(text, targetLang);
    } else {
      translatedText = await translateWithOpenAI(text, targetLang);
    }
    
    return res.json({ translation: translatedText });
  } catch (error) {
    logger.error(`Translation error: ${error.message}`);
    return res.status(500).json({ error: 'Translation service error', details: error.message });
  }
});

module.exports = router;
