# Base image
FROM --platform=linux/amd64 node:18 AS build

# Install dependencies necessary for building native modules
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package.json package-lock.json ./

# installing npm globally
RUN npm install -g npm@10.8.3

# Install app dependencies
RUN npm install --frozen-lockfile

# Copy the rest of the application source
COPY . .

# Build the app (optional, if you have a build step)
RUN npm run build

# Copy only the build artifacts to the runtime container
# (adjust according to your actual build output)
# COPY ./dist /app/dist

# Base image for the runtime
FROM --platform=linux/amd64 node:18-alpine

# Create app directory
WORKDIR /app

# Copy only the built files from the build stage
COPY --from=build /app /app

# Expose the port on which the app will run
EXPOSE 80

# Start the server using the production build
CMD ["npm", "run", "start:dev"]
