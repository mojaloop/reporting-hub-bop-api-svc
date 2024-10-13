FROM node:16.15.0-alpine AS builder

RUN apk add --no-cache git python3 build-base

WORKDIR /opt/reporting

COPY package.json mergePrisma.js tsconfig.json package-lock.json* /opt/reporting/
COPY prisma /opt/reporting/prisma
COPY src /opt/reporting/src
COPY patches /opt/reporting/patches
COPY config /opt/reporting/config  

RUN npm ci --production
RUN npm run generate
# RUN npm install

FROM node:16.15.0-alpine

WORKDIR /opt/reporting

COPY --from=builder /opt/reporting/package*.json /opt/reporting/tsconfig.json ./
COPY --from=builder /opt/reporting/node_modules node_modules
COPY --from=builder /opt/reporting/src src
COPY --from=builder /opt/reporting/config config  

EXPOSE 3000

CMD ["npm", "start"]
