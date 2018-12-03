import React from "react";
import { List, ListItemText } from "@material-ui/core";
import { SiteTarget } from "@common/db/targets";
import { LinkListItem } from "../common/link-list-item";

export class OverallDashboardView extends React.Component<DashboardViewProps> {

    constructor(props: DashboardViewProps) { 
        super(props);
        this.state = {
            selectedSite: 0,
        }
    }
    
    render() {
        return <List>{ 
            this.props.sites.map(site => 
                <LinkListItem button to={`/dashboard/${site._id}`} key={site._id}>
                    <ListItemText>{ site.name }</ListItemText>
                </LinkListItem>    
            )
        }</List>
    }

}

interface DashboardViewProps {
    sites: SiteTarget[];
}
