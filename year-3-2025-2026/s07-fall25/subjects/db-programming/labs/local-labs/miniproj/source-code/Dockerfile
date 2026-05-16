# Dockerfile
# Build image cho Node.js app

FROM node:20-alpine

# Thư mục làm việc trong container
WORKDIR /usr/src/app

# Copy package files trước để cache layer npm install
COPY package*.json ./

# Cài dependencies
RUN npm install --only=production

# Copy toàn bộ source vào container
COPY . .

# Expose port (trong container)
EXPOSE 3000

# Lệnh run
CMD ["npm", "start"]
