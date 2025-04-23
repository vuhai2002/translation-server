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

## Chạy và Kiểm thử

### Bước 1: Cài đặt Các Phụ thuộc
Đầu tiên, bạn cần cài đặt các phụ thuộc của dự án:
```
cd d:\SourceCode\translation-server
npm install
```

### Bước 2: Chạy Server
Bạn có thể chạy server theo hai cách:

#### Cách 1: Chạy trực tiếp với Node.js
Chạy ở chế độ development với nodemon (tự động khởi động lại khi code thay đổi):
```
npm run dev
```

Hoặc chạy ở chế độ production:
```
npm start
```

#### Cách 2: Chạy với Docker
Chạy server trong container Docker trên cổng 3000:
```
docker-compose up -d
```

### Bước 3: Kiểm thử API

#### Kiểm tra Endpoint Health
```
curl http://localhost:3000/api/health
```
Hoặc mở trình duyệt và truy cập: http://localhost:3000/api/health

#### Kiểm thử API Dịch thuật
Bạn có thể kiểm thử API dịch thuật bằng các công cụ như Postman, curl, hoặc bất kỳ HTTP client nào:

**Sử dụng curl:**

Dịch văn bản với OpenAI (mặc định):
```
curl -X POST http://localhost:3000/api/translate \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello, how are you?", "targetLang": "vi"}'
```

Dịch văn bản với Microsoft Translator:
```
curl -X POST http://localhost:3000/api/translate/microsoft \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello, how are you?", "targetLang": "vi"}'
```

Chỉ định dịch vụ trong yêu cầu:
```
curl -X POST http://localhost:3000/api/translate \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello, how are you?", "targetLang": "vi", "service": "microsoft"}'
```

**Sử dụng Postman:**
1. Tạo một yêu cầu POST đến http://localhost:3000/api/translate
2. Đặt header Content-Type là application/json
3. Trong tab Body, chọn "raw" và định dạng JSON, sau đó nhập:
   ```json
   {
     "text": "Hello, how are you?",
     "targetLang": "vi",
     "service": "openai"
   }
   ```
4. Gửi yêu cầu và kiểm tra phản hồi

### Kiểm tra Logs
Logs sẽ được hiển thị trong console và (trong chế độ production) được lưu trong thư mục logs:
- `logs/error.log`: Chỉ chứa lỗi
- `logs/combined.log`: Chứa tất cả các cấp độ log

### Kiểm thử với Tiện ích mở rộng
Nếu bạn đang phát triển tiện ích mở rộng Chrome:
1. Đảm bảo rằng ID tiện ích của bạn đã được liệt kê trong `ALLOWED_ORIGINS` trong tệp `.env`
2. Từ tiện ích của bạn, gửi yêu cầu đến `http://yourserver:3000/api/translate` với các tham số tương tự như trong các ví dụ trên

### Lưu ý
- Các khóa API thực tế không bao giờ được tiết lộ cho client, chỉ được sử dụng trên server
- Server được cấu hình với giới hạn tần suất để ngăn chặn lạm dụng API
- Tất cả các yêu cầu phải tuân theo định dạng JSON chính xác như trong các ví dụ
- Các endpoint API chính sẽ trả về kết quả theo định dạng:
  ```json
  {
    "translation": "Xin chào, bạn khỏe không?"
  }
  ```
  Hoặc nếu có lỗi:
  ```json
  {
    "error": "Lỗi dịch vụ dịch thuật",
    "details": "Chi tiết lỗi ở đây"
  }
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
