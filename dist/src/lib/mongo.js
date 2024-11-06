"use strict";
/**************************************************************************
 *  (C) Copyright Mojaloop Foundation 2020                                *
 *                                                                        *
 *  This file is made available under the terms of the license agreement  *
 *  specified in the corresponding source code repository.                *
 *                                                                        *
 *  ORIGINAL AUTHOR:                                                      *
 *       Yevhen Kyriukha <yevhen.kyriukha@modusbox.com>                   *
 **************************************************************************/
Object.defineProperty(exports, "__esModule", { value: true });
exports.Collection = exports.getMongoClient = void 0;
const mongodb_1 = require("mongodb");
Object.defineProperty(exports, "Collection", { enumerable: true, get: function () { return mongodb_1.Collection; } });
let collection;
const getMongoClient = async (uri) => {
    if (!collection) {
        const client = new mongodb_1.MongoClient(uri);
        await client.connect();
        collection = client.db().collection('reporting');
    }
    return collection;
};
exports.getMongoClient = getMongoClient;
//# sourceMappingURL=mongo.js.map