import { createStyles, Dialog, Theme, Typography, withStyles, WithStyles } from "@material-ui/core";
import ExternalLink from "@material-ui/icons/OpenInBrowserSharp";
import { LoggingService, RecordingOverview, SiteTarget } from "@xsrt/common";
import { useComponent, withDependencies } from "@xsrt/common-frontend";
import React, { Fragment, useEffect, useState } from "react";
import { RecordingApiService } from "../../services/recording-service";
import { UIConfigService } from "../../services/ui-config-service";
import { RecordingTable } from "./recording-table/recording-table";

const styles = (theme: Theme) => createStyles({
    root: {
        padding: theme.spacing.unit * 2
    },
    externalLink: {
        marginLeft: theme.spacing.unit
    }
});

const _SiteDashboardView = ({ classes, recordingsApi, logger, site }: DashboardViewProps) => {
    const [ preview, setPreview ] = useState<RecordingOverview | null>(null);
    const [ selected, setSelected ] = useState<RecordingOverview[]>([]);
    const [ recordings, setRecordings ] = useState<RecordingOverview[]>([]);
    const [ loading, setLoading ] = useState(false);
    const DIRecordingTable = useComponent(RecordingTable, { uiConfigService: UIConfigService });

    const onToggleSelect = (recording: RecordingOverview) => {
        setSelected(old =>
            old.includes(recording)
                ? old.filter(rec => rec !== recording)
                : old.concat(recording)
        );
    };

    const onToggleSelectAll = (shouldSelect: boolean) => {
        setSelected(shouldSelect ? recordings : []);
    };

    const onDeleteSelected = async () => {
        try {
            await recordingsApi.deleteRecordings(selected);
            setSelected([]);
        } catch (e) {
            logger.error(e);
        }
    };

    useEffect(() => {
        if (site) {
            setLoading(true);
            recordingsApi.fetchAvailableRecordings(site._id)
                .then(fetchedRecordings => {
                    setRecordings(fetchedRecordings);
                    setLoading(false);
                });
        }
    }, [site]);

    return (
        <div className={ classes.root }>{
            site === undefined
                ? <Typography variant="body1">This site no longer exists</Typography>
                : <Fragment>
                    <Typography variant="h4">
                    { site.name }
                    { site.urls && site.urls.length === 1
                        ? <a  target="_blank" className={classes.externalLink}
                            href={ `${site.urls[0]}` }>
                            <ExternalLink />
                        </a>
                        : null
                    }</Typography>
                    { loading
                        ? <Typography variant="body1">Loading...</Typography>
                        : recordings.length === 0
                            ? <Typography variant="body1">No recordings yet...</Typography>
                            : <DIRecordingTable
                                recordings={ recordings }
                                selected={ selected }
                                onPreview={ setPreview }
                                onToggleSelect={ onToggleSelect }
                                onToggleSelectAll={ onToggleSelectAll }
                                onDeleteSelected={ onDeleteSelected }
                            />
                    }
                    <Dialog maxWidth="lg"
                        open={ preview !== null }
                        onClose={ () => setPreview(null) }>{
                        preview && preview.thumbnail
                            ? <img src={`/screenshots/${preview.thumbnail}`}></img>
                            : <p>No image</p>
                    }</Dialog>
                </Fragment>
        }</div>
    );
};

export const SiteDashboardView = withStyles(styles)(
    withDependencies(_SiteDashboardView,
        {
            recordingsApi: RecordingApiService,
            logger: LoggingService
        }
    )
);

interface DashboardViewProps extends WithStyles<typeof styles> {
    site: SiteTarget;
    recordingsApi: RecordingApiService;
    logger: LoggingService;
}
