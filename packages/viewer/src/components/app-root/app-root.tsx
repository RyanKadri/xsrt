import DayjsUtils from "@date-io/dayjs";
import { createStyles, MuiThemeProvider, withStyles } from "@material-ui/core";
import CssBaseline from "@material-ui/core/CssBaseline";
import { LoggingService, SiteTarget } from "@xsrt/common";
import { appTheme, useComponent, withDependencies } from "@xsrt/common-frontend";
import { MuiPickersUtilsProvider } from "material-ui-pickers";
import React, { Fragment, useEffect, useReducer } from "react";
import { BrowserRouter as Router, Redirect, Route, Switch } from "react-router-dom";
import { RecordingApiService } from "../../services/recording-service";
import { TargetApiService } from "../../services/sites-api-service";
import { OverallDashboardView } from "../dashboard/overall-dashboard";
import { SiteDashboardView } from "../dashboard/site-dashboard";
import { RecordingView } from "../viewer/recording-view";
import { Sidebar } from "./side-bar/side-bar";
import { TopNav } from "./top-nav/top-nav";

const styles = createStyles({
    root: {
    }
});

const initState: AppState = {
    sidebarExpanded: false,
    availableSites: []
};

function reducer(state: AppState, action: Action) {
    switch (action.type) {
        case "create-site":
            return {
                ...state,
                availableSites: (state.availableSites || []).concat(action.created)
            };
        case "delete-site":
            return {
                ...state,
                availableSites: (state.availableSites || [])
                    .filter(site => site._id !== action.toDelete._id )
            };
        case "set-sites":
            return {
                ...state,
                availableSites: action.sites
            };
        case "update-site":
            return {
                ...state,
                availableSites: state.availableSites.map(
                    oldSite => oldSite._id === action.update._id ? action.update : oldSite
                )
            };
        case "toggle-sidebar":
            return {
                ...state,
                sidebarExpanded: action.expandState
            };
        default:
            return state;
    }
}

const _AppRoot = ({ targetApi }: AppProps) => {
    const [state, dispatch] = useReducer(reducer, initState);

    useEffect(() => {
        targetApi.fetchSites()
            .then(sites => dispatch(new SetSitesAction(sites)));
    }, []);

    const DIOverallDashboard = useComponent(OverallDashboardView, { targetApi: TargetApiService });
    const DISiteDashboard = useComponent(SiteDashboardView, {
        recordingsApi: RecordingApiService,
        logger: LoggingService
    });

    return (
        <Router>
            <Fragment>
                <CssBaseline />
                <MuiThemeProvider theme={ appTheme }>
                    <MuiPickersUtilsProvider utils={ DayjsUtils }>
                        <TopNav onExpand={ () => dispatch(new ToggleSidebarAction(true)) } />
                        <Sidebar
                            expanded={ state.sidebarExpanded }
                            sites={ state.availableSites }
                            onClose={ () => dispatch(new ToggleSidebarAction(false)) }/>
                        <Switch>
                            <Route path="/recordings/:recordingId" render={ (match) =>
                                <RecordingView recordingId={match.match.params.recordingId } />
                            } />
                            <Route path="/dashboard/:siteId" render={ (match) =>
                                <DISiteDashboard
                                    site={ state.availableSites.find(site => site._id === match.match.params.siteId )!}
                                />
                            } />
                            <Route path="/dashboard" render={ () =>
                                <DIOverallDashboard
                                    sites={ state.availableSites }
                                    onDeleteSite={ (site) => dispatch(new DeleteSiteAction(site)) }
                                    onUpdateSite={ (site) => dispatch(new UpdateSiteAction(site)) }
                                    onCreateSite={ (site) => dispatch(new CreateSiteAction(site)) } />
                            } />
                            <Route path="/" exact render={() => <Redirect to="/dashboard" /> } />
                        </Switch>
                    </MuiPickersUtilsProvider>
                </MuiThemeProvider>
            </Fragment>
        </Router>
    );
};

export const AppRoot = /* hot(module)( */
    withStyles(styles)(
        withDependencies(_AppRoot, { targetApi: TargetApiService })
    );
// );

interface AppProps {
    targetApi: TargetApiService;
}

interface AppState {
    sidebarExpanded: boolean;
    availableSites: SiteTarget[];
}

type Action = UpdateSiteAction | CreateSiteAction | DeleteSiteAction | SetSitesAction | ToggleSidebarAction;

class UpdateSiteAction {
    readonly type = "update-site";
    constructor(
        public update: SiteTarget
    ) { }
}

class CreateSiteAction {
    readonly type = "create-site";
    constructor(
        public created: SiteTarget
    ) { }
}

class DeleteSiteAction {
    readonly type = "delete-site";
    constructor(
        public toDelete: SiteTarget
    ) { }
}

class SetSitesAction {
    readonly type = "set-sites";
    constructor(
        public sites: SiteTarget[]
    ) { }
}

class ToggleSidebarAction {
    readonly type = "toggle-sidebar";
    constructor(
        public expandState: boolean
    ) { }
}
