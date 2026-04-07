"use client"

import { motion } from "framer-motion"
import { Leaf } from "lucide-react"

export function UnwindLogo() {
  return (
    <motion.div
      className="relative flex items-center justify-center mr-2"
      initial={{ scale: 0.8, opacity: 0, rotate: -15 }}
      animate={{ scale: 1, opacity: 1, rotate: 0 }}
      whileHover={{
        scale: 1.1,
        rotate: 15,
        transition: { type: "spring", stiffness: 400, damping: 10 }
      }}
      transition={{
        duration: 0.8,
        ease: [0, 0.71, 0.2, 1.01],
        scale: {
          type: "spring",
          damping: 12,
          stiffness: 100,
          restDelta: 0.001
        }
      }}
    >
      <div className="absolute inset-0 bg-primary/20 blur-md rounded-full scale-150 -z-10" />
      <Leaf
        className="h-6 w-6 text-primary"
        strokeWidth={1.5}
        fill="currentColor"
        fillOpacity={0.15}
      />
      <motion.div
        className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-primary rounded-full"
        initial={{ scale: 0 }}
        animate={{ scale: [0, 1.2, 1] }}
        transition={{ delay: 0.6, duration: 0.4 }}
      />
    </motion.div>
  )
}
