"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRequestFields = void 0;
const graphql_parse_resolve_info_1 = require("graphql-parse-resolve-info");
const getRequestFields = (info) => {
    const parsedInfo = (0, graphql_parse_resolve_info_1.parse)(info);
    const simplifiedInfo = (0, graphql_parse_resolve_info_1.simplify)(parsedInfo, info.returnType);
    return simplifiedInfo.fields;
};
exports.getRequestFields = getRequestFields;
//# sourceMappingURL=requestInfoParser.js.map