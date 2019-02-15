import { Button, createStyles, ExpansionPanel, ExpansionPanelDetails, ExpansionPanelSummary, FormControlLabel, List, ListItem, ListItemIcon, ListItemText, Switch, TextField, Theme, Typography, withStyles, WithStyles } from "@material-ui/core";
import DeleteIcon from "@material-ui/icons/Delete";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { NewSiteTarget, SiteTarget } from "@xsrt/common";
import React, { KeyboardEvent, useState } from "react";

const styles = (theme: Theme) => createStyles({
    submitButton: {
        marginLeft: "auto"
    },
    form: {
        width: "100%",
        display: "flex",
        flexDirection: "column",
        padding: theme.spacing.unit * 2
    },
    addUrlSpacer: {
        flexBasis: "100%"
    },
    detailsSection: {
        flexWrap: "wrap"
    },
    dialogControls: {
        padding: "8px 0",
        display: "flex"
    }
});

const initForm: NewSiteTarget = {
    name: "",
    urls: [],
    wildcardUrl: false
};

const _EditSiteForm = ({ classes, site, onSubmit, onDeleteSite }: Props) => {
    const [ siteState, updateSite ] = useState<SiteTarget | NewSiteTarget>(site || initForm);

    const updateField = (field: keyof NewSiteTarget, value: NewSiteTarget[typeof field]) => {
        updateSite(old => ({ ...old, [field]: value }));
    };

    const addUrl = (e: KeyboardEvent<HTMLInputElement>) => {
        const target = e.target as HTMLInputElement;
        const val = target.value;
        if (e.key === "Enter" && val) {
            e.preventDefault();
            updateSite(old => ({
                ...old,
                urls: old.urls.concat(val)
            }));
            target.value = "";
        }
    };

    const removeUrl = (toRemove: string) => {
        updateSite(old => ({
            ...old,
            urls: old.urls.filter(url => url !== toRemove)
        }));
    };

    return (
        <form className={classes.form}
              onSubmit={ (e) => { onSubmit(siteState); e.preventDefault(); } }>
            <TextField  label="Site Name"
                        value={ siteState.name }
                        onChange={ e => updateField("name", e.currentTarget.value) }
            />
            <FormControlLabel label="Allow any URL"
                control={
                    <Switch value={ siteState.wildcardUrl }
                            onChange={ e => updateField("wildcardUrl", e.currentTarget.checked) } />
                }
            />
            { !siteState.wildcardUrl &&
                <ExpansionPanel>
                    <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />} disabled={siteState.urls.length === 0}>
                        <Typography variant="body1">Whitelisted URLS ({ siteState.urls.length })</Typography>
                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails className={ classes.detailsSection }>
                        <div className={classes.addUrlSpacer}>
                            <TextField label="Add a url"
                                onKeyDown={ addUrl }/>
                        </div>
                        <List dense>{
                            siteState.urls.map(url => (
                                <ListItem key={url}>
                                    <ListItemText primary={url} />
                                    <ListItemIcon onClick={ () => removeUrl(url) }>
                                        <DeleteIcon />
                                    </ListItemIcon>
                                </ListItem>
                            ))
                        }
                        </List>
                    </ExpansionPanelDetails>
                </ExpansionPanel>
            }
            <div className={ classes.dialogControls }>
                <Button type="button" color="secondary" variant="contained" onClick={ onDeleteSite }>
                    Delete Site
                </Button>
                <Button type="submit" color="primary" variant="contained"
                        className={classes.submitButton}>
                    Submit
                </Button>
            </div>
        </form>
    );
};

export const EditSiteForm = withStyles(styles)(_EditSiteForm);

interface Props extends WithStyles<typeof styles> {
    site: SiteTarget | null;
    onSubmit: (site: SiteTarget | NewSiteTarget) => void;
    onDeleteSite: () => void;
}

export interface AddSiteFormState {
    newSite: NewSiteTarget;
}
