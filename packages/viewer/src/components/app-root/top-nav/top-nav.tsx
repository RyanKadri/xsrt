import { AppBar, IconButton, Toolbar, Typography, withStyles, WithStyles } from "@material-ui/core";
import HomeSharp from "@material-ui/icons/HomeSharp";
import MenuIcon from "@material-ui/icons/Menu";
import React from "react";
import { Link } from "react-router-dom";

export const topNavHeight = 8;

const styles = {
    grow: {
        flexGrow: 1
    }
};

const _TopNav = ({ classes, onExpand }: TopNavProps) => (
    <AppBar position="static">
        <Toolbar>
            <IconButton color="inherit" onClick={ onExpand }>
                <MenuIcon></MenuIcon>
            </IconButton>
            <Typography variant="h6" color="inherit" className={ classes.grow }>
                XSRT
            </Typography>
            <IconButton color="inherit" component={Link as any} { ...{to: "/dashboard"} }>
                <HomeSharp></HomeSharp>
            </IconButton>
        </Toolbar>
    </AppBar>
);

export const TopNav = withStyles(styles)(_TopNav);

export interface TopNavProps extends WithStyles<typeof styles> {
    onExpand(): void;
}
