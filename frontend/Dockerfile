# Build stage
FROM node:20-alpine AS build
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build the Angular app
RUN npm run build -- --configuration=production

# Runtime stage
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build from previous stage
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html

# Add version info
ARG VERSION=unknown
RUN echo $VERSION > /usr/share/nginx/html/version.txt

# Expose port for the application
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
