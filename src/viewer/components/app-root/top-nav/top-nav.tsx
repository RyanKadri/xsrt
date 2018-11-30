import React from "react";
import { AppBar, Toolbar, Typography, IconButton, withStyles } from "@material-ui/core";
import HomeSharp from '@material-ui/icons/HomeSharp';
import { Link } from "react-router-dom";

const styles = {
    grow: {
        flexGrow: 1
    }
};

function TopNav({ classes }: { classes, expandMenu?: () => void }) {
    return (
        <AppBar position="static">
            <Toolbar>
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