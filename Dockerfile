

# Base image
FROM --platform=linux/amd64 node:18-slim AS build

# Install dependencies for native modules
RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Copy package files first (use Docker cache for dependencies)
COPY package.json package-lock.json ./
RUN npm install --frozen-lockfile

# Copy the rest of the source code
COPY . .

# Optional build step
RUN npm run build

# Runtime image
FROM --platform=linux/amd64 node:18-alpine

WORKDIR /app
COPY --from=build /app /app

EXPOSE 80

CMD ["npm", "run", "start:dev"]
