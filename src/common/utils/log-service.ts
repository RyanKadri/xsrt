import { inject, injectable } from 'inversify';
import { ScraperConfig, ScraperConfigToken } from '../../scraper/scraper-config';

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
            (context: Function, message: any): void
            (message: any): void
        } = (first: any, second?: any) => {
            if(this.config.debugMode) {
                if(typeof first === 'function') {
                    logFn(`${first.name}: ${second}`);
                } else {
                    logFn(first);
                }
            }
        };

        return log;
        
    }

}