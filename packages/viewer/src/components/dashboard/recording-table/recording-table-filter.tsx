import { createStyles, IconButton, InputAdornment, Popover, TextField, Theme, Typography, WithStyles, withStyles } from "@material-ui/core";
import ClearIcon from "@material-ui/icons/Clear";
import { DateTimePicker } from "material-ui-pickers";
import React from "react";

const styles = (theme: Theme) => createStyles({
    root: {
        padding: theme.spacing(2),
        display: "flex",
        flexWrap: "wrap",
        maxWidth: 300
    },
    control: {
        width: "100%",
        marginBottom: theme.spacing(2)
    }
});

const _RecordingTableFilter = ({ open, onClose, anchor, filter, onUpdateFilter, classes }: Props) => {

    const updateFilter = (field: keyof FilterState, val: any) => {
        onUpdateFilter({
            ...filter,
            [field]: val instanceof Date ? val.getTime() : val
        });
    };

    return (
        <Popover onClose={ onClose} open={ open } anchorEl={ anchor } classes={{ paper: classes.root }}>
                <Typography variant="h5">Filter Recordings</Typography>
                <form>
                    <DateTimePicker label="After..." className={ classes.control }
                        value={ filter.start }
                        onChange={ e => updateFilter("start", e) }
                        minDate={ filter.end || undefined }
                        InputProps={
                            { endAdornment:
                                <InputClearAdornment onClick={ () => updateFilter("start", null) } />
                            }
                        }
                    />
                    <DateTimePicker label="Before..." className={ classes.control }
                        value={ filter.end }
                        onChange={ e => updateFilter("end", e) }
                        maxDate={ filter.start || undefined }
                        InputProps={
                            { endAdornment:
                                <InputClearAdornment onClick={ () => updateFilter("end", null) } />
                            }
                        }
                    />
                    <TextField label="Url" className={ classes.control }
                        value={filter.url}
                        onChange={ e => updateFilter("url", e.currentTarget.value) } />
                </form>
        </Popover>
    );
};

const InputClearAdornment = ({ onClick }: { onClick: () => void } ) => {
    return (
        <InputAdornment position="end">
            <IconButton onClick={ (e) => { e.stopPropagation(); onClick(); } }>
                <ClearIcon />
            </IconButton>
        </InputAdornment>
    );
};

export const RecordingTableFilter = withStyles(styles)(_RecordingTableFilter);

interface FilterState {
    start?: number;
    end?: number;
    url?: string;
}

interface Props extends WithStyles<typeof styles> {
    open: boolean;
    onClose: () => void;
    filter: RecordingTableFilter;
    onUpdateFilter: (settings: RecordingTableFilter) => void;
    anchor: HTMLElement | null;
}

export interface RecordingTableFilter {
    start: number | null;
    end: number | null;
    url: string;
}
