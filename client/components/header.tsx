"use client"

import React, { useState } from 'react'; // Import useState
import { Link } from "react-router-dom"
import { Search, LogIn, UserPlus, Menu } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

// --- 1. Dropdown Data Definitions ---

const thematicAreasItems = [
    { name: 'Governance', path: '/governance' },
    { name: 'MRV', path: '/mrv' },
    { name: 'Mitigation', path: '/mitigation' },
    { name: 'Adaptation', path: '/adaptation' },
    { name: 'Finance & Technology Transfer', path: '/finance-technology-transfer' },
    // Add more thematic areas here if needed
];

const countiesItems = [
    { name: 'Nairobi', path: '/counties/nairobi' },
    { name: 'Mombasa', path: '/counties/mombasa' },
    { name: 'Kisumu', path: '/counties/kisumu' },
    // Add all 47 counties here
];


// --- 2. Dropdown Nav Item Component ---

interface DropdownItem {
    name: string;
    path: string;
}

interface DropdownNavItemProps {
    title: string;
    items: DropdownItem[];
    currentPage?: string;
}

const DropdownNavItem: React.FC<DropdownNavItemProps> = ({ title, items, currentPage }) => {
    const [isOpen, setIsOpen] = useState(false);

    // Check if the current page path includes any of the dropdown item paths
    // This allows the parent link to stay highlighted when on a sub-page (e.g., /counties/nairobi)
    const isActive = items.some(item => currentPage?.startsWith(item.path));

    // Determine the base class for the main link
    const baseClass = `transition-colors text-gray-700 hover:text-blue-600 flex items-center h-full`;
    // Determine the active class for the main link
    const activeClass = isActive || (currentPage === title.toLowerCase().replace(' ', '-'))
        ? "text-blue-600 font-semibold"
        : "";

    return (
        <div
            className="relative flex items-center h-full"
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
        >
            {/* The main link/trigger */}
            <span
                className={`${baseClass} ${activeClass} cursor-pointer select-none`}
                onClick={() => setIsOpen(!isOpen)} // Optional: click to toggle on touch devices
            >
                {title}
                {/* Dropdown Chevron Icon */}
                <svg
                    className={`ml-1 w-3 h-3 transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path>
                </svg>
            </span>

            {/* Dropdown Menu Container */}
            {isOpen && (
                <div
                    className="absolute top-full left-0 mt-2 min-w-[12rem] bg-white rounded-md shadow-lg py-1 z-10 border border-gray-100 whitespace-nowrap"
                    role="menu"
                >
                    {items.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setIsOpen(false)} // Close dropdown on item click
                            className={`block px-4 py-2 text-sm transition-colors ${currentPage === item.path
                                ? "bg-blue-50 text-blue-600 font-medium"
                                : "text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                                }`}
                            role="menuitem"
                        >
                            {item.name}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};


// --- 3. Updated Header Component ---

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
                <div className="flex-1 max-w-md hidden lg:flex">
                    <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search counties, reports..."
                            className="pl-10 bg-gray-50 border-0 focus:ring-2 focus:ring-blue-500 text-gray-800"
                        />
                    </div>
                </div>

                {/* Navigation Links */}
                <nav className="hidden md:flex items-center gap-6 text-sm font-small h-8">
                    <Link
                        to="/"
                        className={`transition-colors ${currentPage === "home" ? "text-blue-600 font-semibold" : "text-gray-700 hover:text-blue-600"}`}
                    >
                        HOME
                    </Link>

                    {/* Thematic Areas Dropdown */}
                    <DropdownNavItem
                        title="THEMATIC AREAS"
                        items={thematicAreasItems}
                        currentPage={currentPage}
                    />

                    {/* Counties Dropdown */}
                    <DropdownNavItem
                        title="COUNTIES"
                        items={countiesItems}
                        currentPage={currentPage}
                    />

                    {/* The existing links for Water and Waste Management were moved into the 'Thematic Areas' dropdown, 
                        but I've kept them here as standalone for now, in case you wanted them both ways. */}
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
                    <Link
                        to="/about"
                        className={`transition-colors ${currentPage === "about" ? "text-blue-600 font-semibold" : "text-gray-700 hover:text-blue-600"}`}
                    >
                        ABOUT THE TOOL
                    </Link>
                </nav>

                {/* Login / Sign Up Buttons (Removed for brevity, as per your snippet) */}

                {/* Mobile Menu Toggle (Optional – if you have a mobile menu) */}
                <button className="md:hidden">
                    <Menu className="h-6 w-6" />
                </button>
            </div>
        </header>
    )
}
