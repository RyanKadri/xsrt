import { inject, injectable } from 'inversify';
import { ScraperConfig, ScraperConfigToken } from '../../scraper/scraper-config,';

@injectable()
export class LoggingService {

    constructor(
        @inject(ScraperConfigToken) private config: Pick<ScraperConfig, "debugMode">
    ) {}

    info = this.createLogger(console.log)
    warn = this.createLogger(console.warn)
    error = this.createLogger(console.error)
    debug = this.createLogger(console.debug)

    private createLogger(logFn: typeof console.log) {
        const log: {
            (context: Function, message: any, ...args: any[]): void
            (message: any, ...args: any[]): void
        } = (first: any, second?: any, ...args: any[]) => {
            if(this.config.debugMode) {
                if(typeof first === 'function') {
                    logFn(`${first.name}: ${second}`, ...args);
                } else {
                    logFn(first, second, ...args)
                }
            }
        };

        return log;
        
    }

}