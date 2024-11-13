// Helper function to create where condition
export const createWhereCondition = (filter: any) => {
  const whereCondition: any = { createdAt: {} };

  if (filter?.startDate) {
    whereCondition.createdAt = {
      gte: new Date(filter.startDate),
    };
  }

  if (filter?.endDate) {
    whereCondition.createdAt = {
      ...whereCondition.createdAt,
      lte: new Date(filter.endDate),
    };
  }
  // if (filter?.errorCode !== undefined) {
  //   whereCondition.errorCode = filter.errorCode;
  // }
  // if (filter?.payerDFSP) {
  //   whereCondition.payerDFSP = filter.payerDFSP;
  // }
  // if (filter?.payeeDFSP) {
  //   whereCondition.payeeDFSP = filter.payeeDFSP;
  // }
  // if (filter?.sourceCurrency) {
  //   whereCondition.sourceCurrency = filter.sourceCurrency;
  // }
  // if (filter?.targetCurrency) {
  //   whereCondition.targetCurrency = filter.targetCurrency;
  // }

  return whereCondition;
};

// Helper function to create groupBy condition
export const createGroupByCondition = (
  filter: any
): ('sourceCurrency' | 'targetCurrency' | 'payerDFSP' | 'payeeDFSP' | 'errorCode')[] => {
  const groupByCondition: ('sourceCurrency' | 'targetCurrency' | 'payerDFSP' | 'payeeDFSP' | 'errorCode')[] = [];
  if (filter?.sourceCurrency) groupByCondition.push('sourceCurrency');
  if (filter?.targetCurrency) groupByCondition.push('targetCurrency');
  if (filter?.payerDFSP) groupByCondition.push('payerDFSP');
  if (filter?.payeeDFSP) groupByCondition.push('payeeDFSP');
  if (filter?.errorCode !== undefined) groupByCondition.push('errorCode');
  groupByCondition.push('payerDFSP');
  groupByCondition.push('payeeDFSP');

  return groupByCondition;
};
