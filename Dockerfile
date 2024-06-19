# Use an official Node.js runtime as a base image
FROM node:latest

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Expose the port that your app runs on (port 3302 in this case)
EXPOSE 3302

# Command to run your app using CMD which defines your runtime
CMD ["node", "app.js"]

