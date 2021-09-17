import 'tsconfig-paths/register';

import { ApolloServer } from 'apollo-server';
import { ApolloServerPluginLandingPageGraphQLPlayground } from 'apollo-server-core';
import schema from './schema';
import { createContext } from './context';
import config from './config';

const server = new ApolloServer({
  schema,
  context: createContext,
  plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
});

server.listen(config.port).then(async ({ url }) => {
  console.log(`🚀 Server ready at: ${url}`);
});
