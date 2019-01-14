import * as React from "react";
import * as ReactDOM from "react-dom";
import "reflect-metadata";
import { AppRoot } from "./components/app-root/app-root";
import { PlayerContainer } from "./inversify.player";
import { DependencyContext } from "./services/with-dependencies";

ReactDOM.render(
    <DependencyContext.Provider value={PlayerContainer}>
        <AppRoot />,
    </DependencyContext.Provider>,
    document.getElementById("app-root")
);
