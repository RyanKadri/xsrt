import * as React from "react";
import * as ReactDOM from "react-dom";
import "reflect-metadata";
import { initializeApp } from "../common/services/app-initializer";
import { AppRoot } from "./components/app-root/app-root";
import { diConfig } from "./di.player";
import { DependencyContext } from "./services/with-dependencies";

const injector = initializeApp(diConfig);

ReactDOM.render(
    <DependencyContext.Provider value={injector}>
        <AppRoot />
    </DependencyContext.Provider>,
    document.getElementById("app-root")
);
