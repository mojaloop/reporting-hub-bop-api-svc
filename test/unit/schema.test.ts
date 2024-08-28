import 'tsconfig-paths/register';

test('able to create schema', async () => {
  try {
    await import('@app/schema');
  } catch (error) {
    console.error(error);
    throw new Error('Unable to create schema');
  }
});
