FROM node:lts-alpine

RUN apk add --no-cache openssl

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY tsconfig.json .
COPY prisma ./prisma
COPY src ./src

RUN npx prisma generate

EXPOSE 3000

ENTRYPOINT ["sh", "-c", "npx prisma db push --skip-generate && npx ts-node-dev --respawn --transpile-only src/index.ts"]
