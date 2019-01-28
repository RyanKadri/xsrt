import { injectable } from "inversify";

@injectable()
export class DateManager {
    now() {
        // tslint:disable-next-line:ban
        return Date.now();
    }
}
