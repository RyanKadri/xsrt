import { createStyles, WithStyles, withStyles, ListItemText, ListItemIcon, ListItem } from "@material-ui/core";
import React from "react";
import { SiteTarget } from "../../../../common/src";
import SettingsIcon from "@material-ui/icons/Settings";

const styles = createStyles({

});

const _DashboardTargetListItem = ({ site, onEditSite, onNavigate }: Props) => (
    <ListItem button onClick={ () => onNavigate() }>
        <ListItemIcon onClick={ (e) => { onEditSite(); e.stopPropagation(); } }>
            <SettingsIcon />
        </ListItemIcon>
        <ListItemText primary={site.name} secondary={` ${site.numRecordings} Recorings`} />
    </ListItem>
);

export const DashboardTargetListItem = withStyles(styles)(_DashboardTargetListItem);

interface Props extends WithStyles<typeof styles> {
    site: SiteTarget;
    onEditSite: () => void;
    onNavigate: () => void;
}
