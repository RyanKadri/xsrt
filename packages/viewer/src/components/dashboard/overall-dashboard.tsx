import { createStyles, List, ListItem, ListItemIcon, ListItemText, Theme, Typography, withStyles, WithStyles } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import { SiteTarget } from "@xsrt/common";
import React, { useState } from "react";
import { Redirect } from "react-router";
import { DashboardTargetListItem } from "./dashboard-target-item";
import { EditSiteSettingsDialog } from "./edit-site-settings-dialog";

const styles = (theme: Theme) => createStyles({
    root: {
        padding: theme.spacing.unit * 2,
        maxWidth: 900
    }
});

const _OverallDashboardView = ({ sites, classes, onCreateSite, onUpdateSite, onDeleteSite }: Props) => {
    const [ editSiteProps, setEditSiteState ] = useState<EditSiteState>({ site: null, open: false });
    const [ redirect, setRedirect ] = useState<string | null>(null);
    const closeSiteSettings = () => setEditSiteState(old => ({ ...old, open: false }));

    return (
        <main className={ classes.root }>
            <Typography variant="h5">Recording Targets</Typography>
            <List dense>{
                sites.map(site =>
                    <DashboardTargetListItem site={ site } key={ site._id }
                                            onEditSite={ () => setEditSiteState((_) => ({ site, open: true })) }
                                            onNavigate={ () => setRedirect(`/dashboard/${site._id}`) } />
                )
            }
                <ListItem button onClick={ () => setEditSiteState({ site: null, open: true }) }>
                    <ListItemIcon><AddIcon /></ListItemIcon>
                    <ListItemText primary="Add a new site" />
                </ListItem>
            </List>
            <EditSiteSettingsDialog onClose={ closeSiteSettings }
                                    site={ editSiteProps.site }
                                    open={ editSiteProps.open }
                                    onSubmit={ editSiteProps.site !== null ? onUpdateSite : onCreateSite as any }
                                    onDeleteSite={ () => onDeleteSite(editSiteProps.site!) }
            />
            { redirect !== null ? <Redirect to={redirect} /> : null }
        </main>
    );
};

interface Props extends WithStyles<typeof styles> {
    sites: SiteTarget[];
    onUpdateSite: (site: SiteTarget) => void;
    onDeleteSite: (site: SiteTarget) => void;
    onCreateSite: (site: SiteTarget) => void;
}

interface EditSiteState {
    site: SiteTarget | null;
    open: boolean;
}

export const OverallDashboardView = withStyles(styles)(_OverallDashboardView);
