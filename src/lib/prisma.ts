/**************************************************************************
 *  (C) Copyright Mojaloop Foundation 2020                                *
 *                                                                        *
 *  This file is made available under the terms of the license agreement  *
 *  specified in the corresponding source code repository.                *
 *                                                                        *
 *  ORIGINAL AUTHOR:                                                      *
 *       Yevhen Kyriukha <yevhen.kyriukha@modusbox.com>                   *
 **************************************************************************/

import { PrismaClient as TransactionClient } from '@app/generated/transaction';
import { PrismaClient as EventStoreClient } from '@app/generated/eventStore';
import { PrismaClient as SettlementClient } from '@app/generated/settlement';

import Config from './config';
import { ConnectionString } from 'connection-string';

// TODO: rename to mongoClient
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
    // log: logQuery ? ['query'] : [],
  });
};

const createTransactionClient = (logQuery = false): TransactionClient => {
  const csMongoDBObj = new ConnectionString();
  csMongoDBObj.setDefaults({
    protocol: 'mongodb',
    hosts: [{ name: Config.EVENT_STORE_DB.HOST, port: Config.EVENT_STORE_DB.PORT }],
    user: Config.EVENT_STORE_DB.USER,
    password: Config.EVENT_STORE_DB.PASSWORD,
    path: [Config.EVENT_STORE_DB.DATABASE],
  });
  return new TransactionClient({
    datasources: {
      db: {
        url: csMongoDBObj.toString(),
      },
    },
    // log: logQuery ? ['query'] : [],
  });
};
const createSettlementClient = (logQuery = false): SettlementClient => {
  const csMongoDBObj = new ConnectionString();
  csMongoDBObj.setDefaults({
    protocol: 'mongodb',
    hosts: [{ name: Config.EVENT_STORE_DB.HOST, port: Config.EVENT_STORE_DB.PORT }],
    user: Config.EVENT_STORE_DB.USER,
    password: Config.EVENT_STORE_DB.PASSWORD,
    path: [Config.EVENT_STORE_DB.DATABASE],
  });
  return new SettlementClient({
    datasources: {
      db: {
        url: csMongoDBObj.toString(),
      },
    },
    // log: logQuery ? ['query'] : [],
  });
};

export {
  createTransactionClient,
  TransactionClient,
  createEventStoreClient,
  EventStoreClient,
  createSettlementClient,
  SettlementClient,
};
