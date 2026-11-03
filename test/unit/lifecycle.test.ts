import { createLifecycle, EXIT_CODE, SHUTDOWN_SIGNALS, Step } from '../../src/lifecycle';

const Signal = {
  TERM: 'SIGTERM',
  INT: 'SIGINT',
} as const;

const logger = { info: jest.fn(), error: jest.fn() };

const withSignals = () => {
  const once = jest.spyOn(process, 'once').mockImplementation(() => process);
  const lifecycle = createLifecycle();
  const handlers = Object.fromEntries(once.mock.calls) as Record<string, () => Promise<void>>;
  once.mockRestore();
  return { lifecycle, handlers };
};

const startWithSignals = (steps: Step[]) => {
  const { lifecycle, handlers } = withSignals();
  return { startup: lifecycle.start({ logger, steps }), handlers };
};

const stepStopping = (stop: jest.Mock) => jest.fn(async () => stop);

const callOrder = (fns: jest.Mock[]) => fns.map((fn) => fn.mock.invocationCallOrder[0]);

const nextTurn = () => new Promise((resolve) => setImmediate(resolve));

describe('lifecycle', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('listens for SIGTERM and SIGINT from the moment it is created', () => {
    const { handlers } = withSignals();

    expect(Object.keys(handlers)).toEqual([Signal.TERM, Signal.INT]);
    expect(SHUTDOWN_SIGNALS).toEqual([Signal.TERM, Signal.INT]);
  });

  it('a signal before startup begins is held until it does, and then nothing starts', async () => {
    const { lifecycle, handlers } = withSignals();
    const step = jest.fn();

    const stopped = handlers[Signal.TERM]();
    const startup = lifecycle.start({ logger, steps: [step] });

    await expect(startup).resolves.toBe(false);
    await stopped;
    expect(step).not.toHaveBeenCalled();
    expect(logger.info).toHaveBeenCalledWith(`Shutting down on ${Signal.TERM}`);
  });

  it('runs the steps in order and stops them in reverse on a signal', async () => {
    const stops = [jest.fn(), jest.fn(), jest.fn()];
    const steps = stops.map(stepStopping);
    const { startup, handlers } = startWithSignals(steps);

    await expect(startup).resolves.toBe(true);
    expect(callOrder(steps)).toEqual([...callOrder(steps)].sort((a, b) => a - b));
    stops.forEach((stop) => expect(stop).not.toHaveBeenCalled());

    await handlers[Signal.TERM]();

    const order = callOrder(stops);
    expect(order).toEqual([...order].sort((a, b) => b - a));
  });

  it('a signal during startup lets the running step finish, starts nothing after it, then stops what started', async () => {
    const stopFirst = jest.fn();
    const stopRunning = jest.fn();
    let finishRunning: (() => void) | undefined;
    const running = jest.fn(
      () =>
        new Promise<jest.Mock>((resolve) => {
          finishRunning = () => resolve(stopRunning);
        })
    );
    const next = jest.fn();
    const { startup, handlers } = startWithSignals([stepStopping(stopFirst), running, next]);

    while (finishRunning === undefined) await nextTurn();
    const stopped = handlers[Signal.INT]();
    expect(stopRunning).not.toHaveBeenCalled();
    expect(stopFirst).not.toHaveBeenCalled();

    finishRunning();
    await expect(startup).resolves.toBe(false);
    await stopped;

    expect(next).not.toHaveBeenCalled();
    expect(stopRunning.mock.invocationCallOrder[0]).toBeLessThan(stopFirst.mock.invocationCallOrder[0]);
  });

  it('a failed stop exits with a failure code', async () => {
    const exit = jest.spyOn(process, 'exit').mockImplementation(() => undefined as never);
    const { startup, handlers } = startWithSignals([stepStopping(jest.fn().mockRejectedValue(new Error('stuck')))]);
    await startup;

    await handlers[Signal.TERM]();

    expect(exit).toHaveBeenCalledWith(EXIT_CODE.FAILURE);
  });

  it('a shutdown that stops everything leaves the exit to node', async () => {
    const exit = jest.spyOn(process, 'exit').mockImplementation(() => undefined as never);
    const { startup, handlers } = startWithSignals([stepStopping(jest.fn())]);
    await startup;

    await handlers[Signal.TERM]();

    expect(exit).not.toHaveBeenCalled();
  });
});
