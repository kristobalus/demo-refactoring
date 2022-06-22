
import { createLogger, LoggerOptions, Stream } from "bunyan";
import Logger = require("bunyan");
import PrettyStream = require('bunyan-prettystream');

export class LoggerConfig implements LoggerOptions {

    streams: Stream[] = [
        {
            stream: process.stdout,
            level: "trace"
        } as Stream
    ]

    name: string;

}

export class LoggerFactory {

    constructor() {}

    create(name: string = "app"): Logger {

        const loggerConfig = new LoggerConfig()

        if ( process.env.NODE_ENV == "development" ) {
            const outputStream = new PrettyStream();
            outputStream.pipe(process.stdout);
            loggerConfig.streams[0].stream = outputStream
        }

        loggerConfig.name = name
        return createLogger(loggerConfig);
    }

}