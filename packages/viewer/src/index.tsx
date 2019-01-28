import { initializeApi } from "@xsrt/common";
import { DependencyContext } from "@xsrt/common-frontend";
import * as React from "react";
import * as ReactDOM from "react-dom";
import "reflect-metadata";
import { AppRoot } from "./components/app-root/app-root";
import { diConfig } from "./di.player";

const injector = initializeApi(diConfig);

ReactDOM.render(
    <DependencyContext.Provider value={injector}>
        <AppRoot />
    </DependencyContext.Provider>,
    document.getElementById("app-root")
);
