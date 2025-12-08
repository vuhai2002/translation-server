FROM node:24-alpine

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./
RUN npm ci --only=production

# Bundle app source
COPY . .

# Create logs directory
RUN mkdir -p logs

# Expose the API port
EXPOSE 3000

# Run the server
CMD ["node", "src/index.js"]
