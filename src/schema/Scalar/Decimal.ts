import { GraphQLScalarType } from 'graphql';

export default new GraphQLScalarType({
  name: 'Decimal',
  description: 'The `Decimal` scalar type to represent currency values',

  serialize(value) {
    return parseFloat(parseFloat(value).toFixed(4));
  },

  parseValue(value) {
    return parseFloat(value);
  },
});
