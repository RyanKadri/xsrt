import React, { Fragment } from "react";
import { BrowserRouter as Router, Route, Link, Switch, Redirect } from 'react-router-dom';
import styles from './app-root.css';
import { DashboardComponent } from "../dashboard/dashboard";
import { ViewerComponent } from "../viewer/viewer";

export const IAppRoot = Symbol('AppRoot');
export const AppRoot = (DashboardView: DashboardComponent, RecordingView: ViewerComponent) => 
class extends React.Component {
    render() {
        return <Router>
            <Fragment>
                <nav className={ styles.topHeader }>
                    <Link to="/dashboard">App ICU</Link>
                </nav>
                <Switch>
                    <Route path="/recordings/:recordingId" component={ RecordingView } />
                    <Route path="/dashboard" component={ DashboardView } />
                    <Route render={() => <Redirect to="/dashboard" /> } />
                </Switch>
            </Fragment>
        </Router>
    }
}