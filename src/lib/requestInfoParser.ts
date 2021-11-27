import { parse, simplify } from 'graphql-parse-resolve-info';

export const getRequestFields = (info: any): any => {
  const parsedInfo = parse(info);
  const simplifiedInfo = simplify(parsedInfo as any, info.returnType);
  return simplifiedInfo.fields;
};
