import { createStyles, MuiThemeProvider, withStyles } from "@material-ui/core";
import CssBaseline from "@material-ui/core/CssBaseline";
import { NewSiteTarget, SiteTarget } from "@xsrt/common";
import { appTheme, withDependencies } from "@xsrt/common-frontend";
import React, { Fragment } from "react";
import { BrowserRouter as Router, Redirect, Route, Switch } from "react-router-dom";
import { TargetApiService } from "../../services/sites-api-service";
import { OverallDashboardView } from "../dashboard/overall-dashboard";
import { SiteDashboardView } from "../dashboard/site-dashboard";
import { ManageSitesView } from "../manage-sites/manage-sites-view";
import { RecordingView } from "../viewer/recording-view";
import { Sidebar } from "./side-bar/side-bar";
import { TopNav } from "./top-nav/top-nav";

const styles = createStyles({
    root: {
    }
});

class _AppRoot extends React.Component<AppProps, AppState> {

    constructor(props: AppProps) {
        super(props);
        this.state = {
            sidebarExpanded: false,
            availableSites: []
        };
    }

    render() {
        return <Router>
            <Fragment>
                <CssBaseline />
                <MuiThemeProvider theme={ appTheme }>
                    <TopNav onExpand={ this.toggleSidebar(true) } />
                    <Sidebar
                        expanded={ this.state.sidebarExpanded }
                        sites={ this.state.availableSites }
                        onClose={ this.toggleSidebar(false) }/>
                    <Switch>
                        <Route path="/recordings/:recordingId" render={ (match) =>
                            <RecordingView routeParams={match} />
                         } />
                        <Route path="/dashboard/:siteId" render={ (match) =>
                            <SiteDashboardView
                                routeParams={ match }
                                site={ this.state.availableSites.find(site => site._id === match.match.params.siteId )!}
                            />
                        } />
                        <Route path="/dashboard" render={ () =>
                            <OverallDashboardView  sites={ this.state.availableSites } />
                        } />
                        <Route path="/sites" render={ () =>
                            <ManageSitesView sites={this.state.availableSites}
                                             onDelete={ this.deleteSite }
                                             onNewSite={ this.createNewSite }
                            />
                        } />
                        <Route path="/" exact render={() => <Redirect to="/dashboard" /> } />
                    </Switch>
                </MuiThemeProvider>
            </Fragment>
        </Router>;
    }

    private toggleSidebar = (expandState: boolean) => () => {
        this.setState({
            sidebarExpanded: expandState
        });
    }

    async componentDidMount() {
        const sites = await this.props.targetApi.fetchSites();
        this.setState({
            availableSites: sites
        });
    }

    private createNewSite = async (site: NewSiteTarget) => {
        const newSite = await this.props.targetApi.createSite(site);
        this.setState((old) => ({ availableSites: (old.availableSites || []).concat(newSite) }));
    }

    private deleteSite = async (toDelete: SiteTarget) => {
        const deleted = await this.props.targetApi.deleteSite(toDelete);
        this.setState((old) => ({
            availableSites: (old.availableSites || [])
                .filter(site => site._id !== deleted._id )
        }));
    }
}

export const AppRoot = /* hot(module)( */
    withStyles(styles)(
        withDependencies(_AppRoot, { targetApi: TargetApiService })
    );
// );

export interface AppProps {
    targetApi: TargetApiService;
}

export interface AppState {
    sidebarExpanded: boolean;
    availableSites: SiteTarget[];
}
