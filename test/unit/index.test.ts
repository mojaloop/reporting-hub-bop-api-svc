import type { Server } from 'node:http';

jest.mock('../../src/schema', () => ({ __esModule: true, default: {} }));
jest.mock('graphql-middleware', () => ({ applyMiddleware: jest.fn() }));
jest.mock('@mojaloop/authz', () => ({
  createGuard: jest.fn(async () => ({ expose: () => (_req: unknown, _res: unknown, next: () => void) => next() })),
}));
jest.mock('@apollo/server', () => ({ ApolloServer: jest.fn() }));
jest.mock('@apollo/server/express4', () => ({
  expressMiddleware: jest.fn(() => (_req: unknown, _res: unknown, next: () => void) => next()),
}));
jest.mock('@apollo/server/plugin/drainHttpServer', () => ({ ApolloServerPluginDrainHttpServer: jest.fn() }));
jest.mock('@app/lib', () => ({ createAuthMiddleware: jest.fn(), createEventStores: jest.fn() }));

const Signal = {
  TERM: 'SIGTERM',
} as const;

const ANY_PORT = '0';

describe('reporting API service', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('owns the signals, drains the HTTP server through Apollo, then closes the event store client', async () => {
    process.env.PORT = ANY_PORT;
    const { ApolloServer } = jest.requireMock('@apollo/server');
    const { ApolloServerPluginDrainHttpServer } = jest.requireMock('@apollo/server/plugin/drainHttpServer');
    const { createEventStores } = jest.requireMock('@app/lib');

    let drained: Server | undefined;
    ApolloServerPluginDrainHttpServer.mockImplementation(({ httpServer }: { httpServer: Server }) => {
      drained = httpServer;
      return {};
    });
    const apollo = {
      start: jest.fn(),
      stop: jest.fn(() => new Promise<void>((resolve) => drained?.close(() => resolve()))),
    };
    ApolloServer.mockImplementation(() => apollo);
    const client = { connect: jest.fn(), close: jest.fn() };
    createEventStores.mockReturnValue({ client });
    const once = jest.spyOn(process, 'once').mockImplementation(() => process);

    jest.isolateModules(() => {
      require('../../src/index');
    });
    const handlers = Object.fromEntries(once.mock.calls) as Record<string, () => Promise<void>>;
    while (!drained?.listening) await new Promise((resolve) => setImmediate(resolve));
    await handlers[Signal.TERM]();

    expect(ApolloServer).toHaveBeenCalledWith(expect.objectContaining({ stopOnTerminationSignals: false }));
    expect(ApolloServerPluginDrainHttpServer).toHaveBeenCalledWith(
      expect.objectContaining({ stopGracePeriodMillis: Infinity })
    );
    expect(drained?.listening).toBe(false);
    expect(apollo.stop.mock.invocationCallOrder[0]).toBeLessThan(client.close.mock.invocationCallOrder[0]);
  });
});
