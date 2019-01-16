import { LoggingService } from "./log-service";

describe('LogService', () => {
    it('Does not log information if in debug mode', () => {
        const testConsole = spyOn(console, "log");
        const logService = new LoggingService({ debugMode: false });
        logService.info("Test");
        expect(testConsole).not.toHaveBeenCalled();
    });

    it('Uses the appropriate logger when not in debug mode', () => {
        const testConsole = spyOn(console, "error");
        const logService = new LoggingService({ debugMode: true });
        logService.error("Blahh");
        expect(testConsole).toHaveBeenCalledWith("Blahh")
    })

    it('Can reference a function in logged messages', () => {
        const testConsole = spyOn(console, "log");
        const logService = new LoggingService({ debugMode: true });
        logService.info(function test() {}, "Blahh");
        expect(testConsole).toHaveBeenCalledWith("test: Blahh")
    });

})
