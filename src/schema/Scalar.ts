import { decorateType, scalarType, unionType } from 'nexus';
import * as scalars from 'graphql-scalars';

const NonEmptyString = decorateType(scalars.GraphQLNonEmptyString, {
  sourceType: 'NonEmptyString',
  asNexusMethod: 'nonEmptyString',
});

const JSONObject = decorateType(scalars.GraphQLJSONObject, {
  sourceType: 'JSONObject',
  asNexusMethod: 'jsonObject',
});

const DateTime = decorateType(scalars.GraphQLDateTime, {
  sourceType: 'DateTime',
  asNexusMethod: 'DateTime',
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

export default [DateTime, NonEmptyString, JSONObject];
