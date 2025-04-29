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
  getRequestFields,
  // createCacheMiddleware,
} from './lib';
import Logger from '@mojaloop/central-services-logger';
import Config from './lib/config';
import { ConnectionString } from 'connection-string';

const eventStore = createEventStoreClient();

const transaction = createTransactionClient();

const settlement = createSettlementClient();
export interface Context {
  log: typeof Logger;
  eventStore: typeof eventStore;
  transaction: typeof transaction;
  settlement: typeof settlement;
  config: typeof Config;
  loaders: Map<any, any>;
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

export const createContext = async (ctx: any): Promise<Context> => {
  // Perform actual context creation
  const context = {
    ...ctx,
    config: Config,
    log: Logger,
    eventStore,
    transaction,
    settlement,
    loaders: new Map(),
    getRequestFields,
  };

  return context;
};
