"use client"

import { ChevronDown } from "lucide-react"
import { useState } from "react"

interface Indicator {
    no: number
    indicator: string
    description: string
    score: number
}

interface IndicatorSectionProps {
    title: string
    indicators: Indicator[]
    defaultOpen?: boolean
}

export function IndicatorSection({ title, indicators, defaultOpen = false }: IndicatorSectionProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen)

    return (
        <div className="border border-gray-300 rounded-lg mb-4">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
                <span className="font-medium text-gray-900">{title}</span>
                <ChevronDown className={`w-5 h-5 text-gray-600 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {isOpen && (
                <div className="border-t border-gray-300 p-4 bg-gray-50">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-300">
                                    <th className="text-left py-3 px-2 font-medium text-gray-900">No.</th>
                                    <th className="text-left py-3 px-2 font-medium text-gray-900">Indicator</th>
                                    <th className="text-left py-3 px-2 font-medium text-gray-900">Description</th>
                                    <th className="text-left py-3 px-2 font-medium text-gray-900">Score</th>
                                </tr>
                            </thead>
                            <tbody>
                                {indicators.map((indicator) => (
                                    <tr key={indicator.no} className="border-b border-gray-200 hover:bg-white transition-colors">
                                        <td className="py-3 px-2 text-gray-700">{indicator.no}</td>
                                        <td className="py-3 px-2 text-gray-900 font-medium">{indicator.indicator}</td>
                                        <td className="py-3 px-2 text-gray-600 max-w-md">{indicator.description}</td>
                                        <td className="py-3 px-2">
                                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-500 text-white text-xs font-bold">
                                                ✓
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}
