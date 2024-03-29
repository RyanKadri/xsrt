import { injectable } from "inversify";
import { FetchStatusRequest, loadConfig, SaveStatusRequest } from "../../background/config";
import { ExtensionConfig } from "../../config/extension-config";
import { RecordingStatus } from "../popup-root";

@injectable()
export class ConfigStorageService {

    fetchConfig(): Promise<ExtensionConfig> {
        return new Promise<ExtensionConfig>((resolve) => {
            const defaultConfig: ExtensionConfig = loadConfig();
            chrome.storage.local.get({ config: defaultConfig }, (res) => {
                resolve(res.config as ExtensionConfig);
            });
        });
    }

    fetchRunState(): Promise<RecordingStatus> {
        return new Promise<RecordingStatus>((resolve) => {
            chrome.runtime.sendMessage(new FetchStatusRequest(), (resp) => {
                resolve(resp);
            });
        });
    }

    saveConfig(config: ExtensionConfig): Promise<void> {
        return new Promise<void>((resolve) => {
            chrome.storage.local.set({ config }, () => {
                resolve();
            });
        });
    }

    saveRunState(runState?: RecordingStatus) {
        return new Promise<RecordingStatus>((resolve) => {
            chrome.runtime.sendMessage(new SaveStatusRequest(runState), resp => {
                resolve(resp);
            });
        });
    }
}
