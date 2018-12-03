import React from "react";
import { withStyles, Drawer, List, ListSubheader, WithStyles, createStyles } from "@material-ui/core";
import { SiteTarget } from "@common/db/targets";
import { LinkListItem } from "../../common/link-list-item";
import { RouteComponentProps, withRouter } from "react-router";

const styles = theme => createStyles({
    nested: {
        paddingLeft: theme.spacing.unit * 4
    },
    root: {
        color: theme.palette.text.primary
    }
})

export class SideBar extends React.Component<SidebarProps> {

    componentDidUpdate(oldProps: SidebarProps) {
        if(oldProps.location.pathname !== this.props.location.pathname) {
            this.props.onClose();
        }
    }

    render() {
        const { expanded, sites, classes, onClose } = this.props;
        return <Drawer variant="temporary" anchor="left" open={expanded} className={ classes.root } onClose={ onClose }>
            <List color="inherit" component="nav">
                <LinkListItem button to="/dashboard">Dashboard</LinkListItem>
                <LinkListItem button to="/sites">Manage Sites</LinkListItem>
                <List subheader={<ListSubheader component="div">Sites</ListSubheader>}>
                    {sites.map( site => (
                        <LinkListItem button className={ classes.nested }
                                      key={site._id} to={`/dashboard/${site._id}`}>
                            {site.name}
                        </LinkListItem>
                    ))}
                </List>
            </List>
        </Drawer>
    }
}

export default withStyles(styles, { withTheme: true })(withRouter(SideBar));

export interface SidebarProps extends WithStyles<typeof styles>, RouteComponentProps {
    expanded: boolean;
    sites: SiteTarget[];

    onClose: () => void;
}