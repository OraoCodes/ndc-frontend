"use client"

import React from "react"

import { AuthLayout } from "@/components/auth-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("")

    const handleSubmit = (e) => {
        e.preventDefault()
        // Handle password reset logic here
        console.log("Password reset requested for:", email)
    }

    return (
        <AuthLayout
            title="Reset Password"
            description="Enter your email below . If your email is in the system, an password reset link will be sent to your email"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
                        Email
                    </label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="Value"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <Button type="submit" className="w-full bg-gray-800 hover:bg-gray-900 text-white py-2 rounded-md font-medium">
                    Reset Password
                </Button>
            </form>
        </AuthLayout>
    )
}
