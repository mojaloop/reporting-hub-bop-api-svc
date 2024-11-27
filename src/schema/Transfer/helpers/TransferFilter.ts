export const createWhereCondition = (filter: any) => {
  const whereCondition: any = {
    createdAt: {},
  };

  // Required filters
  if (filter?.startDate) {
    whereCondition.createdAt.gte = new Date(filter.startDate);
  }

  if (filter?.endDate) {
    whereCondition.createdAt.lte = new Date(filter.endDate);
  }

  // Optional filters
  if (filter?.payerDFSP) {
    whereCondition.payerDFSP = filter.payerDFSP;
  }
  if (filter?.payeeDFSP) {
    whereCondition.payeeDFSP = filter.payeeDFSP;
  }
  if (filter?.transferState) {
    whereCondition.transferState = filter.transferState;
  }
  if (filter?.conversionState) {
    // Handle conversionState filter with OR condition
    whereCondition.OR = [
      {
        conversions: {
          is: {
            payer: {
              is: {
                conversionState: filter.conversionState,
              },
            },
          },
        },
      },
      {
        conversions: {
          is: {
            payee: {
              is: {
                conversionState: filter.conversionState,
              },
            },
          },
        },
      },
    ];
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

  // Handle Payer filter
  if (filter?.payer) {
    const payerFilter: any = {};
    if (filter.payer.partyIdType) {
      payerFilter.partyIdType = filter.payer.partyIdType;
    }
    if (filter.payer.partyIdentifier) {
      payerFilter.partyIdentifier = filter.payer.partyIdentifier;
    }
    if (Object.keys(payerFilter).length) {
      whereCondition.payerParty = { is: payerFilter };
    }
  }

  // Handle Payee filter
  if (filter?.payee) {
    const payeeFilter: any = {};
    if (filter.payee.partyIdType) {
      payeeFilter.partyIdType = filter.payee.partyIdType;
    }
    if (filter.payee.partyIdentifier) {
      payeeFilter.partyIdentifier = filter.payee.partyIdentifier;
    }
    if (Object.keys(payeeFilter).length) {
      whereCondition.payeeParty = { is: payeeFilter };
    }
  }
  return whereCondition;
};
