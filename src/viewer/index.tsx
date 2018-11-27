import * as React from "react";
import * as ReactDOM from "react-dom";
import './main.css';
import { AppContainer } from "../scraper/inversify.player";
import { IAppRoot } from "./components/app-root/app-root";

(async function(){
    const AppRoot: any = AppContainer.get(IAppRoot);
    ReactDOM.render(
        <AppRoot />,
        document.getElementById('app-root')
    );
})();