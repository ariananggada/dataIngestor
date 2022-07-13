FROM node:lts-alpine
WORKDIR /app
ADD package*.json ./
RUN npm install
ADD ./src ./
CMD [ "node", "src/index.js"]