import React from "react";
import { withStyles, Drawer, List, ListItem, ListSubheader, WithStyles, createStyles } from "@material-ui/core";
import { Link } from "react-router-dom";
import { SiteTarget } from "@common/db/targets";

const styles = theme => createStyles({
    nested: {
        paddingLeft: theme.spacing.unit * 4
    },
    root: {
        color: theme.palette.text.primary
    }
})

function SideBar({ expanded, sites, classes, onClose }: SidebarProps) {
    return <Drawer variant="temporary" anchor="left" open={expanded} className={ classes.root } onClose={ onClose }>
        <List color="inherit" component="nav">
            <ListItem button component={Link as any} {...{to: "/dashboard"}}>Dashboard</ListItem>
            <ListItem button component={Link as any} {...{to: "/sites"}}>Manage Sites</ListItem>
            <List subheader={<ListSubheader component="div">Sites</ListSubheader>}>
                {sites.map( site => (
                    <ListItem button className={ classes.nested } key={site._id}>{site.name}</ListItem>
                ))}
            </List>
        </List>
    </Drawer>
}

export default withStyles(styles, { withTheme: true })(SideBar);

export interface SidebarProps extends WithStyles<typeof styles> {
    expanded: boolean;
    sites: SiteTarget[];

    onClose: () => void;
}