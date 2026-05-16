# 1. Base image: Node 18 nhẹ
FROM node:18-alpine

# 2. Thư mục làm việc trong container
WORKDIR /app

# 3. Copy file package để cài dependency
COPY package*.json ./

# 4. Cài dependencies
RUN npm install

# 5. Copy toàn bộ source còn lại vào container
COPY . .

# 6. Tạo database SQLite + seed dữ liệu bên trong image
RUN npm run migrate && npm run seed

# 7. Expose port 3000 bên trong container
EXPOSE 3000

# 8. Lệnh chạy app
CMD ["npm", "start"]
