import { Container, inject, injectable } from "inversify";
import { ContainerSymbol } from "../di/di.tokens";
import { DIToken } from "./app-initializer";

@injectable()
export class DependencyInjector {

    constructor(
        @inject(ContainerSymbol) private diContainer: Pick<Container, "get">
    ) { }

    inject<T>(token: DIToken<T>) {
        return this.diContainer.get(token) as T;
    }
}
