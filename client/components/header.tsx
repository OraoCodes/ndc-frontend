"use client"

import { Link } from "react-router-dom"
import { Search, LogIn, UserPlus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface HeaderProps {
    currentPage?: string
}

export function Header({ currentPage }: HeaderProps) {
    return (
        <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between gap-6">

                {/* Logo */}
                <Link to="/" className="flex items-center gap-3 flex-shrink-0">
                    <img src="/Blur.png" className="h-10 w-auto" alt="Logo" />
                    <div>
                        <h1 className="text-sm font-bold leading-tight text-gray-900">
                            NDC tracking tool for
                        </h1>
                        <p className="text-xs text-gray-500">water and waste management in Kenya</p>
                    </div>
                </Link>

                {/* Search Bar (Hidden on mobile) */}
                {/* <div className="flex-1 max-w-md hidden lg:flex">
                    <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search counties, reports..."
                            className="pl-10 bg-gray-50 border-0 focus:ring-2 focus:ring-blue-500 text-gray-800"
                        />
                    </div>
                </div> */}

                {/* Navigation Links */}
                <nav className="hidden md:flex items-center gap-6 text-sm font-small">
                    <Link
                        to="/"
                        className={`transition-colors ${currentPage === "home" ? "text-blue-600 font-semibold" : "text-gray-700 hover:text-blue-600"}`}
                    >
                        HOME
                    </Link>
                    {/* <Link
                        to="/counties"
                        className={`transition-colors ${currentPage === "counties" ? "text-blue-600 font-semibold" : "text-gray-700 hover:text-blue-600"}`}
                    >
                        COUNTIES
                    </Link> */}
                    <Link
                        to="/water-management"
                        className={`transition-colors ${currentPage === "water" ? "text-blue-600 font-semibold" : "text-gray-700 hover:text-blue-600"}`}
                    >
                        WATER MANAGEMENT
                    </Link>
                    <Link
                        to="/waste-management"
                        className={`transition-colors ${currentPage === "waste" ? "text-blue-600 font-semibold" : "text-gray-700 hover:text-blue-600"}`}
                    >
                        WASTE MANAGEMENT
                    </Link>
                    {/* <Link
                        to="/about"
                        className={`transition-colors ${currentPage === "about" ? "text-blue-600 font-semibold" : "text-gray-700 hover:text-blue-600"}`}
                    >
                        ABOUT THE TOOL
                    </Link> */}
                </nav>

                {/* Login / Sign Up Buttons */}
                <div className="flex items-center gap-3">
                    <Link to="/login">
                        <Button variant="ghost" size="sm" className="hidden sm:flex items-center gap-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50">

                            Login
                        </Button>
                    </Link>

                    <Link to="/register">
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-md">

                            <span className="hidden sm:inline">Sign Up</span>
                            <span className="sm:hidden">Sign Up</span>
                        </Button>
                    </Link>
                </div>

                {/* Mobile Menu Toggle (Optional – if you have a mobile menu) */}
                {/* <button className="md:hidden">
                    <Menu className="h-6 w-6" />
                </button> */}
            </div>
        </header>
    )
}
