import { injectable } from "inversify";
import { LocalStorageService } from "../../common/utils/local-storage.service";
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

    constructor(
        private storageService: LocalStorageService
    ) { }

    saveRecordingsTableConfig(settings: RecordingTableSettings) {
        this.storageService.saveItem(localStorageTableSettings, settings);
    }

    loadRecordingsTableConfig(): RecordingTableSettings {
        return this.storageService.fetchWithDefault(
            localStorageTableSettings,
            defaultRecordingTableColumns,
            { writeBack: true}
        );
    }

    saveViewerConfig(config: ViewerSettings) {
        this.storageService.saveItem(localStorageViewerSettings, config);
    }

    loadViewerConfig(): ViewerSettings {
        return this.storageService.fetchWithDefault(
            localStorageViewerSettings,
            defaultViewerSettings,
            { writeBack: true }
        );
    }
}
