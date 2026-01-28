FROM node:25

# Create the folder inside the container
WORKDIR /app

# Copy package.json first
COPY package.json ./

# Install dependencies
RUN npm install

# Copy the rest of the code
COPY . .

# Expose the internal port
EXPOSE 3000

# Start the app
CMD ["npm", "start"]