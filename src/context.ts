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
  createEventStoreClient,
  createTransactionClient,
  createSettlementClient,
  getMongoClient,
  Collection,
  getRequestFields,
  // createCacheMiddleware,
} from './lib';
import Logger from '@mojaloop/central-services-logger';
import Config from './lib/config';
import { ConnectionString } from 'connection-string';

const eventStore = createEventStoreClient(Config.PRISMA_LOGGING_ENABLED);

const transaction = createTransactionClient(Config.PRISMA_LOGGING_ENABLED);

const settlement = createSettlementClient(Config.PRISMA_LOGGING_ENABLED);

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
eventStore.$on('query', async (e) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  console.log(`${e.query} ${e.params}`);
});

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
transaction.$on('query', async (e) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  console.log(`${e.query} ${e.params}`);
});

settlement.$on('query', async (e) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  console.log(`${e.query} ${e.params}`);
});

export interface Context {
  log: typeof Logger;
  eventStore: typeof eventStore;
  transaction: typeof transaction;
  settlement: typeof settlement;
  config: typeof Config;
  loaders: Map<any, any>;
  eventStoreMongo: Collection;
  participants: string[] | undefined;
  getRequestFields: typeof getRequestFields;
}

const csMongoDBObj = new ConnectionString();
csMongoDBObj.setDefaults({
  protocol: 'mongodb',
  hosts: [{ name: Config.EVENT_STORE_DB.HOST, port: Config.EVENT_STORE_DB.PORT }],
  user: Config.EVENT_STORE_DB.USER,
  password: Config.EVENT_STORE_DB.PASSWORD,
  path: [Config.EVENT_STORE_DB.DATABASE],
});

export const createContext = async (ctx: any): Promise<Context> => ({
  ...ctx,
  config: Config,
  log: Logger,
  eventStore,
  transaction,
  settlement,
  loaders: new Map(),
  eventStoreMongo: await getMongoClient(csMongoDBObj.toString(), 'reporting'),
  transactionMongo: await getMongoClient(csMongoDBObj.toString(), 'transaction'),
  settlementMongo: await getMongoClient(csMongoDBObj.toString(), 'settlement'),
  getRequestFields,
});
