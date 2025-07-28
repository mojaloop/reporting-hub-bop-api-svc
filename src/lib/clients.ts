/**************************************************************************
 *  (C) Copyright Mojaloop Foundation 2020                                *
 *                                                                        *
 *  This file is made available under the terms of the license agreement  *
 *  specified in the corresponding source code repository.                *
 *                                                                        *
 *  ORIGINAL AUTHOR:                                                      *
 *       Yevhen Kyriukha <yevhen.kyriukha@modusbox.com>                   *
 **************************************************************************/

import { Collection, MongoClient } from 'mongodb';
import Config from './config';
import { ConnectionString } from 'connection-string';
import { logger } from '../shared/logger';

const createMongoClient = (): MongoClient => {
  const csMongoDBObj = new ConnectionString();
  csMongoDBObj.setDefaults({
    protocol: 'mongodb',
    hosts: [{ name: Config.EVENT_STORE_DB.HOST, port: Config.EVENT_STORE_DB.PORT }],
    user: Config.EVENT_STORE_DB.USER,
    password: Config.EVENT_STORE_DB.PASSWORD,
    path: [Config.EVENT_STORE_DB.DATABASE],
    params: Config.EVENT_STORE_DB.PARAMS,
  });
  const mongoUri = csMongoDBObj.toString();
  const safeUri = mongoUri.replace(/(\/\/)(.*):(.*)@/, '$1****:****@');
  logger.info(`Connecting to MongoDB with URI: ${safeUri}`);
  const mongoClient = new MongoClient(mongoUri);
  mongoClient.connect();
  return mongoClient;
};

const createEventStoreClient = (): Collection => {
  const mongoClient = createMongoClient();
  const db = mongoClient.db(Config.EVENT_STORE_DB.DATABASE);
  return db.collection('reporting');
};

const createTransactionClient = (): Collection => {
  const mongoClient = createMongoClient();
  const db = mongoClient.db(Config.EVENT_STORE_DB.DATABASE);
  return db.collection('transaction');
};

const createSettlementClient = (): Collection => {
  const mongoClient = createMongoClient();
  const db = mongoClient.db(Config.EVENT_STORE_DB.DATABASE);
  return db.collection('settlement');
};

export { createTransactionClient, createEventStoreClient, createSettlementClient };
