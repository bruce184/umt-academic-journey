# Sá»­ dá»¥ng Node.js image nháº¹ (Alpine Linux) 
FROM node:lts-alpine 

# Thiáº¿t láº­p thÆ° má»¥c lĂ m viá»‡c trong container 
WORKDIR /lab01  

# Copy file package Ä‘á»ƒ cĂ i dependencies trÆ°á»›c (táº­n dá»¥ng Docker caching layer) 
COPY package*.json ./

# CĂ i Ä‘áº·t dependencies 
# Sá»­ dá»¥ng --omit=dev Ä‘á»ƒ chá»‰ cĂ i dependencies cáº§n thiáº¿t cho production 
# Sá»­ dá»¥ng npm ci Ä‘á»ƒ cĂ i Ä‘áº·t chĂ­nh xĂ¡c theo package-lock.json, Ä‘áº£m báº£o tĂ­nh nháº¥t quĂ¡n 
RUN npm ci --omit=dev 

# Copy code 
COPY . .

# Copy script entrypoint vĂ  cáº¥p quyá»n thá»±c thi 
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN sed -i 's/\r$//' /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh 

# Khai bĂ¡o entrypoint 
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]

# Khai bĂ¡o command máº·c Ä‘á»‹nh Ä‘á»ƒ cháº¡y server (cĂ³ thá»ƒ bá»‹ override bá»Ÿi entrypoint)
CMD ["npm", "start"]

# Expose port 
EXPOSE 4000 