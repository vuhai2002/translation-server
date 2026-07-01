# Translation Server

A secure proxy server that forwards translation requests from the browser
extension to an **OpenAI-compatible** chat completions endpoint, with an
automatic fallback to Google's unofficial endpoint when the primary
service is unavailable. API keys stay server-side.

## Features

- Proxy for any OpenAI-compatible chat completions API (base URL + model + key)
- Automatic fallback to Google unofficial when the primary fails
- Rate limiting (per IP + User-Agent) and CORS protection
- Structured logging (Winston) with log rotation in production
- Dockerized with localhost-only port binding and resource limits

## Requirements

- Node.js 20+ (if running locally)
- pnpm (via Corepack -- run `corepack enable` once; the exact version is pinned in `package.json`)
- Docker and Docker Compose (for containerized deployment)

## Getting Started

### Local Development

1. Clone this repository
2. Copy `.env.example` to `.env` and fill in your API keys
3. Install dependencies:
   ```
   pnpm install
   ```
4. Start the development server:
   ```
   pnpm run dev
   ```

### Production Deployment with Docker

Production runs on the VPS behind Cloudflare + Caddy, bound to host port
`127.0.0.1:3002`. See [DEPLOY.md](DEPLOY.md) for the full guide (Cloudflare
record, Caddy block, secrets, `deploy.sh`). On the server:

```
cp .env.production.example .env.production   # then fill in + chmod 600
bash deploy.sh
```

## Chạy và Kiểm thử

### Bước 1: Cài đặt Các Phụ thuộc
Đầu tiên, bạn cần cài đặt các phụ thuộc của dự án:
```
cd d:\SourceCode\translation-server
pnpm install
```

### Bước 2: Chạy Server
Bạn có thể chạy server theo hai cách:

#### Cách 1: Chạy trực tiếp với Node.js
Chạy ở chế độ development với nodemon (tự động khởi động lại khi code thay đổi):
```
pnpm run dev
```

Hoặc chạy ở chế độ production:
```
pnpm start
```

#### Cách 2: Chạy với Docker (production)
Triển khai production dùng `docker-compose.prod.yml` + `deploy.sh` (xem
[DEPLOY.md](DEPLOY.md)). Chạy thử bằng Docker (cần `.env.production`):
```
docker compose -f docker-compose.prod.yml up -d --build
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

Dịch văn bản (primary → fallback tự động):
```
curl -X POST http://localhost:3000/api/translate \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello, how are you?", "targetLang": "vi"}'
```

Phản hồi trả về:
```json
{ "translation": "Xin chào, bạn khỏe không?", "source": "ai" }
```

Nếu primary lỗi, `source` sẽ là `"google-fallback"`.

**Sử dụng Postman:**
1. POST đến `http://localhost:3000/api/translate`
2. Header: `Content-Type: application/json`
3. Body (raw JSON):
   ```json
   {
     "text": "Hello, how are you?",
     "targetLang": "vi"
   }
   ```

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
- Endpoint trả về JSON:
  ```json
  { "translation": "Xin chào, bạn khỏe không?", "source": "ai" }
  ```
  Hoặc nếu cả primary lẫn fallback đều lỗi:
  ```json
  { "error": "Translation service unavailable" }
  ```

## API Endpoints

### Health Check
- `GET /api/health` - Kiểm tra server đang chạy

### Translation
- `POST /api/translate` - Dịch văn bản qua endpoint OpenAI-compatible, fallback Google khi lỗi

#### Request Body
```json
{
  "text": "Text to translate",
  "targetLang": "vi"
}
```

#### Response
```json
{
  "translation": "Văn bản đã dịch",
  "source": "ai"
}
```
Trường `source` cho biết bản dịch đến từ đâu:
- `ai` — primary OpenAI-compatible endpoint
- `google-fallback` — Google unofficial (khi primary lỗi)

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
Chi tiết đầy đủ ở [DEPLOY.md](DEPLOY.md). Tóm tắt:
1. Cloudflare: tạo record `translate-api.vuhai.io.vn` (proxied) -> IP VPS, SSL Full.
2. Caddy: thêm site block -> `127.0.0.1:3002` (xem DEPLOY.md), rồi `sudo systemctl reload caddy`.
3. Clone repo vào `/opt/apps/translation-server`, tạo `.env.production` (chmod 600).
4. `bash deploy.sh` (git pull -> build -> up --wait -> health). Container bind `127.0.0.1:3002:3000`.

## Cấu trúc Dự án

- `src/index.js` - Điểm khởi đầu, thiết lập Express server, middleware, rate limiter
- `src/routes/` - Định tuyến API (`health.js`, `translation.js`)
- `src/services/openai-compatible.js` - Gọi primary endpoint OpenAI-compatible (cấu hình qua env)
- `src/services/google-fallback.js` - Fallback qua Google unofficial
- `src/utils/logger.js` - Winston logger với log rotation
- `docker-compose.prod.yml` - Docker Compose production: bind `127.0.0.1:3002`, hardening + resource/log limits
- `.env` - `TRANSLATOR_BASE_URL` / `TRANSLATOR_API_KEY` / `TRANSLATOR_MODEL` (không commit)

Server này cung cấp một cách an toàn để gọi các API dịch thuật mà không lộ API key trong extension. Server cũng bao gồm các tính năng bảo mật như giới hạn tần suất, CORS, và logging để giám sát.

## Giấy phép

ISC
