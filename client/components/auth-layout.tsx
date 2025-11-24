import type React from "react"

const partners = [
    "/PACJA.png",
    "/Friedrich.png",
    "/Civil Society.png",
    "/SCEJU.png",
    "/EU.png"
];

export function AuthLayout({
    children,
    title,
    description,
}: { children: React.ReactNode; title: string; description: string }) {
    return (
        <div className="min-h-screen flex">
            {/* Left Side - Water Background */}
            <div
                className="hidden lg:flex lg:w-1/2 bg-cover bg-center relative flex-col justify-between p-12"
                style={{ backgroundImage: "url(/background.png)", backgroundPosition: "center" }}
            >
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="relative z-10">
                    <h1 className="text-4xl font-bold text-white leading-tight">
                        NDC tracking tool for water and waste management in Kenya
                    </h1>
                </div>

                {/* Partners Section */}
                <div>
                    <p className="text-xl mb-2 opacity-90 text-white font-medium">Partners</p>
                    <div className="flex flex-wrap gap-6 items-center">
                        {partners.map((logo, i) => (
                            <img key={i} src={logo} alt="Partner logo" className="h-16 lg:h-14 object-contain" />
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 p-8">
                <div className="w-full max-w-md">
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">{title}</h2>
                    <p className="text-gray-600 mb-8">{description}</p>
                    {children}
                </div>
            </div>
        </div>
    )
}
