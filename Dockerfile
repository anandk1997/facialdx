# Use an official Node.js runtime as a parent image
# FROM node:lts-alpine
FROM node:22-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock) to the container
COPY package*.json ./

# Install project dependencies
RUN npm ci

# Copy the rest of the application code to the container
COPY . .

# Build the application
RUN npm run build

# Expose the port the app will run on
EXPOSE 5001

# Command to run the application
CMD ["npm", "run", "start"]