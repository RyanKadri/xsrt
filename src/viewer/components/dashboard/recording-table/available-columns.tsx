export const allowedColumns: RecordingColumn[] = [
    { key: 'date', header: 'Date' },
    { key: 'duration', header: 'Date' },
    { key: "ua", header: "User Agent" },
    { key: "preview", header: "Preview" }
]

export const defaultColumns = allowedColumns.filter(col => ["date", "duration", "preview"].includes(col.key))

export interface RecordingColumn {
    header: string;
    key: AvailableRecordingColumn;
}

export type AvailableRecordingColumn = "date" | "duration" | "ua" | "preview";