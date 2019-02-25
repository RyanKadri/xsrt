import { RefObject, useEffect, useState } from "react";

export function useComponentSize(componentRef: RefObject<HTMLElement>) {
    const [size, setSize] = useState({ height: window.innerHeight, width: window.innerWidth });
    const cb = () => {
        const bb = componentRef.current
            ? componentRef.current.getBoundingClientRect()
            : { height: 0, width: 0 };
        setSize({ height: bb.height, width: bb.width });
    };
    useEffect(() => {
        window.addEventListener("resize", cb);
        return () => window.removeEventListener("resize", cb);
    }, []);
    useEffect(cb, [ componentRef.current ]);
    return size;
}
