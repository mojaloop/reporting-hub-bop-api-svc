export const createWhereCondition = (filter: any) => {
  const matchCondition: any = {};

  if (!Object.keys(filter).length) {
    return {};
  }

  // Required filters
  if (filter?.startDate) {
    matchCondition.createdAt = { ...matchCondition.createdAt, $gte: new Date(filter.startDate) };
  }

  if (filter?.endDate) {
    matchCondition.createdAt = { ...matchCondition.createdAt, $lte: new Date(filter.endDate) };
  }

  // Optional filters
  if (filter?.payerDFSP) {
    matchCondition.payerDFSP = filter.payerDFSP;
  }
  if (filter?.payeeDFSP) {
    matchCondition.payeeDFSP = filter.payeeDFSP;
  }
  if (filter?.transferState) {
    matchCondition.transferState = filter.transferState;
  }
  if (filter?.conversionState) {
    // Handle conversionState filter with OR condition
    matchCondition.$or = [
      { "conversions.payer.conversionState": filter.conversionState },
      { "conversions.payee.conversionState": filter.conversionState },
    ];
  }

  if (filter?.transactionType) {
    matchCondition.transactionType = filter.transactionType;
  }

  if (filter?.sourceCurrency) {
    matchCondition.sourceCurrency = filter.sourceCurrency;
  }

  if (filter?.targetCurrency) {
    matchCondition.targetCurrency = filter.targetCurrency;
  }

  // Handle Payer filter
  if (filter?.payer) {
    const payerFilter: any = {};
    if (filter.payer.partyIdType) {
      payerFilter["payerParty.partyIdType"] = filter.payer.partyIdType;
    }
    if (filter.payer.partyIdentifier) {
      payerFilter["payerParty.partyIdentifier"] = filter.payer.partyIdentifier;
    }
    Object.assign(matchCondition, payerFilter);
  }

  // Handle Payee filter
  if (filter?.payee) {
    const payeeFilter: any = {};
    if (filter.payee.partyIdType) {
      payeeFilter["payeeParty.partyIdType"] = filter.payee.partyIdType;
    }
    if (filter.payee.partyIdentifier) {
      payeeFilter["payeeParty.partyIdentifier"] = filter.payee.partyIdentifier;
    }
    Object.assign(matchCondition, payeeFilter);
  }

  return matchCondition;
};
