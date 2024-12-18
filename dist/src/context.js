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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createContext = void 0;
const lib_1 = require("./lib");
const central_services_logger_1 = __importDefault(require("@mojaloop/central-services-logger"));
const config_1 = __importDefault(require("./lib/config"));
const connection_string_1 = require("connection-string");
const centralLedger = (0, lib_1.createCentralLedgerClient)(config_1.default.PRISMA_LOGGING_ENABLED);
const eventStore = (0, lib_1.createEventStoreClient)(config_1.default.PRISMA_LOGGING_ENABLED);
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
centralLedger.$on('query', async (e) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    console.log(`${e.query} ${e.params}`);
});
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
eventStore.$on('query', async (e) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    console.log(`${e.query} ${e.params}`);
});
centralLedger.$use((0, lib_1.createCacheMiddleware)());
const csMongoDBObj = new connection_string_1.ConnectionString();
csMongoDBObj.setDefaults({
    protocol: 'mongodb',
    hosts: [{ name: config_1.default.EVENT_STORE_DB.HOST, port: config_1.default.EVENT_STORE_DB.PORT }],
    user: config_1.default.EVENT_STORE_DB.USER,
    password: config_1.default.EVENT_STORE_DB.PASSWORD,
    path: [config_1.default.EVENT_STORE_DB.DATABASE],
});
const createContext = async (ctx) => ({
    ...ctx,
    config: config_1.default,
    log: central_services_logger_1.default,
    centralLedger,
    eventStore,
    loaders: new Map(),
    eventStoreMongo: await (0, lib_1.getMongoClient)(csMongoDBObj.toString()),
    getRequestFields: lib_1.getRequestFields,
});
exports.createContext = createContext;
//# sourceMappingURL=context.js.map