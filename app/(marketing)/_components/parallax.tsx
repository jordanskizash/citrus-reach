'use client'

import React from 'react'
import { motion, useTransform, useMotionValue, useAnimationFrame } from 'framer-motion'

interface ParallaxProps {
  children: string
  baseVelocity: number
}

function ParallaxText({ children, baseVelocity = 100 }: ParallaxProps) {
  const baseX = useMotionValue(0)

  // Modified modulo logic to maintain direction while wrapping properly
  const x = useTransform(baseX, (v) => {
    if (baseVelocity > 0) {
      return `${-v % 25}%`  // We add a negative sign for positive velocities
    }
    return `${v % 25}%`     // Keep original behavior for negative velocities
  })

  useAnimationFrame((t, delta) => {
    let moveBy = baseVelocity * (delta / 1500)
    baseX.set(baseX.get() + moveBy)
  })

  const iterations = [0, 1, 2, 3, 4, 5, 6, 7]

  return (
    <div className="parallax">
      <motion.div className="scroller" style={{ x }}>
        {iterations.map((i) => (
          <span key={i} className={i % 2 === 0 ? 'filled' : 'outline'}>{children}</span>
        ))}
      </motion.div>
    </div>
  )
}

export default function Component() {
  const textLines = [
    { text: "Expandable Experience", velocity: 4 },
    { text: "Fully customizable Maxing", velocity: -3 },
    { text: "Premium Design System", velocity: 4 },
    { text: "Built for Performance", velocity: -3 },
  ]

  return (
    <section className="w-screen overflow-hidden bg-white">
      <div className="flex flex-col">
        {textLines.map((line, index) => (
          <ParallaxText 
            key={index} 
            baseVelocity={line.velocity}
          >
            {line.text}
          </ParallaxText>
        ))}
      </div>

      <style jsx global>{`
        .parallax {
          overflow: hidden;
          white-space: nowrap;
          display: flex;
          flex-wrap: nowrap;
        }

        .scroller {
          font-family: "Inter", -apple-system, sans-serif;
          font-weight: 800;
          font-size: 100px;
          display: inline-block;
          white-space: nowrap;
          flex-wrap: nowrap;
          gap: 0;
        }

        .scroller span {
          padding-right: 0;
          margin-right: 30px;
        }

        .scroller span.filled {
          color: black;
        }

        .scroller span.outline {
          -webkit-text-stroke: 4px black;
          -webkit-text-fill-color: transparent;
        }

        @media (max-width: 768px) {
          .scroller {
            font-size: 36px;
          }
        }
      `}</style>
    </section>
  )
}