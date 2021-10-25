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

let collection: Collection;

const getMongoClient = async (uri: string): Promise<Collection> => {
  if (!collection) {
    const client = new MongoClient(uri);
    await client.connect();
    collection = client.db().collection('reporting');
  }
  return collection;
};

export { getMongoClient, Collection };
