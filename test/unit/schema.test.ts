import 'tsconfig-paths/register';

test('able to create schema', async () => {
  try {
    await import('@app/schema');
  } catch (error) {
    console.error(error);
    fail('Unable to create schema');
  }
});
