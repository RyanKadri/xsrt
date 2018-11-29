import React from "react";
import { withStyles, Drawer, List, ListItem } from "@material-ui/core";

const styles = {

}

function SideBar({ expanded, sites }: SidebarProps) {
    return <Drawer variant="persistent" anchor="left" open={expanded}>
        <List>
            {sites.map( site => (
                <ListItem button key={site}>{site}</ListItem>
            ))}
        </List>
    </Drawer>
}

export default withStyles(styles, { withTheme: true })(SideBar);

export interface SidebarProps {
    expanded: boolean;
    sites: string[];
}