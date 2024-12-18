"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_1 = require("graphql");
exports.default = new graphql_1.GraphQLScalarType({
    name: 'Decimal',
    description: 'The `Decimal` scalar type to represent currency values',
    // TODO: need to fix the following reference to any
    serialize(value) {
        return parseFloat(parseFloat(value).toFixed(4));
    },
    // TODO: need to fix the following reference to any
    parseValue(value) {
        return parseFloat(value);
    },
});
//# sourceMappingURL=Decimal.js.map