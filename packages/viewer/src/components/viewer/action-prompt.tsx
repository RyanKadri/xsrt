import { Button, makeStyles, Theme } from "@material-ui/core";
import React from "react";

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: `rgba(0,0,0,0.45)`,
    padding: theme.spacing(1),
    zIndex: 11
  },
}));

export function ActionPrompt({ onPromptClicked, prompt }: ActionPromptProps) {
  const classes = useStyles();
  return (
    <div className={classes.container}>
      <Button variant="contained" color="primary" onClick={onPromptClicked}>{prompt}</Button>
    </div>
  );
};

interface ActionPromptProps {
  prompt: string;
  onPromptClicked: () => void;
}
