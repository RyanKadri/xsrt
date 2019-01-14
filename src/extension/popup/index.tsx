import React from "react";
import ReactDOM from "react-dom";
import "reflect-metadata";
import { DependencyContext } from "../../viewer/services/with-dependencies";
import { ExtensionContainer } from "./inversify.extension";
import { PopupRoot } from "./popup-root";

ReactDOM.render(
    <DependencyContext.Provider value={ ExtensionContainer }>
        <PopupRoot />
    </DependencyContext.Provider>,
    document.getElementById("popup-root")
);
