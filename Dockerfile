# Use official Node.js image
FROM node:18-alpine

# Accept build-time environment variables
ARG NUXT_PUBLIC_API_URL
ARG APP_NAME
ARG NUXT_PUBLIC_GOOGLE_CLIENT_ID

# Make them available as environment variables inside the container
ENV NUXT_PUBLIC_API_URL=$NUXT_PUBLIC_API_URL
ENV APP_NAME=$APP_NAME
ENV NUXT_PUBLIC_GOOGLE_CLIENT_ID=$NUXT_PUBLIC_GOOGLE_CLIENT_ID

# Set work directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy all files to the container
COPY . .

# Build the Nuxt app (will pick up env vars during build)
RUN npm run build

# Expose port 3000
EXPOSE 3000

# Run the Nuxt app in production mode
CMD ["npm", "run", "preview"]
