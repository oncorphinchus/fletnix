FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application
COPY . .

# Expose port 3000
EXPOSE 3000

# Start the application in development mode
CMD ["npm", "run", "dev"] 