import { ListItem } from "@material-ui/core";
import { ListItemProps } from "@material-ui/core/ListItem";
import React from "react";
import { Link } from "react-router-dom";

export const LinkListItem = (props: LinkListItemProps) =>
    <ListItem component={Link as any} {...props}></ListItem>;

export interface LinkListItemProps extends ListItemProps {
    to: string;
}
