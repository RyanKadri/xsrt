import { AppBar, createStyles, IconButton, makeStyles, Toolbar, Typography } from "@material-ui/core";
import HomeSharp from "@material-ui/icons/HomeSharp";
import MenuIcon from "@material-ui/icons/Menu";
import React from "react";
import { Link } from "react-router-dom";

export const topNavHeight = 8;

const useStyles = makeStyles(createStyles({
  grow: {
    flexGrow: 1
  }
}));

interface Props {
  onExpand(): void;
}

export function TopNav({ onExpand }: Props) {
  const classes = useStyles();
  return (
    <AppBar position="static">
      <Toolbar>
        <IconButton color="inherit" onClick={onExpand}>
          <MenuIcon></MenuIcon>
        </IconButton>
        <Typography variant="h6" color="inherit" className={classes.grow}>
          XSRT
            </Typography>
        <IconButton color="inherit" component={Link as any} {...{ to: "/dashboard" }}>
          <HomeSharp></HomeSharp>
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}
