/**************************************************************************
 *  (C) Copyright Mojaloop Foundation 2026                                *
 *                                                                        *
 *  This file is made available under the terms of the license agreement  *
 *  specified in the corresponding source code repository.                *
 **************************************************************************/

export const SHUTDOWN_SIGNALS = Object.freeze(['SIGTERM', 'SIGINT'] as const);

export const EXIT_CODE = Object.freeze({ FAILURE: 1 } as const);

export type Stop = () => unknown;

/** Starts one part of the service and resolves to what stops it, or to nothing when it opens nothing. */
export type Step = () => Promise<Stop | void> | Stop | void;

export interface LifecycleLogger {
  info(message: string): void;
  error(message: string, err: unknown): void;
}

export interface Lifecycle {
  start(options: { logger: LifecycleLogger; steps: readonly Step[] }): Promise<boolean>;
}

/**
 * Starts the service one step at a time and stops it on SIGTERM or SIGINT.
 * The started steps stop in reverse order. A signal during startup lets the
 * running step finish and starts nothing after it.
 *
 * The signals are taken from the moment this is called. Until then node
 * dies of them, so the entry module has it called before it loads anything
 * else.
 */
export const createLifecycle = (): Lifecycle => {
  const stops: Stop[] = [];
  let stopping = false;
  let begin: (started: { logger: LifecycleLogger; startup: Promise<boolean> }) => void = () => {};
  const begun = new Promise<{ logger: LifecycleLogger; startup: Promise<boolean> }>((resolve) => {
    begin = resolve;
  });

  const runSteps = async (steps: readonly Step[]): Promise<boolean> => {
    for (const step of steps) {
      if (stopping) return false;
      const stop = await step();
      if (stop) stops.push(stop);
    }
    return true;
  };

  const stop = async (logger: LifecycleLogger): Promise<void> => {
    for (let next = stops.pop(); next; next = stops.pop()) {
      await next();
    }
    logger.info('Shutdown complete');
  };

  const onSignal = async (signal: string): Promise<void> => {
    stopping = true;
    const { logger, startup } = await begun;
    logger.info(`Shutting down on ${signal}`);
    try {
      await startup;
      await stop(logger);
    } catch (err) {
      logger.error('Shutdown failed', err);
      process.exit(EXIT_CODE.FAILURE);
    }
  };

  SHUTDOWN_SIGNALS.forEach((signal) => process.once(signal, () => onSignal(signal)));

  return {
    start: ({ logger, steps }) => {
      const startup = runSteps(steps);
      begin({ logger, startup });
      return startup;
    },
  };
};
