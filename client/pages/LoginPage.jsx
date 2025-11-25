"use client"

import React, { useState } from "react"
import { AuthLayout } from "@/components/auth-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Link, useNavigate } from "react-router-dom"
import { api } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"

export default function LoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const navigate = useNavigate();
    const { toast } = useToast();

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const response = await api.login({ email, password });
            console.log("Login successful:", response);
            localStorage.setItem("token", response.token); // Store the JWT token
            toast({
                title: "Login Successful!",
                description: "You have successfully logged in.",
                variant: "success",
            });
            navigate("/dashboard"); // Redirect to dashboard or appropriate page
        } catch (error) {
            console.error("Login failed:", error);
            toast({
                title: "Login Failed",
                description: error.message || "An error occurred during login.",
                variant: "destructive",
            });
        }
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
            </form>

            <div className="mt-6">
                <Link to="/reset-password" className="text-gray-900 font-medium underline hover:no-underline">
                    Forgot password?
                </Link>
            </div>
        </AuthLayout>
    )
}
