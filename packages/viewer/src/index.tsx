import "reflect-metadata";
import { initializeApp } from "../../common/src";
import { DependencyContext } from "../../common-frontend/src";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { AppRoot } from "./components/app-root/app-root";
import { diConfig } from "./di.player";

(async () => {
  const injector = await initializeApp(diConfig);

  ReactDOM.render(
    <DependencyContext.Provider value={injector}>
      <AppRoot />
    </DependencyContext.Provider>,
    document.getElementById("app-root")
  );
})();
