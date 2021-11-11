/**************************************************************************
 *  (C) Copyright Mojaloop Foundation 2020                                *
 *                                                                        *
 *  This file is made available under the terms of the license agreement  *
 *  specified in the corresponding source code repository.                *
 *                                                                        *
 *  ORIGINAL AUTHOR:                                                      *
 *       Yevhen Kyriukha <yevhen.kyriukha@modusbox.com>                   *
 **************************************************************************/

import { decorateType, scalarType } from 'nexus';
import * as scalars from 'graphql-scalars';
import { GraphQLError } from 'graphql';
import GraphQLDecimal from './Decimal';

const NonEmptyString = decorateType(scalars.GraphQLNonEmptyString, {
  sourceType: 'NonEmptyString',
  asNexusMethod: 'nonEmptyString',
});

const JSONObject = decorateType(scalars.GraphQLJSONObject, {
  sourceType: 'JSONObject',
  asNexusMethod: 'jsonObject',
});

const GQLDate = decorateType(scalars.GraphQLDate, {
  sourceType: 'Date',
  asNexusMethod: 'date',
});

const GQLDateTime = decorateType(scalars.GraphQLDateTime, {
  sourceType: 'DateTime',
  asNexusMethod: 'dateTime',
});

const Currency = decorateType(scalars.GraphQLCurrency, {
  sourceType: 'Currency',
  asNexusMethod: 'currency',
});

const Decimal = decorateType(GraphQLDecimal, {
  sourceType: 'Decimal',
  asNexusMethod: 'decimal',
});

const BigInt = decorateType(scalars.GraphQLBigInt, {
  sourceType: 'BigInt',
  asNexusMethod: 'bigInt',
});

const GQLDateTimeFlexible = scalarType({
  name: 'DateTimeFlexible',
  asNexusMethod: 'dateTimeFlex',
  description: 'Date time (RFC 3339), can accept data in flexible form: 2007-12-03 or 2021-01-01T00:00:00Z',
  parseValue(value) {
    const isValidDate = (d: any) => d instanceof Date && !Number.isNaN(d.getTime());
    const date = new Date(value);
    if (!isValidDate(date)) {
      throw new GraphQLError('Invalid Date');
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

export default [GQLDateTime, GQLDate, GQLDateTimeFlexible, NonEmptyString, JSONObject, Currency, Decimal, BigInt];
