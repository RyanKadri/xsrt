import { Button, createStyles, makeStyles, TextField, Theme, Typography } from "@material-ui/core";
import React, { useState } from "react";
import { NewSiteTarget, SiteTarget } from "../../../../common/src";

const styles = (theme: Theme) => createStyles({
  submitButton: {
    marginLeft: "auto"
  },
  form: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    padding: theme.spacing(2)
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
  },
  siteId: {
    display: "inline-block",
    color: theme.palette.text.secondary
  },
});

const initForm: Pick<NewSiteTarget, "name"> = {
  name: "",
};

const useStyles = makeStyles(styles);

interface Props {
  site: SiteTarget | null;
  onSubmit: (site: SiteTarget | Pick<NewSiteTarget, "name">) => void;
  onDeleteSite: () => void;
}

export function EditSiteForm({ site, onSubmit, onDeleteSite }: Props) {
  const classes = useStyles();

  const [siteState, updateSite] = useState<SiteTarget | Pick<NewSiteTarget, "name">>(() => {
    return site !== null ? site : initForm;
  });

  const updateField = (field: keyof NewSiteTarget, value: NewSiteTarget[typeof field]) => {
    updateSite(old => ({ ...old, [field]: value }));
  };

  return (
    <form className={classes.form}
      onSubmit={(e) => { onSubmit({ ...(site || {}), ...siteState }); e.preventDefault(); }}>
      {site?.customerId && <Typography className={classes.siteId}>Site ID: {site.customerId}</Typography>}
      <TextField label="Site Name"
        value={siteState.name}
        onChange={e => updateField("name", e.currentTarget.value)}
      />
      <div className={classes.dialogControls}>
        <Button type="button" color="secondary" variant="contained" onClick={onDeleteSite}>
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
