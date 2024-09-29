// hooks/useScrollProgress.tsx
import { useEffect, useState } from 'react';

const useScrollProgress = (): number => {
    const [progress, setProgress] = useState<number>(0);

    useEffect(() => {
        const updateProgress = () => {
            const scrollFromTop = window.scrollY;
            const windowHeight = window.innerHeight;
            const docHeight = document.documentElement.scrollHeight;

            const totalDocScrollLength = docHeight - windowHeight;
            const scrolledProgress = scrollFromTop / totalDocScrollLength;

            // Ensuring the progress is always between 0 and 1
            setProgress(Math.max(0, Math.min(1, scrolledProgress)));
        };

        window.addEventListener('scroll', updateProgress);
        return () => window.removeEventListener('scroll', updateProgress);
    }, []);

    return progress;
};

export default useScrollProgress;
