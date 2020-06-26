import { Button, createStyles, Theme, withStyles, WithStyles } from "@material-ui/core";
import React from "react";

const styles = (theme: Theme) => createStyles({
    container: {
        position: "absolute",
        bottom: 0,
        width: "100%",
        backgroundColor: `rgba(0,0,0,0.45)`,
        padding: theme.spacing(1),
        zIndex: 11
    },
});

const _ActionPrompt = ({ classes, onPromptClicked, prompt }: ActionPromptProps) => {
    return <div className={ classes.container }>
        <Button variant="contained" color="primary" onClick={ onPromptClicked }>{ prompt }</Button>
    </div>;
};

interface ActionPromptProps extends WithStyles<typeof styles> {
    prompt: string;
    onPromptClicked: () => void;
}

export const ActionPrompt = withStyles(styles)(_ActionPrompt);
