import React from "react";
import ReactDOM from "react-dom";
import "reflect-metadata";
import { initializeApp } from "../../common/services/app-initializer";
import { DependencyContext } from "../../viewer/services/with-dependencies";
import { PopupRoot } from "./popup-root";

const injector = initializeApp([]);

ReactDOM.render(
    <DependencyContext.Provider value={ injector }>
        <PopupRoot />
    </DependencyContext.Provider>,
    document.getElementById("popup-root")
);
