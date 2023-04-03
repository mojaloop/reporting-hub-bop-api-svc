/**************************************************************************
 *  (C) Copyright Mojaloop Foundation 2020                                *
 *                                                                        *
 *  This file is made available under the terms of the license agreement  *
 *  specified in the corresponding source code repository.                *
 *                                                                        *
 *  ORIGINAL AUTHOR:                                                      *
 *       Yevhen Kyriukha <yevhen.kyriukha@modusbox.com>                   *
 **************************************************************************/

import { PrismaClient as CentralLedgerClient } from '@app/generated/centralLedger';
import { PrismaClient as EventStoreClient } from '@app/generated/eventStore';
import MongoUriBuilder from 'mongo-uri-builder';
import Config from './config'

const createCentralLedgerClient = (logQuery = false): CentralLedgerClient => {
  // TODO: Need to find Uri Builder for mysql
  const connectionString = `mysql://${Config.REPORTING_DB.USER}:${Config.REPORTING_DB.PASSWORD}@${Config.REPORTING_DB.HOST}:${Config.REPORTING_DB.PORT}/${Config.REPORTING_DB.SCHEMA}`
  return new CentralLedgerClient({
    datasources: {
      db: {
        url: connectionString,
      },
    },
    log: logQuery ? ['query'] : [],
  });
}

const createEventStoreClient = (logQuery = false): EventStoreClient => {
  const connectionString = MongoUriBuilder({
    username: encodeURIComponent(Config.EVENT_STORE_DB.USER),
    password: encodeURIComponent(Config.EVENT_STORE_DB.PASSWORD),
    host: Config.EVENT_STORE_DB.HOST,
    port: Config.EVENT_STORE_DB.PORT,
    database: Config.EVENT_STORE_DB.DATABASE
  })
  return new EventStoreClient({
    datasources: {
      db: {
        url: connectionString,
      },
    },
    log: logQuery ? ['query'] : [],
  });
}

export { createCentralLedgerClient, createEventStoreClient, CentralLedgerClient, EventStoreClient };
