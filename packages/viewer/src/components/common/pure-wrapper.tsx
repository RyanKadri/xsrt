import React from "react";

export function pure<P>(fComp: React.SFC<P>) {
    return class Wrapped extends React.PureComponent<P> {
        render() {
            return fComp(this.props, this.context);
        }
    };
}
