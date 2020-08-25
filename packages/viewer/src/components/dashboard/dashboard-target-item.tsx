import { ListItem, ListItemIcon, ListItemText } from "@material-ui/core";
import SettingsIcon from "@material-ui/icons/Settings";
import React from "react";
import { SiteTarget } from "../../../../common/src";

interface Props {
  site: SiteTarget;
  onEditSite: () => void;
  onNavigate: () => void;
}

export function DashboardTargetListItem({ site, onEditSite, onNavigate }: Props) {
  return (
    <ListItem button onClick={() => onNavigate()}>
      <ListItemIcon onClick={(e) => { onEditSite(); e.stopPropagation(); }}>
        <SettingsIcon />
      </ListItemIcon>
      <ListItemText primary={site.name} />
    </ListItem>
  )
};

