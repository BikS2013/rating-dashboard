# Build stage
FROM node:20-alpine AS build

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Copy .env files
COPY .env* ./

# Install dependencies
RUN npm install

# Copy all files
COPY . .

# Build the app with production TypeScript config
RUN npm run build:prod

# Production stage
FROM nginx:alpine

# Copy built assets from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy environment script
COPY env.sh /env.sh
RUN chmod +x /env.sh

# Expose port
EXPOSE 80

# Start nginx with env script
CMD ["/env.sh"]