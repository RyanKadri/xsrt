import { createStyles, Dialog, DialogTitle, makeStyles } from "@material-ui/core";
import React from "react";
import { NewSiteTarget, SiteTarget } from "../../../../common/src";
import { EditSiteForm } from "./edit-site-form";

const useStyles = makeStyles(createStyles({
  dialog: {
    minWidth: 600
  }
}));

interface Props {
  site: SiteTarget | null;
  open: boolean;
  onClose: () => void;
  onSubmit: (site: SiteTarget | Pick<NewSiteTarget, "name">) => void;
  onDeleteSite: () => void;
}

export function EditSiteSettingsDialog({ onClose, site, open, onSubmit, onDeleteSite }: Props) {
  const classes = useStyles();
  return (
    <Dialog open={open} scroll="body"
      onClose={onClose} classes={ { paper: classes.dialog } }>
      <DialogTitle>
        {site !== null ? `Edit Site: ${site.name}` : "Create Site"}
      </DialogTitle>
      <EditSiteForm onSubmit={onSubmit} site={site} onDeleteSite={onDeleteSite} />
    </Dialog>
  )
}
