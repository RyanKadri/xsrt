import { injectable } from 'inversify';
import { defaultRecordingTableColumns } from '../components/dashboard/recording-table/available-columns';
import { RecordingTableSettings } from '../components/dashboard/recording-table/recording-table-settings';

const localStorageTableSettings = "app.icu.recording.id";

@injectable()
export class UIConfigService {

    saveRecordingsTableConfig(settings: RecordingTableSettings) {
        localStorage.setItem(localStorageTableSettings, JSON.stringify(settings))
    }

    loadRecordingsTableConfig(): RecordingTableSettings {
        const stored = localStorage.getItem(localStorageTableSettings);
        if(stored) {
            return JSON.parse(stored);
        } else {
            const defaultConfig = { columns: defaultRecordingTableColumns };
            this.saveRecordingsTableConfig(defaultConfig);
            return defaultConfig;
        }
    }
}