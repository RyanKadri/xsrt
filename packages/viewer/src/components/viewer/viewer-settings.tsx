import { Checkbox, List, ListItem, ListItemText, Popover } from "@material-ui/core";
import React from "react";
import { ViewerSettings } from "./recording-viewer";

const configItems: AvailableSettings[] = [
    { display: "Block UI on Pause", key: "blockViewerOnPause" },
    { display: "Highlight Idle Sections", key: "showRegions" }
];

export function ViewerSettingsPopover({ open, onUpdate, anchor, onClose, settings }: Props) {
    return (
        <Popover open={open} onClose={onClose} anchorEl={anchor}>
            <List dense={true}>{ configItems.map( config => (
                <ListItem key={config.key}
                    onClick={ () => onUpdate({ ...settings, [config.key]: !settings[config.key] }) }>
                    <Checkbox checked={settings[config.key]} />
                    <ListItemText>{ config.display }</ListItemText>
                </ListItem>
            ))}</List>
        </Popover>
    );
}

interface Props {
    open: boolean;
    settings: ViewerSettings;
    anchor: HTMLElement | null;
    onUpdate: (settings: ViewerSettings) => void;
    onClose: () => void;
}

interface AvailableSettings {
    display: string;
    key: keyof ViewerSettings;
}
