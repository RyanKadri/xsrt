import { inject, injectable, optional } from "inversify";
import { ScraperConfig, ScraperConfigToken } from "../config/scraper-config";

@injectable()
export class LoggingService implements ILoggingService {

    constructor(
        @optional() @inject(ScraperConfigToken) private config: Pick<ScraperConfig, "debugMode">
    ) {
        if (!config) {
            this.config = {
                debugMode: true
            };
        }
    }

    // tslint:disable:no-console
    info = this.createLogger(console.log);
    warn = this.createLogger(console.warn);
    error = this.createLogger(console.error);
    debug = this.createLogger(console.debug);
    // tslint:enable:no-console

    private createLogger(logFn: typeof console.log) {
        const log: LogFn = (first: any, second?: any) => {
            if (this.config.debugMode) {
                if (typeof first === "function") {
                    logFn(`${first.name}: ${second}`);
                } else {
                    logFn(first);
                }
            }
        };

        return log;

    }

}

export class NoopLogger implements ILoggingService {
  debug() {}
  info() {}
  warn() {}
  error() {}
}

export interface ILoggingService {
  debug: LogFn;
  info: LogFn;
  warn: LogFn;
  error: LogFn;
}

type LogFn = {
    (context: (...args: any[]) => any, message: any): void
    (message: any): void
}
