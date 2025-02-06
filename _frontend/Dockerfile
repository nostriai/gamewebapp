# Use Node.js image
FROM node:20

# Set working directory
WORKDIR /app

# Copy package files first (this ensures better caching)
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .
