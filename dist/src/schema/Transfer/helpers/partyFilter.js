"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPartyFilter = void 0;
const createPartyFilter = (payee, payer) => {
    const partyFilter = [];
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
exports.createPartyFilter = createPartyFilter;
//# sourceMappingURL=partyFilter.js.map