import { IconButton, List, ListItem, ListItemSecondaryAction, ListItemText, Typography, WithStyles, withStyles } from "@material-ui/core";
import DeleteIcon from "@material-ui/icons/Delete";
import { SiteTarget } from "@xsrt/common";
import React from "react";

const styles = {
    root: {
        flex: 1
    }
};

function _SiteList({ sites, onDelete }: Props) {
    return sites.length === 0
        ? <Typography variant="body1">No sites have been configured</Typography>
        : <>
            <List>{
                sites.map(site => (
                    <ListItem key={site._id}>
                        <ListItemText primary={site.name} secondary={site.identifier} />
                        <ListItemSecondaryAction>
                            <IconButton onClick={ () => onDelete(site) }>
                                <DeleteIcon />
                            </IconButton>
                        </ListItemSecondaryAction>
                    </ListItem>
                ))
            }</List>
        </>;
}

export const SiteList = withStyles(styles)(_SiteList);

interface Props extends WithStyles<typeof styles> {
    sites: SiteTarget[];
    onDelete: (site: SiteTarget) => void;
}
