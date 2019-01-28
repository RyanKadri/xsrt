import { List, ListItemText } from "@material-ui/core";
import { SiteTarget } from "@xsrt/common";
import React from "react";
import { LinkListItem } from "../common/link-list-item";

export const OverallDashboardView = ({ sites }: DashboardViewProps) =>
    <List>{
        sites.map(site =>
            <LinkListItem button to={`/dashboard/${site._id}`} key={site._id}>
                <ListItemText>{ site.name }</ListItemText>
            </LinkListItem>
        )
    }</List>;

interface DashboardViewProps {
    sites: SiteTarget[];
}
