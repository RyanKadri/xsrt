import { injectable } from "inversify";
import { allowedRecordingTableColumns } from "../components/dashboard/recording-table/available-columns";
import { RecordingTableSettings } from "../components/dashboard/recording-table/recording-table-settings";
import { ViewerSettings } from "../components/viewer/viewer";

const localStorageTableSettings = "xsrt.recording-table.config";
const localStorageViewerSettings = "xsrt.viewer.config";

const defaultRecordingTableColumns: RecordingTableSettings = {
    columns: allowedRecordingTableColumns
       .filter(col => ["date", "duration", "preview"].includes(col.key))
};

const defaultViewerSettings: ViewerSettings = {
    blockViewerOnPause: false,
    showRegions: true
};

@injectable()
export class UIConfigService {

    saveRecordingsTableConfig(settings: RecordingTableSettings) {
        localStorage.setItem(localStorageTableSettings, JSON.stringify(settings));
    }

    loadRecordingsTableConfig(): RecordingTableSettings {
        const stored = localStorage.getItem(localStorageTableSettings);
        if (stored) {
            return JSON.parse(stored);
        } else {
            const defaultConfig = defaultRecordingTableColumns;
            this.saveRecordingsTableConfig(defaultConfig);
            return defaultConfig;
        }
    }

    saveViewerConfig(config: ViewerSettings) {
        localStorage.setItem(localStorageViewerSettings, JSON.stringify(config));
    }

    loadViewerConfig(): ViewerSettings {
        const stored = localStorage.getItem(localStorageViewerSettings);
        if (stored) {
            return JSON.parse(stored);
        } else {
            const defaultConfig = defaultViewerSettings;
            this.saveViewerConfig(defaultConfig);
            return defaultConfig;
        }
    }
}
