FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:prod"]