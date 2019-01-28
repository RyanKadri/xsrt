import { Typography } from "@material-ui/core";
import { DependencyInjector, Omit, StripArray } from "@xsrt/common";
import { DependencyContext } from "@xsrt/common-frontend";
import { interfaces } from "inversify";
import React, { ComponentType } from "react";
import { RouteComponentProps } from "react-router";
import { IState } from "./state/state";

export function withData<P, K extends keyof P>(
    DIComponent: ComponentType<P>, resolvers: DataResolvers<P, K>
): ComponentType<Omit<P, K> & { routeParams: RouteComponentProps }> {
    return class WithData extends React.Component<
        Omit<P, K> & { routeParams: RouteComponentProps },
        WithDataState
    > {

        static contextType = DependencyContext;

        constructor(props: Omit<P, K> & { routeParams: RouteComponentProps }) {
            super(props);
            this.state = {
                data: [],
                fieldDependencies: undefined,
            };
        }

        render() {
            if (!this.state.fieldDependencies || this.state.fieldDependencies.length > 0) {
                return <Typography variant="body1">Loading</Typography>;
            } else {
                const newProps = {...this.props as any};
                this.state.data.forEach(({field, value}) => {
                    newProps[field] = value;
                });
                return <DIComponent {...newProps}/>;
            }
        }

        componentDidUpdate(oldProps: Omit<P, K> & { routeParams: RouteComponentProps }) {
            if (oldProps.routeParams.location.pathname !== this.props.routeParams.location.pathname) {
                this.cleanupDependencies();
                this.update();
            }
        }

        componentDidMount() {
            this.update();
        }

        componentWillUnmount() {
            this.cleanupDependencies();
        }

        private cleanupDependencies() {
            if (this.state.fieldDependencies) {
                this.state.fieldDependencies.forEach(dep => {
                    dep.state.unwatch(dep.watchId);
                });
            }
        }

        private update() {
            const container: DependencyInjector = this.context;
            const loadingResolvers = Object.entries(resolvers)
                .map(([field, resolverOpts]) => {
                    const resolverOptions = resolverOpts as DataResolver<any, any>;
                    const resolver = container.inject<Resolver<any>>(resolverOptions.resolver);
                    const state = container.inject<IState<any>>(resolverOptions.state);
                    const resolvePromise = resolver.resolve(this.props.routeParams)
                        .then((data: any) => {
                            if (Array.isArray(data)) {
                                state.upsert(data);
                            } else {
                                state.upsert([data]);
                            }
                        });
                    const watchId = state.watch(resolverOptions.criteria, (items: any[]) => {
                        this.setState(oldState => ({
                            fieldDependencies: (oldState.fieldDependencies || []).filter(prom => prom.field !== field),
                            data: [
                                ...oldState.data.filter(({ field: dataField }) => dataField !== field ),
                                {
                                    field,
                                    value: resolverOptions.unique
                                        ? items[0]
                                        : items
                                } // TODO - Need to handle some errors here
                            ]
                        }));
                    });
                    return { field, resolver: resolvePromise, state, watchId };
                });
            this.setState({
                fieldDependencies: loadingResolvers
            });
        }
    };
}

export type DataResolvers<T, K extends keyof T> = { [key in K]: DataResolver<T, K> };

export interface DataResolver<T, K extends keyof T> {
    resolver: interfaces.Newable<Resolver<StripArray<T[K]>>>;
    state: interfaces.Newable<IState<StripArray<T[K]>>>;
    criteria: (item: T) => boolean;
    unique: boolean;
}

export interface Resolver<T> {
    resolve(routeParams: RouteComponentProps): Promise<T | T[]>;
}

interface WithDataState {
    fieldDependencies?: {
        field: string;
        resolver: Promise<void>;
        watchId: number;
        state: IState<any>;
    }[];
    data: {
        field: string;
        value: any;
    }[];
}
