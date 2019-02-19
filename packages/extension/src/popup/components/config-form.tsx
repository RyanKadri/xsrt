import { Button, createStyles, ExpansionPanel, ExpansionPanelDetails, ExpansionPanelSummary, FormControlLabel, Switch, TextField, Theme, Typography, withStyles, WithStyles } from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import React, { ChangeEvent, FormEvent } from "react";
import { ExtensionConfig } from "../../config/extension-config";

const styles = (theme: Theme) => createStyles({
    form: {
        display: "flex",
        flexWrap: "wrap"
    },
    formField: {
        width: "100%"
    },
    submitButton: {
        marginLeft: "auto",
        marginTop: theme.spacing.unit
    }
});

class _ConfigForm extends React.Component<ConfigFormProps, ConfigFormState> {

    constructor(props: ConfigFormProps) {
        super(props);
        this.state = {
            config: props.config
        };
    }

    render() {
        const { classes } = this.props;
        const { config } = this.state;
        return <ExpansionPanel defaultExpanded={ false }>
            <ExpansionPanelSummary expandIcon={ <ExpandMoreIcon /> }>
                <Typography variant="h6">Config</Typography>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails>
                <form className={ classes.form } onSubmit={ this.onSubmit }>
                    <FormControlLabel
                        className={ classes.formField }
                        control={ <Switch checked={ config.debugMode } onChange={ this.updateField("debugMode") } />}
                        label="Debug Mode" />
                    <FormControlLabel
                        className={ classes.formField }
                        control={
                            <Switch checked={ config.shouldInject }
                                    onChange={ this.updateField("shouldInject") }
                            /> }
                        label="Passively Record" />
                    <TextField
                        className={ classes.formField }
                        label="Backend URL"
                        value={ config.backendUrl }
                        onChange={ this.updateField("backendUrl") } />
                    <TextField
                        className={ classes.formField }
                        label="Site ID"
                        value={ config.site }
                        onChange={ this.updateField("site") } />
                    <Button className={ classes.submitButton } color="primary" type="submit">Submit</Button>
                </form>
            </ExpansionPanelDetails>
        </ExpansionPanel>;
    }

    private updateField = (field: keyof ExtensionConfig) => {
        return (evt: ChangeEvent<HTMLInputElement>) => {
            const target = evt.currentTarget;
            this.setState(oldState => ({
                config: {
                    ...oldState.config,
                    [field]: target.type === "checkbox" ? target.checked : target.value
                }
            }));
        };
    }

    private onSubmit = (evt: FormEvent) => {
        evt.preventDefault();
        this.props.onSubmit(this.state.config);
    }
}

export const ConfigForm = withStyles(styles)(_ConfigForm);

export interface ConfigFormProps extends WithStyles<typeof styles> {
    config: ExtensionConfig;
    onSubmit: (config: ExtensionConfig) => void;
}

export interface ConfigFormState {
    config: ExtensionConfig;
}
