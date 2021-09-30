/**************************************************************************
 *  (C) Copyright Mojaloop Foundation 2020                                *
 *                                                                        *
 *  This file is made available under the terms of the license agreement  *
 *  specified in the corresponding source code repository.                *
 *                                                                        *
 *  ORIGINAL AUTHOR:                                                      *
 *       Yevhen Kyriukha <yevhen.kyriukha@modusbox.com>                   *
 **************************************************************************/

import winston from 'winston';

const { combine, timestamp, prettyPrint } = winston.format;
// import { Loggly } from 'winston-loggly-bulk';

enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  ERROR = 'error',
}

const createLogger = (level: LogLevel): winston.Logger =>
  winston.createLogger({
    format: combine(
      // label({ label: 'right meow!' }),
      timestamp(),
      prettyPrint()
    ),
    transports: [
      new winston.transports.Console({ level }),
      /*
      new Loggly({
        token: config.logglyKey,
        subdomain: 'nstyle',
        tags: ['Winston-NodeJS'],
        json: true,
      }))
       */
    ],
  });

export { createLogger, LogLevel };
export { Logger } from 'winston';
