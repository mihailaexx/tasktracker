# Use Node.js 24.6.0 as the base image
FROM node:24.6.0-alpine3.22 AS build

# Set the working directory
WORKDIR /app

# Disable Angular CLI analytics
ENV NG_CLI_ANALYTICS=false

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the application source code
COPY . .

# Build the application
RUN npm run build

# Expose the port
EXPOSE 4200

# Start the application with host binding to all interfaces
CMD ["npx", "ng", "serve", "--host", "0.0.0.0"]