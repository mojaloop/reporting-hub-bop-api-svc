/**************************************************************************
 *  (C) Copyright Mojaloop Foundation 2020                                *
 *                                                                        *
 *  This file is made available under the terms of the license agreement  *
 *  specified in the corresponding source code repository.                *
 *                                                                        *
 *  ORIGINAL AUTHOR:                                                      *
 *       Yevhen Kyriukha <yevhen.kyriukha@modusbox.com>                   *
 **************************************************************************/

import { Collection } from 'mongodb';
import { EventStores, getRequestFields } from './lib';
import Logger from '@mojaloop/central-services-logger';
import Config from './lib/config';

export interface Context {
  log: typeof Logger;
  eventStore: Collection;
  transaction: Collection;
  settlement: Collection;
  config: typeof Config;
  loaders: Map<any, any>;
  participants: string[] | undefined;
  getRequestFields: typeof getRequestFields;
}

export const contextFrom =
  ({ eventStore, transaction, settlement }: EventStores) =>
  async (ctx: any): Promise<Context> => ({
    ...ctx,
    config: Config,
    log: Logger,
    eventStore,
    transaction,
    settlement,
    loaders: new Map(),
    getRequestFields,
  });
