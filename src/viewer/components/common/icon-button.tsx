import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from './icon-button.css';

export function IconButton({ icon, onClick, buttonClass }: IconButtonOptions) {
    return <button onClick={ onClick } className={ buttonClass + ' ' + styles.iconButton }>
        <FontAwesomeIcon className="control-icon" icon={ icon }></FontAwesomeIcon>
    </button>
}

export interface IconButtonOptions {
    buttonClass: string;
    icon: IconDefinition;
    onClick: () => void;
}