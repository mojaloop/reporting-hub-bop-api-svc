export const createWhereCondition = (filter: any) => {
  const whereCondition: any = {
    createdAt: {},
    payerParty: { is: {} },
    payeeParty: { is: {} },
    conversions: { some: {} },
  };

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
  if (filter?.errorCode !== undefined) {
    whereCondition.errorCode = filter.errorCode;
  }
  if (filter?.transferSettlementWindowId !== undefined) {
    whereCondition.transferSettlementWindowId = filter.transferSettlementWindowId;
  }
  if (filter?.transferState) {
    whereCondition.transferState = filter.transferState;
  }
  if (filter?.conversionState) {
    whereCondition.conversions.some.conversionState = filter.conversionState;
  }
  if (filter?.transactionType) {
    whereCondition.transactionType = filter.transactionType;
  }
  if (filter?.sourceCurrency) {
    whereCondition.sourceCurrency = filter.sourceCurrency;
  }
  if (filter?.targetCurrency) {
    whereCondition.targetCurrency = filter.targetCurrency;
  }

  if (filter?.payer) {
    if (filter.payer.partyIdType) {
      whereCondition.payerParty.is.partyIdType = filter.payer.partyIdType;
    }

    if (filter.payer.partyIdentifier) {
      whereCondition.payerParty.is.partyIdentifier = filter.payer.partyIdentifier;
    }
  }

  if (filter?.payee) {
    if (filter.payee.partyIdType) {
      whereCondition.payeeParty.is.partyIdType = filter.payee.partyIdType;
    }

    if (filter.payee.partyIdentifier) {
      whereCondition.payeeParty.is.partyIdentifier = filter.payee.partyIdentifier;
    }
  }

  return whereCondition;
};
