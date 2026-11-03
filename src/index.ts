/**************************************************************************
 *  (C) Copyright Mojaloop Foundation 2020                                *
 *                                                                        *
 *  This file is made available under the terms of the license agreement  *
 *  specified in the corresponding source code repository.                *
 *                                                                        *
 *  ORIGINAL AUTHOR:                                                      *
 *       Yevhen Kyriukha <yevhen.kyriukha@modusbox.com>                   *
 **************************************************************************/

import { lifecycle } from './signals';
import 'tsconfig-paths/register';

import path from 'node:path';
import { createGuard } from '@mojaloop/authz';
import { ApolloServer } from '@apollo/server';
import { ApolloServerPluginLandingPageGraphQLPlayground } from '@apollo/server-plugin-landing-page-graphql-playground';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import schema from './schema';
import { contextFrom, Context } from './context';
import Config from './lib/config';
import { applyMiddleware } from 'graphql-middleware';
import { createAuthMiddleware, createEventStores, EventStores } from '@app/lib';
import Logger from '@mojaloop/central-services-logger';
import { GraphQLRequestContext } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import cors from 'cors';
import express from 'express';
import http from 'http';
import bodyParser from 'body-parser';
import { EXIT_CODE, Step } from './lifecycle';
import { logger } from './shared/logger';

const app = express();
const httpServer = http.createServer(app);

const loggerPlugin = {
  // Fires whenever a GraphQL request is received from a client.
  async requestDidStart(requestContext: GraphQLRequestContext<Context>) {
    if (requestContext.request.operationName !== 'IntrospectionQuery') {
      Logger.debug(requestContext.request.query);
    }
  },
};

let stores: EventStores;

const STARTUP_STEPS: readonly Step[] = Object.freeze([
  async () => {
    stores = createEventStores();
    await stores.client.connect();
    return () => stores.client.close();
  },
  async () => {
    // What this service may answer, from the document that describes it
    const authz = await createGuard(path.join(__dirname, 'api', 'openapi.yaml'));
    app.use(authz.expose());

    // @ts-ignore
    const server = new ApolloServer<Context>({
      schema: applyMiddleware(schema, createAuthMiddleware(authz)),
      plugins: [
        ApolloServerPluginLandingPageGraphQLPlayground(),
        loggerPlugin,
        ApolloServerPluginDrainHttpServer({ httpServer, stopGracePeriodMillis: Infinity }),
      ],
      stopOnTerminationSignals: false,
    });
    // @ts-ignore
    await server.start();
    const corsOptions = {
      origin: Config.CORS_WHITELIST,
      credentials: Config.ALLOW_CREDENTIALS,
    };
    app.get('/health', (req, res) => {
      res.json({
        status: 'OK',
      });
    });
    app.use(
      Config.GRAPH_QL_RESOURCE_ENDPOINT,
      cors<cors.CorsRequest>(corsOptions),
      // 50mb is the limit that `startStandaloneServer` uses, but you may configure this to suit your needs
      bodyParser.json({ limit: '50mb' }),
      // expressMiddleware accepts the same arguments:
      // an Apollo Server instance and optional configuration options
      expressMiddleware(server, {
        context: contextFrom(stores),
      })
    );
    return () => server.stop();
  },
  async () => {
    await new Promise<void>((resolve, reject) => {
      httpServer.once('error', reject);
      httpServer.listen({ port: Config.PORT }, () => {
        httpServer.off('error', reject);
        resolve();
      });
    });
    logger.info(`🚀 Server ready at http://localhost:${Config.PORT}${Config.GRAPH_QL_RESOURCE_ENDPOINT}`);
  },
]);

lifecycle.start({ logger, steps: STARTUP_STEPS }).catch((err) => {
  logger.error('Reporting API failed to start', err);
  process.exit(EXIT_CODE.FAILURE);
});
