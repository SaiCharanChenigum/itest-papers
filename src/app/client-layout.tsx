"use client"

import { useEffect, useState } from "react"
import Image from "next/image"

export default function Header() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
        scrolled
          ? "backdrop-blur-xl bg-white/70 shadow-md"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        
        {/* Logo */}
        <div className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="logo"
            width={36}
            height={36}
            className="object-contain"
          />
          <span className="font-bold text-lg text-[#0FB9B1] hidden sm:inline">
            i. Test Papers
          </span>
        </div>

        {/* Nav */}
        <nav className="flex items-center gap-6 text-sm font-medium">
          <a href="/" className="hover:text-[#0FB9B1] transition hidden md:block">
            Home
          </a>
          <a href="/courses" className="hover:text-[#0FB9B1] transition hidden md:block">
            Courses
          </a>
          <a href="/books" className="hover:text-[#0FB9B1] transition hidden md:block">
            Books
          </a>

          <a
            href="/login"
            className="bg-[#0FB9B1] text-black px-5 py-2 rounded-xl font-semibold hover:scale-105 transition"
          >
            Login
          </a>
        </nav>
      </div>
    </header>
  )
}
