import { useState } from "react";

export function useDialog(initiallyOpen: false, anchor?: HTMLElement): DialogControls;
export function useDialog(initiallyOpen: true, anchor: HTMLElement): DialogControls;
export function useDialog(initiallyOpen: boolean, anchor: HTMLElement | null = null): DialogControls {
    const [open, setOpen] = useState(initiallyOpen);
    const [anchorEl, setAnchor] = useState<HTMLElement | null>(anchor);
    return {
        open,
        anchorEl,
        openDialog(newAnchorEl: HTMLElement) {
            setOpen(true);
            setAnchor(newAnchorEl);
        },
        closeDialog() {
            setOpen(false);
        }
    };
}

interface DialogControls {
    open: boolean;
    anchorEl: HTMLElement | null;
    openDialog(anchor: HTMLElement): void;
    closeDialog(): void;
}
