import { initializeApp } from "@xsrt/common";
import { DependencyContext } from "@xsrt/common-frontend";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { AppRoot } from "./components/app-root/app-root";
import { diConfig } from "./di.player";

const injector = initializeApp(diConfig);

ReactDOM.render(
    <DependencyContext.Provider value={injector}>
        <AppRoot />
    </DependencyContext.Provider>,
    document.getElementById("app-root")
);
