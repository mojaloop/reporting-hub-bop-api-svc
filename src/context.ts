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
import config from './config';

const centralLedger = createCentralLedgerClient(config.prismaLoggingEnabled);
const eventStore = createEventStoreClient(config.prismaLoggingEnabled);
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
  config: typeof config;
  loaders: Map<any, any>;
  eventStoreMongo: Collection;
  participants: string[] | undefined;
  getRequestFields: typeof getRequestFields;
}

export const createContext = async (ctx: any): Promise<Context> => ({
  ...ctx,
  config,
  log: Logger,
  centralLedger,
  eventStore,
  loaders: new Map(),
  eventStoreMongo: await getMongoClient(config.eventStoreDb),
  getRequestFields,
});
