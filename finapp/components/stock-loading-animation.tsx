"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

export function StockLoadingAnimation() {
  const [height, setHeight] = useState(50)
  const [color, setColor] = useState("#ef4444") // red-500

  useEffect(() => {
    const interval = setInterval(() => {
      setHeight((prev) => {
        const newHeight = prev === 50 ? 150 : 50
        setColor(newHeight === 150 ? "#22c55e" : "#ef4444") // green-500 : red-500
        return newHeight
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-8">
        <div className="relative h-[200px] w-[100px]">
          <motion.div
            className="absolute bottom-0 w-2 rounded-full"
            style={{
              height,
              backgroundColor: color,
              left: "50%",
              transform: "translateX(-50%)",
            }}
            animate={{
              height,
              backgroundColor: color,
            }}
            transition={{
              duration: 0.5,
              ease: "easeInOut",
            }}
          />
        </div>
        <div className="flex flex-col items-center gap-2">
          <h3 className="text-xl font-semibold">Processing Market Data</h3>
          <p className="text-sm text-muted-foreground">Please wait while we analyze the latest market events</p>
        </div>
      </div>
    </div>
  )
}