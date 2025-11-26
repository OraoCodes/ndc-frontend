"use client"

import React, { useState } from 'react'
import { Link } from "react-router-dom"
import { Search, Menu, X } from "lucide-react"
import { Input } from "@/components/ui/input"

const thematicAreasItems = [
    { name: 'Governance', path: '/governance' },
    { name: 'MRV', path: '/mrv' },
    { name: 'Mitigation', path: '/mitigation' },
    { name: 'Adaptation', path: '/adaptation' },
    { name: 'Finance & Technology Transfer', path: '/finance-technology-transfer' },
]

const countiesItems = [
    { name: 'Nairobi', path: '/counties/nairobi' },
    { name: 'Mombasa', path: '/counties/mombasa' },
    { name: 'Kisumu', path: '/counties/kisumu' },
    // Add all 47 counties...
]

export function Header({ currentPage }: { currentPage?: string }) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    return (
        <>
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

                    {/* Desktop Search */}
                    <div className="flex-1 max-w-md hidden lg:block">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search counties, indicators..."
                                className="pl-10 bg-gray-50 border-0 focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex items-center gap-8 text-sm font-medium">
                        <Link to="/" className={`hover:text-blue-600 ${currentPage === "home" ? "text-blue-600 font-bold" : "text-gray-700"}`}>
                            HOME
                        </Link>
                        <Dropdown title="THEMATIC AREAS" items={thematicAreasItems} currentPage={currentPage} />
                        <Dropdown title="COUNTIES" items={countiesItems} currentPage={currentPage} />
                        <Link to="/about-the-tool" className={`hover:text-blue-600 ${currentPage === "about" ? "text-blue-600 font-bold" : "text-gray-700"}`}>
                            ABOUT THE TOOL
                        </Link>
                    </nav>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                        onClick={() => setMobileMenuOpen(false)}
                    />

                    {/* Mobile Menu Panel */}
                    <div className="fixed inset-x-0 top-16 z-50 bg-white border-b border-gray-200 shadow-xl lg:hidden">
                        <div className="px-6 py-6 space-y-6">

                            {/* Mobile Search */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input placeholder="Search..." className="pl-10" />
                            </div>

                            {/* Mobile Links */}
                            <nav className="space-y-4 text-lg font-medium">
                                <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block text-gray-900 hover:text-blue-600">
                                    Home
                                </Link>

                                <MobileDropdown title="Thematic Areas" items={thematicAreasItems} onClose={() => setMobileMenuOpen(false)} />
                                <MobileDropdown title="Counties" items={countiesItems} onClose={() => setMobileMenuOpen(false)} />

                                <Link to="/about-the-tool" onClick={() => setMobileMenuOpen(false)} className="block text-gray-900 hover:text-blue-600">
                                    About the Tool
                                </Link>
                            </nav>
                        </div>
                    </div>
                </>
            )}
        </>
    )
}

// Reusable Desktop Dropdown
function Dropdown({ title, items, currentPage }: { title: string; items: { name: string; path: string }[]; currentPage?: string }) {
    const [open, setOpen] = useState(false)
    const isActive = items.some(i => currentPage?.startsWith(i.path.split('/')[1]))

    return (
        <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
            <button className={`flex items-center gap-1 hover:text-blue-600 ${isActive ? "text-blue-600 font-bold" : "text-gray-700"}`}>
                {title}
                <svg className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {open && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-56 bg-white rounded-lg shadow-xl border border-gray-100 py-2 z-50">
                    {items.map(item => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className="block px-5 py-3 text-sm hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        >
                            {item.name}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}

// Mobile Dropdown (Accordion Style)
function MobileDropdown({ title, items, onClose }: { title: string; items: { name: string; path: string }[]; onClose: () => void }) {
    const [open, setOpen] = useState(false)

    return (
        <div className="border-b border-gray-100 pb-4">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between text-left text-gray-900 hover:text-blue-600"
            >
                {title}
                <svg className={`w-5 h-5 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {open && (
                <div className="mt-3 ml-4 space-y-2">
                    {items.map(item => (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={onClose}
                            className="block py-2 text-gray-700 hover:text-blue-600"
                        >
                            {item.name}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}