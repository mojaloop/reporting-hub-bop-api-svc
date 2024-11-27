import { objectType } from 'nexus';

const settlementStateChange = objectType({
  name: 'settlementStateChange',
  definition(t) {
    t.string('status');
    t.nonNull.dateTimeFlex('dateTime');
    t.string('reason');
  },
});
const settlementWindows = objectType({
  name: 'settlementWindows',
  definition(t) {
    t.bigInt('settlementWindowId');
  },
});

const Settlement = objectType({
  name: 'Settlement',
  definition(t) {
    t.bigInt('settlementId');
    t.list.field('settlementStateChange', { type: 'settlementStateChange' });
    t.string('settlementStatus');
    t.string('settlementModel');
    t.list.field('settlementWindows', { type: 'settlementWindows' });
    t.dateTimeFlex('createdAt');
    t.dateTimeFlex('lastUpdatedAt');
  },
});

export default [Settlement, settlementWindows, settlementStateChange];
