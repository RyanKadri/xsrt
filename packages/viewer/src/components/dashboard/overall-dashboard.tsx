import { createStyles, List, ListItem, ListItemIcon, ListItemText, Theme, Typography, withStyles, WithStyles } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import { NewSiteTarget, SiteTarget } from "@xsrt/common";
import React, { useState } from "react";
import { Route } from "react-router";
import { TargetApiService } from "../../services/sites-api-service";
import { DashboardTargetListItem } from "./dashboard-target-item";
import { EditSiteSettingsDialog } from "./edit-site-settings-dialog";

const styles = (theme: Theme) => createStyles({
    root: {
        padding: theme.spacing.unit * 2,
        maxWidth: 900
    }
});

function _OverallDashboardView({ sites, classes, onCreateSite, onUpdateSite, onDeleteSite, targetApi }: Props) {
    const [ editSiteProps, setEditSiteState ] = useState<EditSiteState>({ site: null, open: false });
    const closeSiteSettings = () => {
        setEditSiteState(old => ({ ...old, open: false }));
    };

    const updateSite = async (site: SiteTarget) => {
        const updated = await targetApi.updateSite(site);
        closeSiteSettings();
        onUpdateSite(updated);
    };

    const createNewSite = async (site: NewSiteTarget) => {
        const newSite = await targetApi.createSite(site);
        onCreateSite(newSite);
        setEditSiteState({
            open: true,
            site: newSite
        });
    };

    const deleteSite = async () => {
        if (editSiteProps.site) {
            await targetApi.deleteSite(editSiteProps.site);
            closeSiteSettings();
            onDeleteSite(editSiteProps.site);
        }
    };

    return (
        <main className={ classes.root }>
            <Typography variant="h5">Recording Targets</Typography>
            <Route render={ ({ history }) =>
                <List dense>{
                    sites.map(site =>
                        <DashboardTargetListItem site={ site } key={ site._id }
                                                onEditSite={ () => setEditSiteState((_) => ({ site, open: true })) }
                                                onNavigate={ () => history.push(`/dashboard/${site._id}`) } />
                    )
                }
                    <ListItem button onClick={ () => setEditSiteState({ site: null, open: true }) }>
                        <ListItemIcon><AddIcon /></ListItemIcon>
                        <ListItemText primary="Add a new site" />
                    </ListItem>
                </List>
            } />
            <EditSiteSettingsDialog onClose={ closeSiteSettings }
                                    site={ editSiteProps.site }
                                    open={ editSiteProps.open }
                                    onSubmit={ editSiteProps.site !== null ? updateSite : createNewSite as any }
                                    onDeleteSite={ deleteSite }
            />
        </main>
    );
}

interface Props extends WithStyles<typeof styles> {
    targetApi: TargetApiService;
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
