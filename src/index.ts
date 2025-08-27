/**************************************************************************
 *  (C) Copyright Mojaloop Foundation 2020                                *
 *                                                                        *
 *  This file is made available under the terms of the license agreement  *
 *  specified in the corresponding source code repository.                *
 *                                                                        *
 *  ORIGINAL AUTHOR:                                                      *
 *       Yevhen Kyriukha <yevhen.kyriukha@modusbox.com>                   *
 **************************************************************************/

import 'tsconfig-paths/register';

import { ApolloServer } from '@apollo/server';
import { ApolloServerPluginLandingPageGraphQLPlayground } from '@apollo/server-plugin-landing-page-graphql-playground';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import schema from './schema';
import { createContext, Context } from './context';
import Config from './lib/config';
import { applyMiddleware } from 'graphql-middleware';
import { createAuthMiddleware } from '@app/lib';
import Logger from '@mojaloop/central-services-logger';
import { GraphQLRequestContext } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import cors from 'cors';
import express from 'express';
import http from 'http';
import bodyParser from 'body-parser';

const app = express();
const httpServer = http.createServer(app);

const authMiddleware = createAuthMiddleware(
  Config.USER_ID_HEADER,
  Config.ORY_KETO_READ_URL,
  Config.AUTH_CHECK_PARTICIPANTS
);

const loggerPlugin = {
  // Fires whenever a GraphQL request is received from a client.
  async requestDidStart(requestContext: GraphQLRequestContext<Context>) {
    if (requestContext.request.operationName !== 'IntrospectionQuery') {
      Logger.debug(requestContext.request.query);
    }
  },
};

const startServer = async () => {
  // @ts-ignore
  const server = new ApolloServer<Context>({
    schema: applyMiddleware(schema, authMiddleware),
    plugins: [
      ApolloServerPluginLandingPageGraphQLPlayground(),
      loggerPlugin,
      ApolloServerPluginDrainHttpServer({ httpServer }),
    ],
    // healthCheckPath: '/health',
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
      context: createContext,
    })
  );

  // Modified server startup
  await new Promise<void>((resolve) => httpServer.listen({ port: Config.PORT }, resolve));
  console.log(`🚀 Server ready at http://localhost:${Config.PORT}${Config.GRAPH_QL_RESOURCE_ENDPOINT}`);
};

startServer();
