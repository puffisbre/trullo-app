# Use Node.js LTS version
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install all dependencies (including devDependencies for ts-node)
RUN npm ci

# Copy source code
COPY src ./src

# Expose port (Render will set this dynamically)
EXPOSE 4000

# Start the application
CMD ["npm", "start"]

