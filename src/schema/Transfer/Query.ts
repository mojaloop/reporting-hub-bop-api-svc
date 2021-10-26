/**************************************************************************
 *  (C) Copyright Mojaloop Foundation 2020                                *
 *                                                                        *
 *  This file is made available under the terms of the license agreement  *
 *  specified in the corresponding source code repository.                *
 *                                                                        *
 *  ORIGINAL AUTHOR:                                                      *
 *       Yevhen Kyriukha <yevhen.kyriukha@modusbox.com>                   *
 **************************************************************************/

import { arg, extendType, inputObjectType, intArg, nonNull, stringArg } from 'nexus';

const PartyFilter = inputObjectType({
  name: 'PartyFilter',
  definition(t) {
    t.field('dfsp', { type: 'String' });
    t.field('idType', { type: 'PartyIDType' });
    t.field('idValue', { type: 'String' });
  },
});

const TransferFilter = inputObjectType({
  name: 'TransferFilter',
  definition(t) {
    t.nonNull.field('startDate', { type: 'DateTimeFlexible' });
    t.nonNull.field('endDate', { type: 'DateTimeFlexible' });
    t.field('errorCode', { type: 'Int' });
    t.field('payer', { type: 'PartyFilter' });
    t.field('payee', { type: 'PartyFilter' });
    t.field('currency', { type: 'Currency' });
    t.field('transferState', { type: 'TransferState' });
    t.field('settlementWindowId', { type: 'Int' });
    t.field('settlementId', { type: 'Int' });
  },
});

type Number = number | undefined;

const Query = extendType({
  type: 'Query',
  definition(t) {
    t.field('transfer', {
      type: 'Transfer',
      args: {
        transferId: nonNull(stringArg()),
      },
      resolve: async (parent, args, ctx) => {
        const tr = await ctx.centralLedger.transfer.findUnique({
          where: {
            transferId: args.transferId,
          },
          include: {
            transferStateChange: {
              select: {
                transferState: {
                  select: {
                    enumeration: true,
                  },
                },
              },
            },
            transferFulfilment: {
              select: {
                settlementWindow: {
                  select: {
                    settlementSettlementWindow: {
                      select: {
                        settlementId: true,
                        settlementWindowId: true,
                      },
                    },
                  },
                },
              },
            },
            quote: {
              select: {
                quoteId: true,
                transactionReferenceId: true,
                transactionScenario: {
                  select: {
                    name: true,
                  },
                },
              },
            },
            transferError: {
              select: {
                errorCode: true,
              },
            },
          },
        });
        if (!tr) {
          return null;
        }
        return {
          transferId: tr.transferId,
          transactionId: tr.quote[0]?.transactionReferenceId,
          quoteId: tr.quote[0]?.quoteId,
          amount: tr.amount.toNumber(),
          currency: tr.currencyId,
          createdAt: tr.createdDate.toISOString(),
          ilpCondition: tr.ilpCondition,
          transferState: tr.transferStateChange.slice(-1)[0]?.transferState.enumeration,
          transactionType: tr.quote[0]?.transactionScenario.name,
          errorCode: tr.transferError[0]?.errorCode,
          settlementId: tr.transferFulfilment[0]?.settlementWindow?.settlementSettlementWindow[0]
            ?.settlementId as Number,
          settlementWindowId: tr.transferFulfilment[0]?.settlementWindow?.settlementSettlementWindow[0]
            ?.settlementWindowId as Number,
        };
      },
    });
    t.nonNull.list.nonNull.field('transfers', {
      type: 'Transfer',
      args: {
        filter: arg({ type: nonNull('TransferFilter') }),
        limit: intArg(),
        offset: intArg(),
      },
      resolve: async (parent, args, ctx) => {
        let payeeDFSPs;
        let payerDFSPs;

        // If permissions are not enabled and filter isn't set, then don't apply filtering
        if (ctx.participants || args.filter?.payee?.dfsp) {
          payeeDFSPs = ctx.participants || [];
          if (args.filter?.payee?.dfsp) {
            payeeDFSPs.push(args.filter.payee.dfsp);
          }
        }

        if (ctx.participants || args.filter?.payer?.dfsp) {
          payerDFSPs = ctx.participants || [];
          if (args.filter?.payer?.dfsp) {
            payerDFSPs.push(args.filter.payer.dfsp);
          }
        }

        const transfers = await ctx.centralLedger.transfer.findMany({
          take: args.limit ?? 100,
          skip: args.offset || undefined,
          orderBy: [{ createdDate: 'desc' }],
          where: {
            createdDate: {
              gte: args.filter?.startDate || undefined,
              lt: args.filter?.endDate || undefined,
            },
            currencyId: args.filter?.currency || undefined,
            ...(args.filter?.errorCode
              ? {
                  transferError: {
                    some: {
                      errorCode: args.filter?.errorCode || undefined,
                    },
                  },
                }
              : {}),
            ...(args.filter?.transferState
              ? {
                  transferStateChange: {
                    some: {
                      transferState: {
                        enumeration: args.filter?.transferState,
                      },
                    },
                  },
                }
              : {}),
            ...(args.filter?.settlementWindowId
              ? {
                  transferFulfilment: {
                    some: {
                      settlementWindowId: args.filter?.settlementWindowId,
                      ...(args.filter?.settlementId
                        ? {
                            settlementWindow: {
                              settlementSettlementWindow: {
                                some: {
                                  settlementId: args.filter?.settlementId,
                                },
                              },
                            },
                          }
                        : {}),
                    },
                  },
                }
              : {}),
            quote: {
              some: {
                quoteParty: {
                  every: {
                    OR: [
                      {
                        partyType: {
                          name: 'PAYEE',
                        },
                        partyIdentifierType: {
                          name: args.filter?.payee?.idType || undefined,
                        },
                        partyIdentifierValue: args.filter?.payee?.idValue || undefined,
                      },
                      {
                        partyType: {
                          name: 'PAYER',
                        },
                        partyIdentifierType: {
                          name: args.filter?.payer?.idType || undefined,
                        },
                        partyIdentifierValue: args.filter?.payer?.idValue || undefined,
                      },
                    ],
                  },
                },
              },
            },
            transferParticipant: {
              every: {
                OR: [
                  {
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
                  },
                  {
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
                  },
                ],
              },
            },
          },
          include: {
            transferStateChange: {
              select: {
                transferState: {
                  select: {
                    enumeration: true,
                  },
                },
              },
            },
            transferFulfilment: {
              select: {
                settlementWindow: {
                  select: {
                    settlementSettlementWindow: {
                      select: {
                        settlementId: true,
                        settlementWindowId: true,
                      },
                    },
                  },
                },
              },
            },
            quote: {
              select: {
                quoteId: true,
                transactionReferenceId: true,
                transactionScenario: {
                  select: {
                    name: true,
                  },
                },
              },
            },
            transferError: {
              select: {
                errorCode: true,
              },
            },
          },
        });
        return transfers.map((tr) => ({
          transferId: tr.transferId,
          transactionId: tr.quote[0]?.transactionReferenceId,
          quoteId: tr.quote[0]?.quoteId,
          amount: tr.amount.toNumber(),
          currency: tr.currencyId,
          createdAt: tr.createdDate.toISOString(),
          ilpCondition: tr.ilpCondition,
          transferState: tr.transferStateChange.slice(-1)[0]?.transferState.enumeration,
          transactionType: tr.quote[0]?.transactionScenario.name,
          errorCode: tr.transferError[0]?.errorCode,
          settlementId: tr.transferFulfilment[0]?.settlementWindow?.settlementSettlementWindow[0]
            ?.settlementId as Number,
          settlementWindowId: tr.transferFulfilment[0]?.settlementWindow?.settlementSettlementWindow[0]
            ?.settlementWindowId as Number,
        }));
      },
    });
  },
});

export default [Query, TransferFilter, PartyFilter];
