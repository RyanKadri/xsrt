import 'reflect-metadata';
import * as React from "react";
import * as ReactDOM from "react-dom";
import './main.css';
import { AppRoot } from "./components/app-root/app-root";

ReactDOM.render(
    <AppRoot />,
    document.getElementById('app-root')
);