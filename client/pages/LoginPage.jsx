"use client"

import React from "react"

import { AuthLayout } from "@/components/auth-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Link } from "react-router-dom"
import { useState } from "react"

export default function LoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const handleSubmit = (e) => {
        e.preventDefault()
        // Handle login logic here
        console.log("Login attempt:", { email, password })
    }

    return (
        <AuthLayout title="Login" description="Please log in to your account to add data to the NDC tool">
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

                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-900 mb-2">
                        Password
                    </label>
                    <Input
                        id="password"
                        type="password"
                        placeholder="Value"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                <Button size="sm" className="w-full bg-gray-800 hover:bg-gray-900 text-white py-2 rounded-md font-medium">
                    Sign In
                </Button>
                {/* <Button size="default" className="bg-primary hover:bg-blue-700 text-white font-medium shadow-md">

                    <span className="hidden sm:inline">Sign Up</span>
                    <span className="sm:hidden">Sign Up</span>
                </Button> */}
            </form>

            <div className="mt-6">
                <Link href="/reset-password" className="text-gray-900 font-medium underline hover:no-underline">
                    Forgot password?
                </Link>
            </div>
        </AuthLayout>
    )
}
