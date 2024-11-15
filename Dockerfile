FROM node:20.13-bullseye AS builder

RUN apt-get update && apt-get install -y golang build-essential

WORKDIR /app

COPY package*.json ./

ENV ESBUILD_BUILD_FROM_SOURCE=true

RUN npm install

COPY . .

RUN cat tsconfig.json

ARG BASE_PATH
ENV BASE_PATH=${BASE_PATH}

RUN npm run swagger

RUN npm run build

FROM node:20.13-bullseye

WORKDIR /app

COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

COPY --from=builder /app/build/swagger.json /app/build/swagger.json

RUN npm install --production

EXPOSE 8060

CMD ["node", "dist/app.min.js"]
