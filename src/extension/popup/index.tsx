import React from "react";
import ReactDOM from "react-dom";
import { PopupRoot } from "./popup-root";
import { ConfigStorageService } from "./services/config-storage-service";

const configService = new ConfigStorageService();

ReactDOM.render(
    <PopupRoot configService={configService} />,
    document.getElementById('popup-root')
); 