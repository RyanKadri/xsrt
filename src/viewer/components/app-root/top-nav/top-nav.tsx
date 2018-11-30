import React from "react";
import { AppBar, Toolbar, Typography, IconButton, withStyles, WithStyles } from "@material-ui/core";
import HomeSharp from '@material-ui/icons/HomeSharp';
import MenuIcon from '@material-ui/icons/Menu';
import { Link } from "react-router-dom";

const styles = {
    grow: {
        flexGrow: 1
    }
};

function TopNav({ classes, onExpand }: TopNavProps) {
    return (
        <AppBar position="static">
            <Toolbar>
                <IconButton color="inherit" onClick={ onExpand }>
                    <MenuIcon></MenuIcon>
                </IconButton>
                <Typography variant="h6" color="inherit" className={ classes.grow }>
                    App ICU
                </Typography>
                <IconButton color="inherit" component={Link as any} { ...{to:"/dashboard"} }>
                    <HomeSharp></HomeSharp>
                </IconButton>
            </Toolbar>
        </AppBar>
    )
}

export default withStyles(styles)(TopNav);

export interface TopNavProps extends WithStyles<typeof styles> {
    onExpand(): void;
}