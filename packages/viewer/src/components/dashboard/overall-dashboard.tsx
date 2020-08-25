import { createStyles, List, ListItem, ListItemIcon, ListItemText, makeStyles, Theme, Typography } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import React, { useState } from "react";
import { Route } from "react-router";
import { NewSiteTarget, SiteTarget } from "../../../../common/src";
import { TargetApiService } from "../../services/sites-api-service";
import { DashboardTargetListItem } from "./dashboard-target-item";
import { EditSiteSettingsDialog } from "./edit-site-settings-dialog";

const useStyles = makeStyles((theme: Theme) => createStyles({
  root: {
    padding: theme.spacing(2),
    maxWidth: 900
  }
}));

interface Props {
  targetApi: TargetApiService;
  sites: SiteTarget[];
  onUpdateSite: (site: SiteTarget) => void;
  onDeleteSite: (site: SiteTarget) => void;
  onCreateSite: (site: SiteTarget) => void;
}

interface State {
  site: SiteTarget | null;
  open: boolean;
}

export function OverallDashboardView({ sites, onCreateSite, onUpdateSite, onDeleteSite, targetApi }: Props) {
  const classes = useStyles();
  const [editSiteProps, setEditSiteState] = useState<State>({ site: null, open: false });
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
    <main className={classes.root}>
      <Typography variant="h5">Recording Targets</Typography>
      <Route render={({ history }) =>
        <List dense>{
          sites.map(site =>
            <DashboardTargetListItem site={site} key={site.customerId}
              onEditSite={() => setEditSiteState((_) => ({ site, open: true }))}
              onNavigate={() => history.push(`/dashboard/${site.customerId}`)} />
          )
        }
          <ListItem button onClick={() => setEditSiteState({ site: null, open: true })}>
            <ListItemIcon><AddIcon /></ListItemIcon>
            <ListItemText primary="Add a new site" />
          </ListItem>
        </List>
      } />
      <EditSiteSettingsDialog onClose={closeSiteSettings}
        site={editSiteProps.site}
        open={editSiteProps.open}
        onSubmit={editSiteProps.site !== null ? updateSite : createNewSite as any}
        onDeleteSite={deleteSite}
      />
    </main>
  );
}
