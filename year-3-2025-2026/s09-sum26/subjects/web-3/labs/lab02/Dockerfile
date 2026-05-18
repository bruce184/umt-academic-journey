FROM node:lts-alpine

ARG SERVICE_DIR

WORKDIR /app/${SERVICE_DIR}

COPY ${SERVICE_DIR}/package*.json ./
RUN npm ci --omit=dev

COPY protos /app/protos
COPY ${SERVICE_DIR} /app/${SERVICE_DIR}
COPY docker-entrypoint.sh /usr/local/bin/student-entrypoint.sh

RUN sed -i 's/\r$//' /usr/local/bin/docker-entrypoint.sh \
  && sed -i 's/\r$//' /usr/local/bin/student-entrypoint.sh \
  && chmod +x /usr/local/bin/student-entrypoint.sh

CMD ["npm", "start"]
