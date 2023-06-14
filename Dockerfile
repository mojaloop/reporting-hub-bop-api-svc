FROM node:18.16.0-alpine as builder

RUN apk add --no-cache git python3 build-base

WORKDIR /opt/reporting

COPY package.json mergePrisma.js tsconfig.json package-lock.json* /opt/reporting/
COPY prisma /opt/reporting/prisma
COPY src /opt/reporting/src
COPY patches /opt/reporting/patches

RUN npm ci --production
RUN npm run generate
# RUN npm install

FROM node:18.16.0-alpine

WORKDIR /opt/reporting

COPY --from=builder /opt/reporting/package*.json /opt/reporting/tsconfig.json ./
COPY --from=builder /opt/reporting/node_modules node_modules
COPY --from=builder /opt/reporting/src src

EXPOSE 3000

CMD ["npm", "start"]
