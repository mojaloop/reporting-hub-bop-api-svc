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
import Config from './config';
import { ConnectionString } from 'connection-string';

const createCentralLedgerClient = (logQuery = false): CentralLedgerClient => {
  const csMysqlObj = new ConnectionString();
  csMysqlObj.setDefaults({
    protocol: 'mysql',
    hosts: [{ name: Config.REPORTING_DB.HOST, port: Config.REPORTING_DB.PORT }],
    user: Config.REPORTING_DB.USER,
    password: Config.REPORTING_DB.PASSWORD,
    path: [Config.REPORTING_DB.SCHEMA],
  });

  return new CentralLedgerClient({
    datasources: {
      db: {
        url: csMysqlObj.toString(),
      },
    },
    log: logQuery ? ['query'] : [],
  });
};

const createEventStoreClient = (logQuery = false): EventStoreClient => {
  const csMongoDBObj = new ConnectionString();
  csMongoDBObj.setDefaults({
    protocol: 'mongodb',
    hosts: [{ name: Config.EVENT_STORE_DB.HOST, port: Config.EVENT_STORE_DB.PORT }],
    user: Config.EVENT_STORE_DB.USER,
    password: Config.EVENT_STORE_DB.PASSWORD,
    path: [Config.EVENT_STORE_DB.DATABASE],
  });
  
  return new EventStoreClient({
    datasources: {
      db: {
        url: csMongoDBObj.toString(),
      },
    },
    log: logQuery ? ['query'] : [],
  });
};
export { createCentralLedgerClient, createEventStoreClient, CentralLedgerClient, EventStoreClient };
