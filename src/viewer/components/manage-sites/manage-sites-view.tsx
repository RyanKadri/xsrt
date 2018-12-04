import React from "react";
import { Typography, withStyles, WithStyles, createStyles, Theme } from "@material-ui/core";
import { SiteTarget } from "@common/db/targets";
import { SiteList } from "./site-list";
import { AddSiteForm, NewSiteTarget } from "./add-site-form";

const styles = (theme: Theme) => createStyles({
    root: {
        padding: theme.spacing.unit * 2,
        display: 'flex',
        flexWrap: 'wrap',
        width: 600
    },    
    sitesList: {
        width: '100%'
    }
})

const _ManageSitesView = (props: ManageSitesProps) => {
    const { classes, onNewSite } = props; 
    return <div className={ classes.root }>
        <AvailableSites {...props} />
        <AddSiteForm onNewSite={ onNewSite } />
    </div>
}

const AvailableSites = ({ classes, onDelete, sites }: ManageSitesProps) => 
    <div className={ classes.sitesList }>{
        sites
        ? <SiteList sites={ sites } onDelete={ onDelete }></SiteList>
        : <Typography variant="body1">Loading</Typography>
    }</div>

export const ManageSitesView = withStyles(styles)(_ManageSitesView);

interface ManageSitesProps extends WithStyles<typeof styles> {
    sites: SiteTarget[];
    onNewSite: (site: NewSiteTarget) => void;
    onDelete: (site: SiteTarget) => void;
}