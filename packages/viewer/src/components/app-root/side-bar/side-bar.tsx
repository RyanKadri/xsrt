import { createStyles, Drawer, List, ListItemText, ListSubheader, makeStyles, Theme, ListItem } from "@material-ui/core";
import React from "react";
import { SiteTarget } from "../../../../../common/src";
import { Link } from "react-router-dom";

const useStyles = makeStyles((theme: Theme) => createStyles({
  nested: {
    paddingLeft: theme.spacing(2)
  },
  sideBar: {
    color: theme.palette.text.primary,
    minWidth: 180
  }
}));

interface SidebarEntryProps {
  link: SidebarEntry;
  className: string;
  onClose(): void;
}
function SidebarEntryComp({ link, className, onClose }: SidebarEntryProps) {
  return (
    link.type === "link"
      ? (
        <ListItem button to={link.to} key={link.to} onClick={onClose} component={Link}>
          <ListItemText>{link.text}</ListItemText>
        </ListItem>
      ) : (
        <List subheader={<ListSubheader component="div">{link.heading}</ListSubheader>}
          key={link.heading} className={className}>
          {link.children.map((child, i) =>
            <SidebarEntryComp key={i} link={child} className={className} onClose={onClose} />
          )}
        </List>
      )
  )
}

export function SideBar({ expanded, sites, onClose }: SidebarProps) {
  const classes = useStyles()
  return (
    <Drawer variant="temporary"
      anchor="left"
      open={expanded}
      classes={{ paper: classes.sideBar }}
      onClose={onClose}>
      <List color="inherit" component="nav">
        {sidebarLinks(sites).map((link, i) =>
          <SidebarEntryComp key={i} link={link} className={classes.nested} onClose={onClose} />
        )}
      </List>
    </Drawer>
  );
}

function sidebarLinks(sites: SiteTarget[]) {
  return [
    { type: "link", to: "/dashboard", text: "Dashboard" },
    {
      type: "group", heading: "Sites", children: (sites || []).map(site => (
        { type: "link" as "link", to: `/dashboard/${site.customerId}`, text: site.name }
      ))
    }
  ] as SidebarEntry[];
};

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

export interface SidebarProps {
  expanded: boolean;
  sites: SiteTarget[];

  onClose: () => void;
}
