import { Container, interfaces } from "inversify";
import { initializeApp } from './app-initializer';
import { DependencyInjector } from "./dependency-injector";

describe(initializeApp.name, () => {
    it("Binds a read-only DI service that can be used later (with caution)", () => {
        const bind = jasmine.createSpyObj<interfaces.BindingToSyntax<any>>("binding", { toConstantValue: undefined });
        const container = jasmine.createSpyObj<Container>("container", {
            bind
        });
        const injector = initializeApp([], container);
        expect(injector instanceof DependencyInjector).toBeTruthy();
        expect(container.bind).toHaveBeenCalledWith(DependencyInjector);
        expect(bind.toConstantValue).toHaveBeenCalledWith(injector);
    })
})
