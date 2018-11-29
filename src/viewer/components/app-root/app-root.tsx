import React, { Fragment } from "react";
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import { DashboardComponent } from "../dashboard/dashboard";
import { ViewerType } from "../viewer/viewer";
import CssBaseline from '@material-ui/core/CssBaseline'
import { MuiThemeProvider } from "@material-ui/core";
import { appTheme } from "../../../viewer/theme/theme";
import TopNav from "./top-nav/top-nav";

export const IAppRoot = Symbol('AppRoot');
export const AppRoot = (DashboardView: DashboardComponent, RecordingView: ViewerType) => 
class extends React.Component {

    constructor(props) {
        super(props)
    }

    render() {
        return <Router>
            <Fragment>
                <CssBaseline />
                <MuiThemeProvider theme={ appTheme }>
                    <TopNav />
                    <Switch>
                        <Route path="/recordings/:recordingId" component={ RecordingView } />
                        <Route path="/dashboard" component={ DashboardView } />
                        <Route render={() => <Redirect to="/dashboard" /> } />
                    </Switch>
                </MuiThemeProvider>
            </Fragment>
        </Router>
    }
}