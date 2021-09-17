import { objectType } from 'nexus';

const Party = objectType({
  name: 'Party',
  definition(t) {
    t.nonNull.int('id');
  },
});

export default [Party];
