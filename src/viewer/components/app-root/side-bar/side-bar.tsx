import React from "react";
import { withStyles, Drawer, List, ListSubheader, WithStyles, createStyles, Typography } from "@material-ui/core";
import { SiteTarget } from "@common/db/targets";
import { LinkListItem } from "../../common/link-list-item";

const styles = theme => createStyles({
    nested: {
        paddingLeft: theme.spacing.unit * 2
    },
    root: {
        color: theme.palette.text.primary
    }
})

const Link = (link: Entry, nestedClass: string) => (
    link.type === "link"
    ?   <LinkListItem button to={link.to} key={link.to}>
            <Typography variant="body1">{ link.text }</Typography>
        </LinkListItem>

    :   <List subheader={<ListSubheader component="div">{ link.heading }</ListSubheader>}
              key={ link.heading } className={ nestedClass }>
            { link.children.map(link => Link(link, nestedClass)) }
        </List>
)

const _SideBar = ({ expanded, sites, classes, onClose }: SidebarProps) => {
    const links: Entry[] = [ 
        { type: 'link', to: '/dashboard', text: 'Dashboard' },
        { type: 'link', to: '/sites', text: 'Manage Sites' },
        { type: 'group', heading: 'Sites', children: sites.map(site => (
            { type: 'link' as 'link', to: `/dashboard/${site._id}`, text: site.name }
        ))}
    ];
    return <Drawer variant="temporary" anchor="left" open={expanded} className={ classes.root } onClose={ onClose }>
        <List color="inherit" component="nav">
            { links.map(link => Link(link, classes.nested)) }
        </List>
    </Drawer>
}


export const Sidebar = withStyles(styles, { withTheme: true })(_SideBar);

type Entry = Group | Link;

interface Link {
    type: 'link'
    to: string;
    text: string;
}

interface Group {
    type: 'group';
    heading: string;
    children: Entry[];
}

export interface SidebarProps extends WithStyles<typeof styles> {
    expanded: boolean;
    sites: SiteTarget[];

    onClose: () => void;
}