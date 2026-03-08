"use client"

import { motion } from "framer-motion"
import { Lock, Unlock } from "lucide-react"

export default function CourseCard({
  title,
  subtitle,
  isFree,
}: {
  title: string
  subtitle: string
  isFree: boolean
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      className="cursor-pointer rounded-xl bg-white shadow-lg p-6 border border-teal-100 hover:shadow-xl transition"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>

        {isFree ? (
          <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
            <Unlock size={16} /> Free
          </span>
        ) : (
          <span className="flex items-center gap-1 text-red-500 text-sm font-medium">
            <Lock size={16} /> Premium
          </span>
        )}
      </div>

      <p className="text-sm text-gray-500 mt-2">{subtitle}</p>
    </motion.div>
  )
}
