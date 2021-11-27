import { createPartyFilter } from '.';
import { createParticipantFilter } from '.';
import { NexusGenInputs } from 'nexus-typegen';
import { Prisma } from '@app/generated/centralLedger';
import transferWhereInput = Prisma.transferWhereInput;
import transferFulfilmentWhereInput = Prisma.transferFulfilmentWhereInput;

export const createTransferFilter = (participants?: string[], filter?: NexusGenInputs['TransferFilter']) => {
  let payeeDFSPs;
  let payerDFSPs;

  if (participants) {
    payeeDFSPs = payerDFSPs = participants || [];
  }
  if (participants && filter?.payer?.dfsp) {
    payerDFSPs = participants?.includes(filter.payer.dfsp) ? [filter.payer.dfsp] : [];
  } else if (filter?.payer?.dfsp) {
    payerDFSPs = [filter.payer.dfsp];
  }
  if (participants && filter?.payee?.dfsp) {
    payeeDFSPs = participants?.includes(filter.payee.dfsp) ? [filter.payee.dfsp] : [];
  } else if (filter?.payee?.dfsp) {
    payeeDFSPs = [filter.payee.dfsp];
  }

  const transferFilter: transferWhereInput = {};

  if (filter?.errorCode) {
    transferFilter.transferError = {
      some: {
        errorCode: filter?.errorCode || undefined,
      },
    };
  }

  if (filter?.transferState) {
    transferFilter.transferStateChange = {
      some: {
        transferState: {
          enumeration: filter?.transferState,
        },
      },
    };
  }

  if (filter?.settlementWindowId || filter?.settlementId) {
    const settlementFilter: transferFulfilmentWhereInput = {};
    if (filter?.settlementId) {
      settlementFilter.settlementWindow = {
        settlementSettlementWindow: {
          some: {
            settlementId: filter?.settlementId,
          },
        },
      };
    }

    if (filter?.settlementWindowId) {
      settlementFilter.settlementWindowId = filter?.settlementWindowId;
    }

    transferFilter.transferFulfilment = {
      some: settlementFilter,
    };
  }

  if (filter?.currency) {
    transferFilter.currency = filter?.currency;
  }

  if (filter?.payee?.idType || filter?.payee?.idValue || filter?.payer?.idType || filter?.payer?.idValue) {
    transferFilter.quote = {
      some: {
        quoteParty: {
          every: {
            OR: createPartyFilter(filter?.payee, filter?.payer),
          },
        },
      },
    };
  }

  if (payeeDFSPs || payerDFSPs) {
    transferFilter.transferParticipant = {
      every: {
        OR: createParticipantFilter(payeeDFSPs, payerDFSPs),
      },
    };
  }

  return transferFilter;
};
