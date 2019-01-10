import { Button, createStyles, ExpansionPanel, ExpansionPanelDetails, ExpansionPanelSummary, MenuItem, TextField, Theme, withStyles, WithStyles } from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import React, { FormEvent } from "react";
import { NewSiteTarget } from '../../../common/db/targets';

const styles = (theme: Theme) => createStyles({
    root: {
        width: '100%',
        padding: theme.spacing.unit * 2
    },
    submitButton: {
        display: 'block',
        margin: theme.spacing.unit,
        padding: '8px 16px'
    },
    growInput: {
        flexGrow: 1,
        '&:not(:first-of-type)': {
            marginLeft: theme.spacing.unit
        }
    },
    form: {
        width: '100%',
        display: 'flex'
    }
})

const initForm: NewSiteTarget = {
    name: "",
    identifiedBy: "host",
    identifier: "",
    url: ""
}

class AddSiteFormPlain extends React.Component<AddSiteFormProps, AddSiteFormState> {
    
    constructor(props: AddSiteFormProps) {
        super(props);
        this.state = {
            newSite: initForm,
            expanded: false
        }
    }

    render() {
        const { classes } = this.props;
        const { newSite, expanded } = this.state;
        return <ExpansionPanel className={ classes.root } expanded={expanded}>
            <ExpansionPanelSummary expandIcon={ !this.state.expanded ? null : <ExpandMoreIcon onClick={this.toggleFormExpansion(false)} /> }>
                <TextField className={classes.growInput}
                        label="Add a Site"
                        placeholder="Site Name"
                        value={ newSite.name }
                        onChange={ this.handleChange('name') }
                        onFocus={ this.toggleFormExpansion(true) }
                />
            </ExpansionPanelSummary>
            <ExpansionPanelDetails>
                <form className={classes.form} 
                      onSubmit={ this.handleNewSite }
                >
                    <TextField select
                               label="Identified By"
                               value={ newSite.identifiedBy }
                               onChange={ this.handleChange('identifiedBy')}
                    >
                        <MenuItem value="host">Host Name</MenuItem>
                    </TextField>
                    <TextField className={classes.growInput}
                               label={ this.identifierLabel() }
                               value={ newSite.identifier }
                               onChange={ this.handleChange('identifier') }
                    />
                    <Button type="submit" color="primary" variant="contained"
                            className={classes.submitButton}>
                        Submit
                    </Button>
                </form>
            </ExpansionPanelDetails>
        </ExpansionPanel>
    }

    private identifierLabel() {
        switch(this.state.newSite.identifiedBy) {
            case "host":
            default:
                return "Host Name";
        }
    }

    private handleChange = (prop: keyof AddSiteFormState["newSite"]) => (event: any) => {
        const newVal = event.target.value;
        this.setState((oldState) => ({ newSite: { ...oldState.newSite, [prop]: newVal } as any}))
    }

    private toggleFormExpansion = (expanded: boolean) => () => {
        this.setState({ expanded })
    }

    private handleNewSite = (evt: FormEvent<HTMLFormElement>) => {
        this.props.onNewSite( this.state.newSite );
        this.setState({ newSite: initForm })
        evt.preventDefault()
    }
}

export const AddSiteForm = withStyles(styles)(AddSiteFormPlain);

export interface AddSiteFormProps extends WithStyles<typeof styles> {
    onNewSite(newSite: NewSiteTarget): void;
}

export interface AddSiteFormState {
    newSite: NewSiteTarget;
    expanded: boolean;
}