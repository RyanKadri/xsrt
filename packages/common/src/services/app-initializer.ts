import { Container, interfaces } from "inversify";
import { ApiConfig, EndpointDefinition } from "../endpoint/types";
import { ApiCreationService } from "../server/create-api";
import { DependencyInjector } from "./dependency-injector";

export async function initializeApp(
  definitions: DIDefinition[],
  needsInitialization: interfaces.Newable<NeedsInitialization>[] = [],
  container: Pick<Container, "bind" | "get"> = new Container({ autoBindInjectable: true, defaultScope: "Singleton" })
): Promise<DependencyInjector> {
  const injector = new DependencyInjector(container);
  container.bind(DependencyInjector).toConstantValue(injector);

  for (const initializer of definitions) {
    bindInitializer(initializer, container);
  }

  for (const toInit of needsInitialization) {
    const res = await container.get<NeedsInitialization>(toInit).initialize();
    if(res) {
      const [symbol, initialized] = res;
      container.bind(symbol).toConstantValue(initialized);
    }
  }
  return injector;
}

function bindInitializer(initializer: DIDefinition, container: Pick<Container, "bind" | "get">) {
  switch (initializer.type) {
    case "api":
      const apiCreator = container.get(ApiCreationService);
      const api = apiCreator.createApi(initializer.def, initializer.config);
      return container.bind(initializer.token).toConstantValue(api);
    case "constant":
      return container.bind(initializer.token).toConstantValue(initializer.value);
    case "container-dependent":
      const dependencies = initializer.dependencies.map(dep => container.get(dep));
      const item = initializer.creator(...dependencies);
      return container.bind(initializer.token).toConstantValue(item);
    case "group":
      return initializer.members.forEach(member => {
        container.bind(initializer.token)
          .to(member)
          .inSingletonScope();
      });
    case "implementation":
      return container.bind(initializer.token).to(initializer.implementation);
  }
}

/* istanbul ignore next */
export function constant<T>(token: symbol, value: T): ConstantDef<T> {
  return {
    type: "constant", token, value
  };
}

/* istanbul ignore next */
export function constantWithDeps<T>(
  token: DIToken<T>, dependencies: any[], creator: (dependencies: any) => T
): ContainerDependentConstant<T> {
  return {
    type: "container-dependent",
    token, dependencies, creator
  };
}

/* istanbul ignore next */
export function apiDef(token: symbol, def: EndpointDefinition, config: ApiConfig = { baseUrl: "" }): ApiDefinition {
  return {
    type: "api", token, def, config
  };
}

/* istanbul ignore next */
export function dependencyGroup(token: symbol, members: interfaces.Newable<any>[]): DependencyGroup {
  return {
    type: "group", token, members
  };
}

/* istanbul ignore next */
export function implementationChoice<T>(
  token: symbol, implementation: interfaces.Newable<T>
): ImplementationChoice {
  return {
    type: "implementation", token, implementation
  };
}

export interface NeedsInitialization {
  initialize(): Promise<[symbol, any] | void>;
}

export type DIDefinition = ConstantDef<any> | ContainerDependentConstant<any> | ApiDefinition
  | DependencyGroup | ImplementationChoice;

export type DIToken<T> = string | symbol | interfaces.Newable<T> | interfaces.Abstract<T>;

interface ConstantDef<T> {
  type: "constant";
  token: symbol;
  value: T;
}

interface ContainerDependentConstant<T> {
  type: "container-dependent";
  token: DIToken<T>;
  dependencies: any[];
  creator: (...dependencies: any[]) => T;
}

interface ApiDefinition {
  type: "api";
  token: symbol;
  def: EndpointDefinition;
  config: ApiConfig;
}

interface DependencyGroup {
  type: "group";
  token: symbol;
  members: interfaces.Newable<any>[];
}

interface ImplementationChoice {
  type: "implementation";
  token: symbol;
  implementation: interfaces.Newable<any>;
}
