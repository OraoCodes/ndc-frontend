"use client"

import { useQuery } from "@tanstack/react-query"
import { listThematicAreas, type ThematicArea } from "@/lib/supabase-api"
import { useMemo } from "react"
import { Link } from "react-router-dom"

// Helper function to convert thematic area name to URL-friendly slug
const getThematicAreaSlug = (areaName: string): string => {
    return areaName
        .toLowerCase()
        .replace(/&/g, 'and')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

export function Footer() {
    // Use React Query for thematic areas to automatically refetch when they change
    const { data: thematicAreasData = [] } = useQuery<ThematicArea[]>({
        queryKey: ["thematicAreas"],
        queryFn: listThematicAreas,
        staleTime: 2 * 60 * 1000, // 2 minutes
    })

    // Deduplicate and sort thematic areas
    const thematicAreas = useMemo(() => {
        const uniqueAreas = Array.from(
            new Map(thematicAreasData.map(area => [area.name, area])).values()
        )
        return uniqueAreas.sort((a, b) => a.name.localeCompare(b.name))
    }, [thematicAreasData])

    return (
        <footer className="bg-[#0B1138] text-slate-100 pt-12">
            <div className="max-w-7xl mx-auto px-4 md:px-6">
                <div>
                    <h3 className="font-semibold mb-6 text-white">NDC tracking tool for water and waste management in Kenya</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
                    {/* Brand */}

                    <div >
                        <h4 className="font-semibold mb-6 text-white uppercase text-sm">ABOUT</h4>
                        <ul className="space-y-3 text-sm">
                            <li>
                                <Link to="/about-the-tool" className="hover:text-white transition-colors">
                                    About the tool
                                </Link>
                            </li>
                            <li>
                                <Link to="/terms-and-conditions" className="hover:text-white transition-colors">
                                    Terms and Conditions
                                </Link>
                            </li>
                           {/* <li>
                                <a href="#" className="hover:text-white transition-colors">
                                    Partners
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-white transition-colors">
                                    FAQs
                                </a>
                            </li> */}
                        </ul>
                    </div>
                    {/* Thematic Areas */}
                    <div>
                        <h4 className="font-semibold mb-6 text-white uppercase text-sm">Thematic Areas</h4>
                        <ul className="space-y-3 text-sm">
                            {thematicAreas.length > 0 ? (
                                thematicAreas.map(area => (
                                    <li key={area.name}>
                                        <Link 
                                            to={`/${getThematicAreaSlug(area.name)}`} 
                                            className="hover:text-white transition-colors"
                                        >
                                            {area.name}
                                        </Link>
                                    </li>
                                ))
                            ) : (
                                <li className="text-slate-400 text-xs">Loading thematic areas...</li>
                            )}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="font-semibold mb-6 text-white uppercase text-sm">Contact Us</h4>
                        <ul className="space-y-3 text-sm">
                            <li>
                                <a href="mailto:info@email.com" className="hover:text-white transition-colors">
                                    info@email.com
                                </a>
                            </li>
                            <li>
                                <a href="tel:+254254256255" className="hover:text-white transition-colors">
                                    +254 254 256 255
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom */}

            </div>
            <div className="bg-[#0A0D20] w-full  h-12 mx-auto px-4 md:px-6">
                <p className="text-sm text-slate-400">Copyright © 2025. All Rights Reserved.</p>

            </div>
        </footer>
    )
}
