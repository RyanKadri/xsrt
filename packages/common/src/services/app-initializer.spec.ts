import { Container } from "inversify";
import { initializeApp } from './app-initializer';
import { DependencyInjector } from "./dependency-injector";

describe(initializeApp.name, () => {
  it("Binds a read-only DI service that can be used later (with caution)", async () => {
    const toConstantValue = jest.fn();
    const container: Pick<Container, "bind" | "get"> = {
      bind: jest.fn().mockReturnValue({ toConstantValue }),
      get: jest.fn()
    };
    const injector = await initializeApp([], [], container);
    expect(injector instanceof DependencyInjector).toBeTruthy();
    expect(container.bind).toHaveBeenCalledWith(DependencyInjector);
    expect(toConstantValue).toHaveBeenCalledWith(injector);
  })
});
