# The Node version lives in .nvmrc, the npm version in package.json devEngines:
#
#   docker build --build-arg NODE_VERSION="$(cat .nvmrc)-alpine" -t mojaloop/reporting-hub-bop-api-svc:local .
#
# NPM_CONFIG_REGISTRY names the registry the lockfile resolves through.
ARG NODE_VERSION=lts-alpine

FROM node:${NODE_VERSION} AS builder
ARG NPM_CONFIG_REGISTRY=https://registry.npmjs.org/

WORKDIR /opt/reporting

COPY package.json tsconfig.json package-lock.json* /opt/reporting/
RUN npm install --global npm@"$(node -p 'require("./package.json").devEngines.packageManager.version')"
COPY src /opt/reporting/src

RUN npm ci --omit=dev
RUN npm run build

FROM node:${NODE_VERSION}

WORKDIR /opt/reporting

RUN rm -rf /usr/local/lib/node_modules/npm
COPY --from=builder /usr/local/lib/node_modules/npm /usr/local/lib/node_modules/npm
ENV NPM_CONFIG_UPDATE_NOTIFIER=false
RUN adduser -D app-user
USER app-user

COPY --chown=app-user --from=builder /opt/reporting/package*.json /opt/reporting/tsconfig.json ./
COPY --chown=app-user --from=builder /opt/reporting/node_modules node_modules
COPY --chown=app-user --from=builder /opt/reporting/dist dist

EXPOSE 3000
ENV TS_NODE_BASEURL=./dist NODE_ENV=production

CMD ["npm", "run", "start:dist"]
