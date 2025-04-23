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

#### Định dạng Phản hồi
```json
{
  "translation": "Văn bản đã dịch ở đây"
}
```

## Bảo mật

- API keys được lưu trữ an toàn trên máy chủ, không bao giờ lộ ra cho client
- Bảo vệ CORS giới hạn yêu cầu từ các nguồn được phép (ID extension của bạn)
- Giới hạn tần suất để ngăn chặn lạm dụng

## Hướng dẫn Triển khai

### Thiết lập
1. Tạo thư mục dự án: `d:\SourceCode\translation-server`
2. Tạo tất cả các file được liệt kê trong thư mục đó
3. Sao chép `.env.example` thành `.env` và điền API keys của bạn
4. Đảm bảo cập nhật `ALLOWED_ORIGINS` trong `.env` với ID extension Chrome của bạn

### Triển khai VPS
1. Sao chép toàn bộ thư mục lên VPS
2. Cài đặt Docker và Docker Compose nếu chưa có
3. Điều chỉnh `docker-compose.yml` nếu cần (ví dụ: thay đổi port)
4. Chạy `docker-compose up -d` để khởi động server
5. Server sẽ lắng nghe trên port 3000 (hoặc port bạn đã cấu hình)

## Cấu trúc Dự án

- `src/index.js` - Điểm khởi đầu của ứng dụng, thiết lập Express server
- `src/routes/` - Chứa các định tuyến API
- `src/services/` - Chứa logic gọi đến các API dịch thuật (OpenAI, Microsoft)
- `src/utils/` - Các tiện ích như logging
- `docker-compose.yml` - Cấu hình Docker Compose để triển khai
- `.env` - Cấu hình môi trường và API keys (không đưa vào git)

Server này cung cấp một cách an toàn để gọi các API dịch thuật mà không lộ API key trong extension. Server cũng bao gồm các tính năng bảo mật như giới hạn tần suất, CORS, và logging để giám sát.

## Giấy phép

ISC
