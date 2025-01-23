FROM node:16

WORKDIR /usr/src/app

COPY package.json package-lock.json ./

RUN npm install

COPY server.js ./

COPY public ./public

COPY .env ./

EXPOSE 3005

CMD ["node", "server.js"]