"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger 
} from "@/components/ui/sheet"

const ROUTES = {
  HOME: "/",
  ABOUT: "/about",
  IMPACT: "/impact",
  LOGIN: "/login",
  REGISTER: "/register",
  DASHBOARD: "/dashboard"
}

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href={ROUTES.HOME} className="flex items-center">
            <span className="font-medium text-xl">Pesia's Kitchen</span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              href={ROUTES.HOME} 
              className="text-gray-600 hover:text-blue-600 text-sm font-medium"
            >
              Home
            </Link>
            <Link 
              href={ROUTES.ABOUT} 
              className="text-gray-600 hover:text-blue-600 text-sm font-medium"
            >
              About
            </Link>
            <Link 
              href={ROUTES.IMPACT} 
              className="text-gray-600 hover:text-blue-600 text-sm font-medium"
            >
              Impact
            </Link>
            <Link 
              href={ROUTES.LOGIN} 
              className="text-gray-600 hover:text-blue-600 text-sm font-medium"
            >
              Login
            </Link>
            <Button asChild>
              <Link href={ROUTES.REGISTER}>Register</Link>
            </Button>
          </nav>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Menu">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                    />
                  </svg>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[80%] sm:w-[350px]">
                <div className="flex flex-col gap-6 mt-8">
                  <Link
                    href={ROUTES.HOME}
                    className="text-lg font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Home
                  </Link>
                  <Link
                    href={ROUTES.ABOUT}
                    className="text-lg font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    About
                  </Link>
                  <Link
                    href={ROUTES.IMPACT}
                    className="text-lg font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Impact
                  </Link>
                  <Link
                    href={ROUTES.LOGIN}
                    className="text-lg font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Button asChild className="w-full">
                    <Link
                      href={ROUTES.REGISTER}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Register
                    </Link>
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}