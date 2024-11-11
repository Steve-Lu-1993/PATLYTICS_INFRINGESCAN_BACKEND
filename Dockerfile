FROM --platform=linux/amd64 node:20.13-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN cat tsconfig.json

ARG BASE_PATH
ENV BASE_PATH=${BASE_PATH}

RUN npm run swagger

RUN npm run build

FROM --platform=linux/amd64 node:20.13-alpine

WORKDIR /app

COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

COPY --from=builder /app/build/swagger.json /app/build/swagger.json

RUN npm install --production

EXPOSE 8060

CMD ["node", "dist/app.min.js"]
