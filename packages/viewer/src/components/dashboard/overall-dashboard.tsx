import { List, ListItemText, Typography, withStyles, createStyles, Theme, WithStyles } from "@material-ui/core";
import { SiteTarget } from "@xsrt/common";
import React from "react";
import { LinkListItem } from "../common/link-list-item";

const styles = (theme: Theme) => createStyles({
    root: {
        padding: theme.spacing.unit * 2,
        maxWidth: 900
    }
});

const _OverallDashboardView = ({ sites, classes }: Props) => (
    <main className={ classes.root }>
        <Typography variant="h5">Recording Targets</Typography>
        <List>{
            sites.map(site =>
                <LinkListItem button to={`/dashboard/${site._id}`} key={site._id}>
                    <ListItemText primary={site.name} secondary={` ${site.numRecordings} Recorings`} />
                </LinkListItem>
            )
        }</List>
    </main>
);

interface Props extends WithStyles<typeof styles> {
    sites: SiteTarget[];
}

export const OverallDashboardView = withStyles(styles)(_OverallDashboardView);
