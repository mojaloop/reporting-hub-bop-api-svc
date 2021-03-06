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

import { ApolloServer } from 'apollo-server';
import { ApolloServerPluginLandingPageGraphQLPlayground } from 'apollo-server-core';
import schema from './schema';
import { createContext } from './context';
import config from './config';
import { applyMiddleware } from 'graphql-middleware';
import { createAuthMiddleware } from '@app/lib';
import Logger from '@mojaloop/central-services-logger';
import { GraphQLRequestContext } from 'apollo-server-types';

const authMiddleware = createAuthMiddleware(config.userIdHeader, config.oryKetoReadUrl, config.authCheckParticipants);

const loggerPlugin = {
  // Fires whenever a GraphQL request is received from a client.
  async requestDidStart(requestContext: GraphQLRequestContext) {
    if (requestContext.request.operationName !== 'IntrospectionQuery') {
      Logger.debug(requestContext.request.query);
    }
  },
};

const server = new ApolloServer({
  schema: applyMiddleware(schema, authMiddleware),
  context: createContext,
  plugins: [ApolloServerPluginLandingPageGraphQLPlayground(), loggerPlugin],
  healthCheckPath: '/health',
});

server.listen(config.port).then(async ({ url }) => {
  console.log(`🚀 Server ready at: ${url}`);
});
