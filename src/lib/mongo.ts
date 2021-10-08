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

const createMongoClient = async (uri: string): Promise<Collection> => {
  const client = new MongoClient(uri);
  await client.connect();
  return client.db().collection('reporting');
};

export { createMongoClient, Collection };
