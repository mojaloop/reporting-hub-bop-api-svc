/**************************************************************************
 *  (C) Copyright Mojaloop Foundation 2020                                *
 *                                                                        *
 *  This file is made available under the terms of the license agreement  *
 *  specified in the corresponding source code repository.                *
 *                                                                        *
 *  ORIGINAL AUTHOR:                                                      *
 *       Yevhen Kyriukha <yevhen.kyriukha@modusbox.com>                   *
 **************************************************************************/

import {
  createCentralLedgerClient,
  createEventStoreClient,
  getMongoClient,
  Collection,
  getRequestFields,
  createCacheMiddleware,
} from './lib';
import Logger from '@mojaloop/central-services-logger';
import Config from './lib/config';
import { ConnectionString } from 'connection-string';

const centralLedger = createCentralLedgerClient(Config.PRISMA_LOGGING_ENABLED);
const eventStore = createEventStoreClient(Config.PRISMA_LOGGING_ENABLED);
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
centralLedger.$on('query', async (e) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  console.log(`${e.query} ${e.params}`);
});
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
eventStore.$on('query', async (e) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  console.log(`${e.query} ${e.params}`);
});
centralLedger.$use(createCacheMiddleware());

export interface Context {
  log: typeof Logger;
  centralLedger: typeof centralLedger;
  eventStore: typeof eventStore;
  config: typeof Config;
  loaders: Map<any, any>;
  eventStoreMongo: Collection;
  participants: string[] | undefined;
  getRequestFields: typeof getRequestFields;
}

const csMongoDBObj = new ConnectionString()
csMongoDBObj.setDefaults({
  protocol: 'mongodb',
  hosts: [{ name: Config.EVENT_STORE_DB.HOST, port: Config.EVENT_STORE_DB.PORT}],
  user: Config.EVENT_STORE_DB.USER,
  password: Config.EVENT_STORE_DB.PASSWORD,
  path: [Config.EVENT_STORE_DB.DATABASE]
})

export const createContext = async (ctx: any): Promise<Context> => ({
  ...ctx,
  config: Config,
  log: Logger,
  centralLedger,
  eventStore,
  loaders: new Map(),
  eventStoreMongo: await getMongoClient(csMongoDBObj.toString()),
  getRequestFields,
});
