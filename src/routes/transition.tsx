import { motion, useReducedMotion } from 'framer-motion';
import { ReactNode } from 'react';

/** Short entrance for document-like pages (profile, admin). Never used inside the chat. */
export function PageTransition({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  )
}
