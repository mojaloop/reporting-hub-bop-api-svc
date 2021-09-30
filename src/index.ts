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

const authMiddleware = createAuthMiddleware(config.authApi);

const server = new ApolloServer({
  schema: applyMiddleware(schema, authMiddleware),
  context: createContext,
  plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
});

server.listen(config.port).then(async ({ url }) => {
  console.log(`🚀 Server ready at: ${url}`);
});
