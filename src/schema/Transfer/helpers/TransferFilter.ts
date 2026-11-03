const TransferField = {
  PAYER_CONVERSION_STATE: 'conversions.payer.conversionState',
  PAYEE_CONVERSION_STATE: 'conversions.payee.conversionState',
  PAYER_PARTY_ID_TYPE: 'payerParty.partyIdType',
  PAYER_PARTY_IDENTIFIER: 'payerParty.partyIdentifier',
  PAYEE_PARTY_ID_TYPE: 'payeeParty.partyIdType',
  PAYEE_PARTY_IDENTIFIER: 'payeeParty.partyIdentifier',
} as const;

export const createWhereCondition = (filter: any) => {
  const matchCondition: any = {};

  if (!Object.keys(filter).length) {
    return {};
  }

  if (filter.startDate) {
    matchCondition.createdAt = { ...matchCondition.createdAt, $gte: new Date(filter.startDate) };
  }

  if (filter.endDate) {
    matchCondition.createdAt = { ...matchCondition.createdAt, $lte: new Date(filter.endDate) };
  }

  if (filter.payerDFSP) {
    matchCondition.payerDFSP = filter.payerDFSP;
  }
  if (filter.payeeDFSP) {
    matchCondition.payeeDFSP = filter.payeeDFSP;
  }
  if (filter.transferState) {
    matchCondition.transferState = filter.transferState;
  }
  if (filter.conversionState) {
    matchCondition.$or = [
      { [TransferField.PAYER_CONVERSION_STATE]: filter.conversionState },
      { [TransferField.PAYEE_CONVERSION_STATE]: filter.conversionState },
    ];
  }

  if (filter.transactionType) {
    matchCondition.transactionType = filter.transactionType;
  }

  if (filter.sourceCurrency) {
    matchCondition.sourceCurrency = filter.sourceCurrency;
  }

  if (filter.targetCurrency) {
    matchCondition.targetCurrency = filter.targetCurrency;
  }

  if (filter.payer?.partyIdType) {
    matchCondition[TransferField.PAYER_PARTY_ID_TYPE] = filter.payer.partyIdType;
  }
  if (filter.payer?.partyIdentifier) {
    matchCondition[TransferField.PAYER_PARTY_IDENTIFIER] = filter.payer.partyIdentifier;
  }

  if (filter.payee?.partyIdType) {
    matchCondition[TransferField.PAYEE_PARTY_ID_TYPE] = filter.payee.partyIdType;
  }
  if (filter.payee?.partyIdentifier) {
    matchCondition[TransferField.PAYEE_PARTY_IDENTIFIER] = filter.payee.partyIdentifier;
  }

  return matchCondition;
};
