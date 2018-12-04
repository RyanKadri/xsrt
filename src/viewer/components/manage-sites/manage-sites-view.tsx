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

class _ManageSitesView extends React.Component<ManageSitesProps> {

    constructor(props: ManageSitesProps) { 
        super(props);
    }
    
    render() {

        const { classes } = this.props;
        return <div className={ classes.root }>
            { this.availableSites(classes) }
            <AddSiteForm onNewSite={ this.props.onNewSite } />
        </div>
    }

    private availableSites(classes: ManageSitesProps['classes']) {
        return <div className={ classes.sitesList }>{
            this.props.sites
            ? <SiteList sites={ this.props.sites } onDelete={ this.props.onDelete }></SiteList>
            : <Typography variant="body1">Loading</Typography>
        }</div>
    }

}

export const ManageSitesView = withStyles(styles)(_ManageSitesView);

interface ManageSitesProps extends WithStyles<typeof styles> {
    sites: SiteTarget[];
    onNewSite: (site: NewSiteTarget) => void;
    onDelete: (site: SiteTarget) => void;
}