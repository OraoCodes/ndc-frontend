"use client"

import React from "react"

import { AuthLayout } from "@/components/auth-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"

export default function SignupPage() {
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        organisation: "",
        phoneNumber: "",
        position: "",
        password: "",
        termsAgreed: false,
    })

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        // Handle signup logic here
        console.log("Signup attempt:", formData)
    }

    return (
        <AuthLayout title="Create an Account" description="Please create an account to add data to the NDC tool">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-900 mb-2">
                        Full Name
                    </label>
                    <Input
                        id="fullName"
                        name="fullName"
                        type="text"
                        placeholder="Value"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
                        Email
                    </label>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Value"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="organisation" className="block text-sm font-medium text-gray-900 mb-2">
                        Organisation
                    </label>
                    <Input
                        id="organisation"
                        name="organisation"
                        type="text"
                        placeholder="Value"
                        value={formData.organisation}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-900 mb-2">
                        Phone Number
                    </label>
                    <Input
                        id="phoneNumber"
                        name="phoneNumber"
                        type="tel"
                        placeholder="Value"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="position" className="block text-sm font-medium text-gray-900 mb-2">
                        Position
                    </label>
                    <Input
                        id="position"
                        name="position"
                        type="text"
                        placeholder="Value"
                        value={formData.position}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-900 mb-2">
                        Password
                    </label>
                    <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="Value"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="flex items-center gap-2">
                    <input
                        id="terms"
                        name="termsAgreed"
                        type="checkbox"
                        checked={formData.termsAgreed}
                        onChange={handleChange}
                        required
                        className="w-4 h-4 accent-gray-900"
                    />
                    <label htmlFor="terms" className="text-sm text-gray-900">
                        I agree to the{" "}
                        <a href="#" className="underline hover:no-underline">
                            Terms & Conditions
                        </a>
                    </label>
                </div>

                <Button
                    size="default"
                    className="w-full bg-gray-800 hover:bg-gray-900 text-white py-2 rounded-md font-medium mt-6"
                >
                    Create Account
                </Button>

            </form>
        </AuthLayout>
    )
}
