import 'reflect-metadata';
import * as React from "react";
import * as ReactDOM from "react-dom";
import './main.css';
import AppRoot from "./components/app-root/app-root";
import { PlaybackManager } from "@scraper/playback/playback-manager";
import { TargetApiService } from "./services/sites-api-service";
import { RecordingApiService } from "./services/recording-service";
import { PlayerContainer } from "./inversify.player";

(async function(){
    const props = {
        playbackManager: PlayerContainer.get(PlaybackManager),
        recordingApi: PlayerContainer.get(RecordingApiService),
        targetApi: PlayerContainer.get(TargetApiService)
    }
    ReactDOM.render(
        <AppRoot {...props} />,
        document.getElementById('app-root')
    );
})();