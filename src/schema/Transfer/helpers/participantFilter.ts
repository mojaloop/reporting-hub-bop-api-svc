import { Prisma } from '@app/generated/centralLedger';
import transferParticipantWhereInput = Prisma.transferParticipantWhereInput;

export const createParticipantFilter = (payeeDFSPs: string[] | undefined, payerDFSPs: string[] | undefined) => {
  const payeeFilter: transferParticipantWhereInput = {
    transferParticipantRoleType: {
      name: 'PAYEE_DFSP',
    },
  };
  const payerFilter: transferParticipantWhereInput = {
    transferParticipantRoleType: {
      name: 'PAYER_DFSP',
    },
  };
  if (payeeDFSPs) {
    payeeFilter.participantCurrency = {
      participant: {
        name: {
          in: payeeDFSPs,
        },
      },
    };
  }
  if (payerDFSPs) {
    payerFilter.participantCurrency = {
      participant: {
        name: {
          in: payerDFSPs,
        },
      },
    };
  }

  return [payerFilter, payeeFilter];
};
