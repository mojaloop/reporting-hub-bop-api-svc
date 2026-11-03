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

let collection: Collection | null = null;
let client: MongoClient | null = null;

const getMongoClient = async (uri: string, collectionName: string): Promise<Collection> => {
  if (!collection) {
    client = new MongoClient(uri);
    await client.connect();
    collection = client.db().collection(collectionName);
  }
  return collection;
};

const closeMongoClientConnection = async (): Promise<void> => {
  if (client) {
    await client.close();
    client = null;
    collection = null;
  }
};

export { getMongoClient, Collection, closeMongoClientConnection };
