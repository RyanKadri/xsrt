import React, { ComponentType } from "react";
import { Omit } from "../../common/utils/type-utils";
import { PlayerContainer } from "../inversify.player";

export function withDependencies<P, K extends keyof P>(
    DIComponent: ComponentType<P>, dependencies: Dependencies<K>
): ComponentType<Omit<P, K>> {
    return (props: Omit<P, K>) => {
        const newProps = {...props as any};
        Object.entries(dependencies).forEach(([key, val]) => newProps[key] = PlayerContainer.get(val));
        return <DIComponent {...newProps}/>;
    };
}

export type Dependencies<K extends string | number | symbol> = { [key in K]: any};
