import { createStyles, Theme, Typography, withStyles, WithStyles } from "@material-ui/core";
import { NewSiteTarget, SiteTarget } from "@xsrt/common";
import React from "react";
import { AddSiteForm } from "./add-site-form";
import { SiteList } from "./site-list";

const styles = (theme: Theme) => createStyles({
    root: {
        padding: theme.spacing.unit * 2,
        display: "flex",
        flexWrap: "wrap",
        width: 600
    },
    sitesList: {
        width: "100%"
    }
});

const _ManageSitesView = (props: ManageSitesProps) => {
    const { classes, onNewSite } = props;
    return <div className={ classes.root }>
        <AvailableSites {...props} />
        <AddSiteForm onNewSite={ onNewSite } />
    </div>;
};

const AvailableSites = ({ classes, onDelete, sites }: ManageSitesProps) =>
    <div className={ classes.sitesList }>{
        sites
        ? <SiteList sites={ sites } onDelete={ onDelete }></SiteList>
        : <Typography variant="body1">Loading</Typography>
    }</div>;

export const ManageSitesView = withStyles(styles)(_ManageSitesView);

interface ManageSitesProps extends WithStyles<typeof styles> {
    sites: SiteTarget[];
    onNewSite: (site: NewSiteTarget) => void;
    onDelete: (site: SiteTarget) => void;
}
