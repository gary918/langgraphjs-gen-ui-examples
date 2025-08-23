# Use the official Node.js 20 image.
FROM node:20-slim

# Create and change to the app directory.
WORKDIR /app

# Copy package.json and pnpm-lock.yaml to the working directory.
COPY package.json pnpm-lock.yaml ./

# Install pnpm and dependencies.
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Copy the rest of the application code to the working directory.
COPY . .

# Expose the port that the application will run on. Cloud Run uses 8080 by default.
EXPOSE 8080

# Copy the .env file to the app directory
# COPY .env ./

# Command to run the application.
# Using the shell form of CMD to allow for environment variable substitution.
CMD pnpm langgraphjs dev --host 0.0.0.0 -p ${PORT:-8080} --no-browser
