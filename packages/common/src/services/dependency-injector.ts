import { Container, inject, injectable } from "inversify";
import { ContainerSymbol } from "../di/di.tokens";
import { Interface } from "../utils/type-utils";
import { DIToken } from "./app-initializer";

@injectable()
export class DependencyInjector {

    constructor(
        @inject(ContainerSymbol) private diContainer: Interface<Container>
    ) { }

    inject<T>(token: DIToken<T>) {
        return this.diContainer.get(token) as T;
    }
}
