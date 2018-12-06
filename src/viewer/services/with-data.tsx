import { ComponentType } from "react";
import { Omit } from "../../common/utils/type-utils";
import React from "react";
import { PlayerContainer } from "../inversify.player";
import { RouteComponentProps } from "react-router";

export function withData<P, K extends keyof P>(DIComponent: ComponentType<P>, resolvers: DataResolvers<K>): ComponentType<Omit<P, K> & { routeParams: RouteComponentProps }> {
    return class WithData extends React.Component<Omit<P, K> & { routeParams: RouteComponentProps }, WithDataState> {
        
        constructor(props) {
            super(props);
            this.state = {
                data: [],
                loadingResolvers: undefined
            }
        }

        render() {
            if(!this.state.loadingResolvers || this.state.loadingResolvers.length > 0) {
                return <h1>Loading</h1>
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
                .map(([field, resolver]) => {
                    const resolvePromise = PlayerContainer.get<Resolver>(resolver).resolve(this.props.routeParams)
                        .then(data => this.setState(oldState => ({
                            loadingResolvers: (oldState.loadingResolvers || []).filter(prom => prom.field !== field),
                            data: [
                                ...oldState.data,
                                { field, value: data}
                            ]
                        })))
                    return { field, resolver: resolvePromise };
                });
            this.setState({
                loadingResolvers
            })
        }
    }
}

export type DataResolvers<K extends string | number | symbol> = { [key in K]: (new (...args) => Resolver) }

export interface Resolver {
    resolve(routeParams: RouteComponentProps): Promise<any>
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