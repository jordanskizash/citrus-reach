import { useEffect, useState } from "react";

export const useOrigin = () => {
    // useState to manage the `mounted` state which indicates if the component is mounted.
    // It starts as false indicating the component has not yet mounted.
    const [mounted, setMounted] = useState(false);

    // Define `origin` by checking if the `window` object is available (ensures code is running in the browser),
    // and if so, use `window.location.origin` to get the origin URL. If not available, default to an empty string.
    const origin = typeof window !== "undefined" && window.location.origin ? window.location.origin: "";

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return "";
    }

    return origin;
};