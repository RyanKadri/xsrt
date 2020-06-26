import { Omit } from "@xsrt/common";
import React, { ComponentType, useContext, useState } from "react";
import { Dependencies, DependencyContext } from "./with-dependencies";

export function useComponent<P, K extends keyof P>(
    DIComponent: ComponentType<P>, dependencies: Dependencies<K>
): ComponentType<Omit<P, K>> {
    const context = useContext(DependencyContext);
    if (context === undefined) {
        throw new Error("Dependency Injection context not defined");
    }
    const [component] = useState(() => {
        return (props: Omit<P, K>) => {
            const newProps = {...props as any};
            Object.entries(dependencies).forEach(([key, val]) => newProps[key] = context.inject(val as any));
            return <DIComponent {...newProps}/>;
        };
    });
    return component;
}
