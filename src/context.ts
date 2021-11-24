/**************************************************************************
 *  (C) Copyright Mojaloop Foundation 2020                                *
 *                                                                        *
 *  This file is made available under the terms of the license agreement  *
 *  specified in the corresponding source code repository.                *
 *                                                                        *
 *  ORIGINAL AUTHOR:                                                      *
 *       Yevhen Kyriukha <yevhen.kyriukha@modusbox.com>                   *
 **************************************************************************/

import { createCentralLedgerClient, createEventStoreClient, getMongoClient, Collection } from './lib';
import Logger from '@mojaloop/central-services-logger';
import config from './config';

const centralLedger = createCentralLedgerClient(config.prismaLoggingEnabled);
const eventStore = createEventStoreClient(config.prismaLoggingEnabled);

export interface Context {
  log: typeof Logger;
  centralLedger: typeof centralLedger;
  eventStore: typeof eventStore;
  config: typeof config;
  loaders: WeakMap<any, any>;
  eventStoreMongo: Collection;
  participants: string[] | undefined;
}

export const createContext = async (ctx: any): Promise<Context> => ({
  ...ctx,
  config,
  log: Logger,
  centralLedger,
  eventStore,
  loaders: new WeakMap(),
  eventStoreMongo: await getMongoClient(config.eventStoreDb),
});
