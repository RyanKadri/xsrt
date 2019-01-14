import { createStyles, Drawer, List, ListSubheader, Theme, Typography, withStyles, WithStyles } from "@material-ui/core";
import React from "react";
import { SiteTarget } from "../../../../common/db/targets";
import { LinkListItem } from "../../common/link-list-item";

const styles = (theme: Theme) => createStyles({
    nested: {
        paddingLeft: theme.spacing.unit * 2
    },
    root: {
        color: theme.palette.text.primary
    }
});

const Link = (link: SidebarEntry, nestedClass: string, onClose: () => void) => (
    link.type === "link"
    ?   <LinkListItem button to={link.to} key={link.to} onClick={ onClose }>
            <Typography variant="body1">{ link.text }</Typography>
        </LinkListItem>

    :   <List subheader={<ListSubheader component="div">{ link.heading }</ListSubheader>}
              key={ link.heading } className={ nestedClass }>
            { link.children.map(child => Link(child, nestedClass, onClose)) }
        </List>
);

const _SideBar = ({ expanded, sites, classes, onClose }: SidebarProps) => {
    return <Drawer variant="temporary" anchor="left" open={expanded} className={ classes.root } onClose={ onClose }>
        <List color="inherit" component="nav">
            { sidebarLinks(sites).map(link => Link(link, classes.nested, onClose)) }
        </List>
    </Drawer>;
};

const sidebarLinks = (sites: SiteTarget[]) => {
    return [
        { type: "link", to: "/dashboard", text: "Dashboard" },
        { type: "link", to: "/sites", text: "Manage Sites" },
        { type: "group", heading: "Sites", children: (sites || []).map(site => (
            { type: "link" as "link", to: `/dashboard/${site._id}`, text: site.name }
        ))}
    ] as SidebarEntry[];
};

export const Sidebar = withStyles(styles, { withTheme: true })(_SideBar);

type SidebarEntry = SidebarGroup | SidebarLink;

interface SidebarLink {
    type: "link";
    to: string;
    text: string;
}

interface SidebarGroup {
    type: "group";
    heading: string;
    children: SidebarEntry[];
}

export interface SidebarProps extends WithStyles<typeof styles> {
    expanded: boolean;
    sites: SiteTarget[];

    onClose: () => void;
}
