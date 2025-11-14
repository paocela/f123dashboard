import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Define log levels
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};
// Define log colors
const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'white',
};
// Tell winston about our colors
winston.addColors(colors);
// Define log format
const format = winston.format.combine(winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston.format.errors({ stack: true }), winston.format.splat(), winston.format.json());
// Console format (for development)
const consoleFormat = winston.format.combine(winston.format.colorize({ all: true }), winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston.format.printf((info) => `${info.timestamp} [${info.level}]: ${info.message}${info.stack ? '\n' + info.stack : ''}`));
// Define which transports the logger should use
const transports = [
    // Console transport
    new winston.transports.Console({
        format: consoleFormat,
    }),
];
// Add file transports in production
if (process.env.NODE_ENV === 'production') {
    const logDir = path.join(__dirname, '../../logs');
    // Error log
    transports.push(new winston.transports.File({
        filename: path.join(logDir, 'error.log'),
        level: 'error',
        format: format,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
    }));
    // Combined log
    transports.push(new winston.transports.File({
        filename: path.join(logDir, 'combined.log'),
        format: format,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
    }));
}
// Create the logger
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
    levels,
    format,
    transports,
    exitOnError: false,
});
// Create a stream object for Morgan (HTTP request logging)
export const stream = {
    write: (message) => {
        logger.http(message.trim());
    },
};
export default logger;
