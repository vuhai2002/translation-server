# syntax=docker/dockerfile:1.7
FROM node:24-alpine

ENV NODE_ENV=production

# Create app directory
WORKDIR /app

# Enable Corepack so the pnpm version pinned in package.json ("packageManager")
# is used for the install -- no global pnpm, no version drift.
RUN corepack enable

# Install production dependencies with a frozen lockfile. BuildKit cache mount
# keeps the pnpm store warm across rebuilds on the VPS (there is no registry).
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm install --prod --frozen-lockfile

# Bundle app source
COPY . .

# winston writes to logs/ at runtime. Create it owned by the non-root "node"
# user so a read-only root filesystem + writable ./logs bind mount still works.
RUN mkdir -p logs && chown -R node:node logs

# Drop root: run as the built-in unprivileged "node" user (uid 1000, matches the
# VPS deploy user so the bind-mounted ./logs stays writable).
USER node

# Internal API port
EXPOSE 3000

# Liveness probe. 127.0.0.1 (not localhost) avoids Alpine's IPv6 ::1 mapping
# that the IPv4-bound Express server would refuse with ECONNREFUSED.
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:3000/api/health',r=>process.exit(r.statusCode<400?0:1)).on('error',()=>process.exit(1))"

# Run the server
CMD ["node", "src/index.js"]
