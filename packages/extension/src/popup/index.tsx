import { initializeApp } from "@xsrt/common";
import { DependencyContext } from "@xsrt/common-frontend";
import React from "react";
import ReactDOM from "react-dom";
import { PopupRoot } from "./popup-root";

(async () => {
    const injector = await initializeApp([]);

    ReactDOM.render(
        <DependencyContext.Provider value={ injector }>
            <PopupRoot />
        </DependencyContext.Provider>,
        document.getElementById("popup-root")
    );
})();
