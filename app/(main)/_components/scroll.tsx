// components/ScrollIndicator.tsx
"use client"

import { motion } from 'framer-motion';
import useScrollProgress from '@/hooks/use-scroll-progress';

const ScrollIndicator: React.FC = () => {
  const scrollYProgress = useScrollProgress();

  return (
    <motion.div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '4px',
        backgroundColor: 'orange',
        scaleX: scrollYProgress, // this uses scaleX transform to resize the bar
        originX: 0,
        transformOrigin: 'left',
        zIndex: 9999,
      }}
    />
  );
};

export default ScrollIndicator;
