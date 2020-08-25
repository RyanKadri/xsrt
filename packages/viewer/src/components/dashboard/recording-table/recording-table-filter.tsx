import { createStyles, IconButton, InputAdornment, makeStyles, Popover, TextField, Theme, Typography } from "@material-ui/core";
import ClearIcon from "@material-ui/icons/Clear";
import { DateTimePicker } from "material-ui-pickers";
import React from "react";

const useStyles = makeStyles((theme: Theme) => createStyles({
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
}));

interface FilterState {
  start?: number;
  end?: number;
  url?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  filter: RecordingTableFilter;
  onUpdateFilter: (settings: RecordingTableFilter) => void;
  anchor: HTMLElement | null;
}

export function RecordingTableFilterComp({ open, onClose, anchor, filter, onUpdateFilter }: Props) {

  const classes = useStyles();

  const updateFilter = (field: keyof FilterState, val: any) => {
    onUpdateFilter({
      ...filter,
      [field]: val instanceof Date ? val.getTime() : val
    });
  };

  return (
    <Popover onClose={onClose} open={open} anchorEl={anchor} classes={{ paper: classes.root }}>
      <Typography variant="h5">Filter Recordings</Typography>
      <form>
        <DateTimePicker label="After..." className={classes.control}
          value={filter.before}
          onChange={e => updateFilter("start", e)}
          minDate={filter.after || undefined}
          InputProps={
            {
              endAdornment:
                <InputClearAdornment onClick={() => updateFilter("start", null)} />
            }
          }
        />
        <DateTimePicker label="Before..." className={classes.control}
          value={filter.after}
          onChange={e => updateFilter("end", e)}
          maxDate={filter.before || undefined}
          InputProps={
            {
              endAdornment:
                <InputClearAdornment onClick={() => updateFilter("end", null)} />
            }
          }
        />
        <TextField label="Url" className={classes.control}
          value={filter.url}
          onChange={e => updateFilter("url", e.currentTarget.value)} />
      </form>
    </Popover>
  );
};

const InputClearAdornment = ({ onClick }: { onClick: () => void }) => {
  return (
    <InputAdornment position="end">
      <IconButton onClick={(e) => { e.stopPropagation(); onClick(); }}>
        <ClearIcon />
      </IconButton>
    </InputAdornment>
  );
};

export interface RecordingTableFilter {
  before?: number;
  after?: number;
  url?: string;
}
