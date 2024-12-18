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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nexus_1 = require("nexus");
const scalars = __importStar(require("graphql-scalars"));
const graphql_1 = require("graphql");
const Decimal_1 = __importDefault(require("./Decimal"));
const NonEmptyString = (0, nexus_1.decorateType)(scalars.GraphQLNonEmptyString, {
    sourceType: 'NonEmptyString',
    asNexusMethod: 'nonEmptyString',
});
const JSONObject = (0, nexus_1.decorateType)(scalars.GraphQLJSONObject, {
    sourceType: 'JSONObject',
    asNexusMethod: 'jsonObject',
});
const GQLDate = (0, nexus_1.decorateType)(scalars.GraphQLDate, {
    sourceType: 'Date',
    asNexusMethod: 'date',
});
const GQLDateTime = (0, nexus_1.decorateType)(scalars.GraphQLDateTime, {
    sourceType: 'DateTime',
    asNexusMethod: 'dateTime',
});
const Currency = (0, nexus_1.decorateType)(scalars.GraphQLCurrency, {
    sourceType: 'Currency',
    asNexusMethod: 'currency',
});
const Decimal = (0, nexus_1.decorateType)(Decimal_1.default, {
    sourceType: 'Decimal',
    asNexusMethod: 'decimal',
});
const BigInt = (0, nexus_1.decorateType)(scalars.GraphQLBigInt, {
    sourceType: 'BigInt',
    asNexusMethod: 'bigInt',
});
const GQLDateTimeFlexible = (0, nexus_1.scalarType)({
    name: 'DateTimeFlexible',
    asNexusMethod: 'dateTimeFlex',
    description: 'Date time (RFC 3339), can accept data in flexible form: 2007-12-03 or 2021-01-01T00:00:00Z',
    // TODO: need to fix the following reference to any
    parseValue(value) {
        const isValidDate = (d) => d instanceof Date && !Number.isNaN(d.getTime());
        const date = new Date(value);
        if (!isValidDate(date)) {
            throw new graphql_1.GraphQLError('Invalid Date');
        }
        return date.toISOString();
    },
});
// const File = scalarType({
//   name: 'File',
//   asNexusMethod: 'file',
//   description: 'Binary file in base64 format',
//   serialize(value) {
//     return value.toString('base64');
//   },
// });
//
// const ReportResult = unionType({
//   name: 'ReportResult',
//   description: 'Any type of report result',
//   definition(t) {
//     t.members('File', 'JSONObject');
//   },
//   resolveType: (item) => item.name,
// });
exports.default = [GQLDateTime, GQLDate, GQLDateTimeFlexible, NonEmptyString, JSONObject, Currency, Decimal, BigInt];
//# sourceMappingURL=index.js.map