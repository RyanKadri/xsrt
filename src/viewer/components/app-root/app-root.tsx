import React, { Fragment } from "react";
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import { OverallDashboardView } from "../dashboard/overall-dashboard";
import { ViewerComponent } from "../viewer/viewer";
import CssBaseline from '@material-ui/core/CssBaseline'
import { MuiThemeProvider } from "@material-ui/core";
import { appTheme } from "../../../viewer/theme/theme";
import TopNav from "./top-nav/top-nav";
import SideBar from './side-bar/side-bar';
import { SiteTarget } from "@common/db/targets";
import { NewSiteTarget } from "../manage-sites/add-site-form";
import { ManageSitesView } from "../manage-sites/manage-sites-view";
import { TargetApiService } from "../../../viewer/services/sites-api-service";
import { RecordingApiService } from "../../../viewer/services/recording-service";
import { PlaybackManager } from "@scraper/playback/playback-manager";
import { hot } from 'react-hot-loader';
import { SiteDashboardView } from "../dashboard/site-dashboard";

class AppRoot extends React.Component<AppProps, AppState> {

    constructor(props) {
        super(props)
        this.state = {
            sidebarExpanded: false,
            availableSites: []
        }
    }

    render() {
        const { playbackManager, recordingApi } = this.props;
        return <Router>
            <Fragment>
                <CssBaseline />
                <MuiThemeProvider theme={ appTheme }>
                    <TopNav onExpand= { this.toggleSidebar(true) } />
                    <SideBar 
                        expanded={ this.state.sidebarExpanded } 
                        sites={ this.state.availableSites } 
                        onClose={ this.toggleSidebar(false) }/>
                    <Switch>
                        <Route path="/recordings/:recordingId" render={ (props) =>
                            <ViewerComponent {...props} playbackManager={ playbackManager } recordingService={ recordingApi } />
                         } />
                        <Route path="/dashboard/:siteId" render={ (match) => 
                            <SiteDashboardView 
                                routeParams={match} 
                                recordingService={ this.props.recordingApi } 
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
        </Router>
    }

    private toggleSidebar = (expandState: boolean) => () => {
        this.setState({
            sidebarExpanded: expandState
        })
    }

    async componentDidMount() {
        const sites = await this.props.targetApi.fetchSites();
        this.setState({
            availableSites: sites
        });
    }

    private createNewSite = async (site: NewSiteTarget) => {
        const newSite = await this.props.targetApi.createSite(site);
        this.setState((old) => ({ availableSites: (old.availableSites || []).concat(newSite) }))
    }

    private deleteSite = async (site: SiteTarget) => {
        const deleted = await this.props.targetApi.deleteSite(site);
        this.setState((old) => ({ 
            availableSites: (old.availableSites || [])
                .filter(site => site._id !== deleted._id )
        }))
    }
}

export default hot(module)(AppRoot)

export interface AppProps {
    targetApi: TargetApiService,
    recordingApi: RecordingApiService,
    playbackManager: PlaybackManager,
}

export interface AppState {
    sidebarExpanded: boolean;
    availableSites: SiteTarget[];
}