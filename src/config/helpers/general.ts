import { dirname, join } from 'path';
import pino from 'pino';
import findPackageJson from 'find-package-json';

export const pathFromSrc = (path: string) => {
  return join(__dirname, '../../', path);
};

export const rootProjectDir = () => {
  const finder = findPackageJson(__dirname);
  let isDone = false;

  while (!isDone) {
    const result = finder.next();
    isDone = true;
    return dirname(result.filename);
  }

  return process.cwd();
};

export const pathFromRoot = (path: string) => {
  return join(rootProjectDir(), path);
};

export const getLoggerFor = (destination = 'logs/uwebsockets.log') => {
  return pino({
    transport: {
      target: 'pino-pretty',
      options: {
        destination: pathFromRoot(`${destination}`),
        colorize: false,
        mkdir: true,
        crlf: true,
      },
    },
  }) as unknown as Record<
    'info' | 'warn' | 'error',
    (...args: unknown[]) => unknown
  >;
};

export const getWorkerLogger = () => {
  return getLoggerFor('logs/workers.log');
};
