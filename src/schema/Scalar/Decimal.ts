import { GraphQLScalarType } from 'graphql';

export default new GraphQLScalarType({
  name: 'Decimal',
  description: 'The `Decimal` scalar type to represent currency values',
  // TODO: need to fix the following reference to any
  serialize(value: any) {
    return parseFloat(parseFloat(value).toFixed(4));
  },
  // TODO: need to fix the following reference to any
  parseValue(value: any) {
    return parseFloat(value);
  },
});
