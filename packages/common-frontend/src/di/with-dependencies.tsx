import { DependencyInjector, Omit } from "../../../common/src";
import React, { ComponentType } from "react";

export const DependencyContext = React.createContext<DependencyInjector | undefined>(undefined);

export function withDependencies<P, K extends keyof P>(
    DIComponent: ComponentType<P>, dependencies: Dependencies<K>
): ComponentType<Omit<P, K>> {
    return (props: Omit<P, K>) => <DependencyContext.Consumer children={
        dependencyContainer => {
            const newProps = {...props as any};
            Object.entries(dependencies).forEach(([key, val]) => newProps[key] = dependencyContainer!.inject(val as any));
            return <DIComponent {...newProps}/>;
        }
    } />;
}

export type Dependencies<K extends string | number | symbol> = { [key in K]: any};
