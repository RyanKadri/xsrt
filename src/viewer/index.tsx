import * as React from "react";
import * as ReactDOM from "react-dom";
import 'reflect-metadata';
import { ScraperConfigToken } from '../scraper/scraper-config,';
import { AppRoot } from "./components/app-root/app-root";
import { PlayerContainer } from './inversify.player';

PlayerContainer.bind(ScraperConfigToken).toConstantValue({ debugMode: false })
ReactDOM.render(
    <AppRoot />,
    document.getElementById('app-root')
);