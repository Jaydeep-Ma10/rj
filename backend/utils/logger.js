import winston from 'winston';
import path from 'path';
import 'winston-daily-rotate-file';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Create logger instance
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',  
  format: logFormat,
  defaultMeta: { service: 'wingo-backend' },
  transports: [
    // Write all logs with level `error` and below to `error.log`
    new winston.transports.DailyRotateFile({
      filename: path.join(__dirname, '../../logs/error-%DATE%.log'),
      level: 'error',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d'
    }),
    // Write all logs with level `info` and below to `combined.log`
    new winston.transports.DailyRotateFile({
      filename: path.join(__dirname, '../../logs/combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d'
    })
  ]
});

// If we're not in production, log to the `console`
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Create a stream for morgan (HTTP request logging)
const stream = {
  write: (message) => {
    logger.info(message.trim());
  },
};

export { logger, stream };
