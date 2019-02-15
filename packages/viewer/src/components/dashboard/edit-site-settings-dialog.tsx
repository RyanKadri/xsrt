import { createStyles, Dialog, DialogTitle, Theme, Typography, WithStyles, withStyles } from "@material-ui/core";
import { NewSiteTarget, SiteTarget } from "@xsrt/common";
import React from "react";
import { EditSiteForm } from "./edit-site-form";

const styles = (theme: Theme) => createStyles({
    siteId: {
        display: "inline-block",
        float: "right",
        color: theme.palette.text.secondary
    }
});

const _EditSiteSettingsDialog = ({ onClose, site, open, onSubmit, classes, onDeleteSite }: Props) => (
    <Dialog open={ open } scroll="body"
            onClose={ onClose }>
        <DialogTitle>
            { site !== null ? "Edit Site" : "Create Site" }
            { site && <Typography className={ classes.siteId }>Site ID: { site._id }</Typography>}
        </DialogTitle>
        <EditSiteForm onSubmit={ onSubmit } site={ site } onDeleteSite={ onDeleteSite } />
    </Dialog>
);

export const EditSiteSettingsDialog = withStyles(styles)(_EditSiteSettingsDialog);

interface Props extends WithStyles<typeof styles> {
    site: SiteTarget | null;
    open: boolean;
    onClose: () => void;
    onSubmit: (site: SiteTarget | NewSiteTarget) => void;
    onDeleteSite: () => void;
}
