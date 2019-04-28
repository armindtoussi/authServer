const appRoot    = require('app-root-path');
const winston    = require('winston');
const { format } = require('winston');

// Define Logger with custom settings.
const logger = winston.createLogger(
    {
        level: 'info',
        format: format.combine(
            format.timestamp({
                format: 'YYYY-MM-DD:HH:mm:ss'
            }),
            format.colorize(),
            format.json()
        ),
        transports: [
            new winston.transports.File(
                { 
                    filename: `${appRoot}//logs//error.log`, 
                    level: 'error',
                    maxsize: 5242880,
                    maxFiles: 5,
                    colorize: true,
                    handleExceptions: true,
                }
            ),
            new winston.transports.File(
                { 
                    filename: `${appRoot}//logs//combined.log`,
                    maxsize: 5242880,
                    maxFiles: 5,
                    colorize: true,
                    handleExceptions: true,
                }
            )
        ],
        exitOnError: false
    }
);

if(process.env.NODE_ENV !== 'production')
{
    logger.add(new winston.transports.Console(
        {
            format: winston.format.simple(),
        }
    ));
}


module.exports = logger;
