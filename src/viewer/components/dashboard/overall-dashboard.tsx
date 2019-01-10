import { List, ListItemText } from "@material-ui/core";
import React from "react";
import { SiteTarget } from '../../../common/db/targets';
import { LinkListItem } from "../common/link-list-item";

export const OverallDashboardView = ({ sites }: DashboardViewProps) =>
    <List>{ 
        sites.map(site => 
            <LinkListItem button to={`/dashboard/${site._id}`} key={site._id}>
                <ListItemText>{ site.name }</ListItemText>
            </LinkListItem>    
        )
    }</List>

interface DashboardViewProps {
    sites: SiteTarget[];
}
