import { motion, Transition, Variants } from 'framer-motion';
import { ReactNode } from 'react';

const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: '-10vh', // Example: slide in from left
  },
  in: {
    opacity: 1,
    y: 0,
  },
  out: {
    opacity: 0,
    y: '100vh', // Example: slide out to right
  },
};

const pageTransition: Transition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.5,
};


export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
    >
      {children}
    </motion.div>
  )
}