import { Typography } from '@material-ui/core';
import { interfaces } from "inversify";
import React, { ComponentType } from "react";
import { RouteComponentProps } from "react-router";
import { Omit, StripArray } from "../../common/utils/type-utils";
import { PlayerContainer } from "../inversify.player";
import { IState } from './state/state';

export function withData<P, K extends keyof P>(DIComponent: ComponentType<P>, resolvers: DataResolvers<P, K>): ComponentType<Omit<P, K> & { routeParams: RouteComponentProps }> {
    return class WithData extends React.Component<Omit<P, K> & { routeParams: RouteComponentProps }, WithDataState> {
        
        constructor(props: Omit<P, K> & { routeParams: RouteComponentProps }) {
            super(props);
            this.state = {
                data: [],
                loadingResolvers: undefined
            }
        }

        render() {
            if(!this.state.loadingResolvers || this.state.loadingResolvers.length > 0) {
                return <Typography variant="body1">Loading</Typography>
            } else {
                const newProps = {...this.props as any};
                this.state.data.forEach(({field, value}) => {
                    newProps[field] = value;
                });
                return <DIComponent {...newProps}/>
            }
        }

        componentDidUpdate(oldProps: Omit<P, K> & { routeParams: RouteComponentProps }) {
            if(oldProps.routeParams.location.pathname !== this.props.routeParams.location.pathname) {
                this.update()
            }
        }

        componentDidMount() {
            this.update();
        }

        private update() {
            const loadingResolvers = Object.entries(resolvers)
                .map(([field, resolverOpts]) => {
                    const resolverOptions = resolverOpts as DataResolver<any, any>;
                    const resolver = PlayerContainer.get<Resolver<any>>(resolverOptions.resolver);
                    const state = PlayerContainer.get<IState<any>>(resolverOptions.state);
                    const resolvePromise = resolver.resolve(this.props.routeParams)
                        .then(data => {
                            if(Array.isArray(data)) {
                                state.upsert(data);
                            } else {
                                state.upsert([data])
                            }
                        });
                    state.watch(resolverOptions.criteria, (items: any[]) => {
                        this.setState(oldState => ({
                            loadingResolvers: (oldState.loadingResolvers || []).filter(prom => prom.field !== field),
                            data: [
                                ...oldState.data.filter(({ field: dataField }) => dataField !== field ),
                                { field, value: resolverOptions.unique ? items[0] : items } // TODO - Need to handle some errors here
                            ]
                        }))
                    })
                    return { field, resolver: resolvePromise };
                });
            this.setState({
                loadingResolvers
            })
        }
    }
}

export type DataResolvers<T, K extends keyof T> = { [key in K]: DataResolver<T, K> }

export type DataResolver<T, K extends keyof T> = {
    resolver: interfaces.Newable<Resolver<StripArray<T[K]>>>;
    state: interfaces.Newable<IState<StripArray<T[K]>>>;
    criteria: (item: T) => boolean;
    unique: boolean;
}

export interface Resolver<T> {
    resolve(routeParams: RouteComponentProps): Promise<T | T[]>
}

interface WithDataState {
    loadingResolvers?: {
        field: string;
        resolver: Promise<void>;
    }[]
    data: {
        field: string;
        value: any;
    }[]
}