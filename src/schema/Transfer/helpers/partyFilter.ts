import { Prisma } from '@app/generated/centralLedger';
import quotePartyWhereInput = Prisma.quotePartyWhereInput;

interface PartyFilter {
  idType?: string | null;
  idValue?: string | null;
}

type PartyFilterArg = PartyFilter | null | undefined;

export const createPartyFilter = (payee: PartyFilterArg, payer: PartyFilterArg) => {
  const partyFilter: quotePartyWhereInput[] = [];

  if (payee?.idType || payee?.idValue) {
    partyFilter.push({
      partyType: {
        name: 'PAYEE',
      },
      partyIdentifierType: {
        name: payee?.idType || undefined,
      },
      partyIdentifierValue: payee?.idValue || undefined,
    });
  }

  if (payer?.idType || payer?.idValue) {
    partyFilter.push({
      partyType: {
        name: 'PAYER',
      },
      partyIdentifierType: {
        name: payer?.idType || undefined,
      },
      partyIdentifierValue: payer?.idValue || undefined,
    });
  }

  return partyFilter;
};
