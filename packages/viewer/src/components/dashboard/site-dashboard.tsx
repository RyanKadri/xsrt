import { createStyles, Dialog, makeStyles, Theme, Typography } from "@material-ui/core";
import React, { Fragment, useEffect, useReducer, useState } from "react";
import { useComponent } from "../../../../common-frontend/src";
import { LoggingService, RecordingOverview, SiteTarget } from "../../../../common/src";
import { RecordingApiService } from "../../services/recording-service";
import { UIConfigService } from "../../services/ui-config-service";
import { RecordingTable } from "./recording-table/recording-table";
import { RecordingTableFilter } from "./recording-table/recording-table-filter";

const useStyles = makeStyles((theme: Theme) => createStyles({
  root: {
    padding: theme.spacing(2)
  },
  header: {
    display: "flex",
    alignItems: "flex-end"
  },
  siteLink: {
    marginLeft: theme.spacing(2)
  }
}));

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "deleteRecordings":
      return {
        ...state,
        recordings: state.recordings
          .filter(rec => !action.recordings.some(sel => sel.uuid === rec.uuid)),
      };
    case "updateRecordings":
      return {
        ...state,
        recordings: action.recordings,
        loading: false,
        stale: false,
      };
    case "refresh":
      return { ...state, stale: true, loadingFilter: action.filter };
    case "loading":
      return { ...state, loading: true };
  }
}

interface Props {
  site: SiteTarget;
  recordingsApi: RecordingApiService;
  logger: LoggingService;
}

interface State {
  loading: boolean;
  stale: boolean;
  loadingFilter?: RecordingTableFilter;
  recordings: RecordingOverview[];
}

export function SiteDashboardView({ recordingsApi, logger, site }: Props) {
  const classes = useStyles()
  const [state, dispatch] = useReducer(reducer, {
    recordings: [],
    loading: false,
    stale: true,
  });

  const [preview, setPreview] = useState<RecordingOverview | null>(null);
  const DIRecordingTable = useComponent(RecordingTable, { uiConfigService: UIConfigService });

  const onDeleteSelected = async (selected: RecordingOverview[]) => {
    try {
      await recordingsApi.deleteRecordings(selected);
      dispatch({ type: "deleteRecordings", recordings: selected });
    } catch (e) {
      logger.error(e);
    }
  };

  useEffect(() => {
    if (site && state.stale && !state.loading) {
      dispatch({ type: "loading" });
      recordingsApi.fetchAvailableRecordings(site.customerId, state.loadingFilter)
        .then(fetchedRecordings => {
          dispatch({ type: "updateRecordings", recordings: fetchedRecordings });
        });
    }
  }, [site, state.stale]);

  return (
    <div className={classes.root}>{
      site === undefined
        ? <Typography variant="body1">This site no longer exists</Typography>
        : <Fragment>
          <header className={classes.header}>
            <Typography variant="h4">
              {site.name}
            </Typography>
          </header>
          {state.loading
            ? <Typography variant="body1">Loading...</Typography>
            : state.recordings.length === 0
              ? <Typography variant="body1">No recordings yet...</Typography>
              : <DIRecordingTable
                recordings={state.recordings}
                onPreview={setPreview}
                onDeleteSelected={onDeleteSelected}
                onRefresh={(filter) => dispatch({ type: "refresh", filter })}
              />
          }
          <Dialog maxWidth="lg"
            open={preview !== null}
            onClose={() => setPreview(null)}>{
              preview && preview.thumbnailPath
                ? <img src={`${process.env.STATIC_HOST}/${preview.thumbnailPath}`}></img>
                : <p>No image</p>
            }</Dialog>
        </Fragment>
    }</div>
  );
}

type Action = { type: "loading" } |
  { type: "refresh", filter: RecordingTableFilter } |
  { type: "deleteRecordings", recordings: RecordingOverview[] } |
  { type: "updateRecordings", recordings: RecordingOverview[] };
