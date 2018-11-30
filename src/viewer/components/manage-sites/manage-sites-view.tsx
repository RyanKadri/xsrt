import React from "react";
import { Typography } from "@material-ui/core";
import { SiteTarget } from "@common/db/targets";
import { SiteList } from "./site-list";
import styles from './manage-sites-view.css';
import { AddSiteForm, NewSiteTarget } from "./add-site-form";

export class ManageSitesView extends React.Component<ManageSitesProps> {

    constructor(props: ManageSitesProps) { 
        super(props);
    }
    
    render() {
        return <div className={ styles.manageSitesView }>
            { this.availableSites() }
            <AddSiteForm onNewSite={ this.props.onNewSite } />
        </div>
    }

    private availableSites() {
        return <div className={ styles.sitesList }>{
            this.props.sites
            ? <SiteList sites={ this.props.sites } onDelete={ this.props.onDelete }></SiteList>
            : <Typography variant="body1">Loading</Typography>
        }</div>
    }

}

interface ManageSitesProps {
    sites: SiteTarget[];
    onNewSite: (site: NewSiteTarget) => void;
    onDelete: (site: SiteTarget) => void;
}