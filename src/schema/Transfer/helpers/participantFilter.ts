import { Prisma } from '@app/generated/centralLedger';
import transferParticipantWhereInput = Prisma.transferParticipantWhereInput;

export const createParticipantFilter = (payeeDFSPs: string[] | undefined, payerDFSPs: string[] | undefined) => {
  const participantFilter: transferParticipantWhereInput[] = [];
  if (payeeDFSPs) {
    participantFilter.push({
      transferParticipantRoleType: {
        name: 'PAYEE_DFSP',
      },
      participantCurrency: {
        participant: {
          name: {
            in: payeeDFSPs,
          },
        },
      },
    });
  }

  if (payerDFSPs) {
    participantFilter.push({
      transferParticipantRoleType: {
        name: 'PAYER_DFSP',
      },
      participantCurrency: {
        participant: {
          name: {
            in: payerDFSPs,
          },
        },
      },
    });
  }

  return participantFilter;
};
