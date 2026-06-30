FROM node:24-alpine

# Create app directory
WORKDIR /app

# Enable Corepack so the pnpm version pinned in package.json ("packageManager")
# is used for the install -- no global pnpm, no version drift.
RUN corepack enable

# Install production dependencies with a frozen lockfile (no network
# re-resolution; fails if the lockfile is stale vs package.json). Copy the
# manifest, lockfile and pnpm config first to maximize Docker layer caching.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
RUN pnpm install --prod --frozen-lockfile

# Bundle app source
COPY . .

# Create logs directory
RUN mkdir -p logs

# Expose the API port
EXPOSE 3000

# Run the server
CMD ["node", "src/index.js"]
