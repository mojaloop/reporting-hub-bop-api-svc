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
exports.EventStoreClient = exports.CentralLedgerClient = exports.createEventStoreClient = exports.createCentralLedgerClient = void 0;
const centralLedger_1 = require("@app/generated/centralLedger");
Object.defineProperty(exports, "CentralLedgerClient", { enumerable: true, get: function () { return centralLedger_1.PrismaClient; } });
const eventStore_1 = require("@app/generated/eventStore");
Object.defineProperty(exports, "EventStoreClient", { enumerable: true, get: function () { return eventStore_1.PrismaClient; } });
const config_1 = __importDefault(require("./config"));
const connection_string_1 = require("connection-string");
const createCentralLedgerClient = (logQuery = false) => {
    const csMysqlObj = new connection_string_1.ConnectionString();
    csMysqlObj.setDefaults({
        protocol: 'mysql',
        hosts: [{ name: config_1.default.REPORTING_DB.HOST, port: config_1.default.REPORTING_DB.PORT }],
        user: config_1.default.REPORTING_DB.USER,
        password: config_1.default.REPORTING_DB.PASSWORD,
        path: [config_1.default.REPORTING_DB.SCHEMA],
    });
    return new centralLedger_1.PrismaClient({
        datasources: {
            db: {
                url: csMysqlObj.toString(),
            },
        },
        log: logQuery ? ['query'] : [],
    });
};
exports.createCentralLedgerClient = createCentralLedgerClient;
const createEventStoreClient = (logQuery = false) => {
    const csMongoDBObj = new connection_string_1.ConnectionString();
    csMongoDBObj.setDefaults({
        protocol: 'mongodb',
        hosts: [{ name: config_1.default.EVENT_STORE_DB.HOST, port: config_1.default.EVENT_STORE_DB.PORT }],
        user: config_1.default.EVENT_STORE_DB.USER,
        password: config_1.default.EVENT_STORE_DB.PASSWORD,
        path: [config_1.default.EVENT_STORE_DB.DATABASE],
    });
    return new eventStore_1.PrismaClient({
        datasources: {
            db: {
                url: csMongoDBObj.toString(),
            },
        },
        log: logQuery ? ['query'] : [],
    });
};
exports.createEventStoreClient = createEventStoreClient;
//# sourceMappingURL=prisma.js.map