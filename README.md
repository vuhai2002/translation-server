# Translation Server

A secure proxy server for translation services like OpenAI and Microsoft Translator, built to support browser extensions without exposing API keys.

## Features

- Secure proxy for translation API calls
- Support for multiple translation services (OpenAI, Microsoft Translator)
- Built-in rate limiting and CORS protection
- Dockerized for easy deployment

## Requirements

- Node.js 16+ (if running locally)
- Docker and Docker Compose (for containerized deployment)

## Getting Started

### Local Development

1. Clone this repository
2. Copy `.env.example` to `.env` and fill in your API keys
3. Install dependencies:
   ```
   npm install
   ```
4. Start the development server:
   ```
   npm run dev
   ```

### Production Deployment with Docker

1. Clone this repository on your server
2. Copy `.env.example` to `.env` and fill in your API keys
3. Build and start the Docker container:
   ```
   docker-compose up -d
   ```

## API Endpoints

### Health Check
- `GET /api/health` - Check if the server is running

### Translation
- `POST /api/translate` - Translate text with default service (OpenAI)
- `POST /api/translate/openai` - Translate text with OpenAI
- `POST /api/translate/microsoft` - Translate text with Microsoft Translator

#### Request Body Format
```json
{
  "text": "Text to translate",
  "targetLang": "vi",
  "service": "openai" // Optional, defaults to OpenAI
}
```

#### Response Format
```json
{
  "translation": "Translated text here"
}
```

## Security

- API keys are stored securely on the server, never exposed to clients
- CORS protection limits requests to approved origins (your extension ID)
- Rate limiting prevents abuse

## License

ISC
