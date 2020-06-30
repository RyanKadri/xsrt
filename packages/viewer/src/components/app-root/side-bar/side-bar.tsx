import { createStyles, Drawer, List, ListSubheader, Theme, Typography, withStyles, WithStyles } from "@material-ui/core";
import { SiteTarget } from "@xsrt/common";
import React from "react";
import { LinkListItem } from "../../common/link-list-item";

const styles = (theme: Theme) => createStyles({
  nested: {
    paddingLeft: theme.spacing(2)
  },
  sideBar: {
    color: theme.palette.text.primary,
    minWidth: 180
  }
});

const Link = (link: SidebarEntry, nestedClass: string, onClose: () => void) => (
  link.type === "link"
    ? (
      <LinkListItem button to={link.to} key={link.to} onClick={onClose}>
        <Typography variant="body1">{link.text}</Typography>
      </LinkListItem>
    ) : (
      <List subheader={<ListSubheader component="div">{link.heading}</ListSubheader>}
        key={link.heading} className={nestedClass}>
        {link.children.map(child => Link(child, nestedClass, onClose))}
      </List>
    )
);

const _SideBar = ({ expanded, sites, classes, onClose }: SidebarProps) => (
  <Drawer variant="temporary"
    anchor="left"
    open={expanded}
    classes={{ paper: classes.sideBar }}
    onClose={onClose}>
    <List color="inherit" component="nav">
      {sidebarLinks(sites).map(link => Link(link, classes.nested, onClose))}
    </List>
  </Drawer>
);

const sidebarLinks = (sites: SiteTarget[]) => {
  return [
    { type: "link", to: "/dashboard", text: "Dashboard" },
    {
      type: "group", heading: "Sites", children: (sites || []).map(site => (
        { type: "link" as "link", to: `/dashboard/${site._id}`, text: site.name }
      ))
    }
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
