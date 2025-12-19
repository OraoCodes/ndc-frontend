"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function TermsAndConditionsPage() {
    return (
        <main className="min-h-screen bg-gray-50">
            <Header currentPage="terms" />
            
            <div className="max-w-4xl mx-auto px-4 md:px-6 py-12 md:py-16">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 md:p-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        Terms and Conditions
                    </h1>
                    <p className="text-lg text-gray-600 mb-8">
                        for the NDC County Data Portal
                    </p>
                    <p className="text-sm text-gray-500 mb-12 border-b border-gray-200 pb-6">
                        Last updated: December 2025
                    </p>

                    <div className="prose prose-lg max-w-none">
                        <p className="text-gray-700 mb-8 leading-relaxed">
                            Welcome to the NDC County Data Portal ("the Portal"). By registering for an account, logging in, uploading data, or using any part of this system, you ("the User") agree to be bound by the following Terms and Conditions. Please read them carefully before proceeding.
                        </p>

                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">1. Definitions</h2>
                            <ul className="list-disc pl-6 space-y-2 text-gray-700">
                                <li><strong>"Portal"</strong> refers to the NDC County Data Platform, its interfaces, databases, tools, and services.</li>
                                <li><strong>"User"</strong> refers to any individual or institution creating an account, submitting data, or accessing the Portal.</li>
                                <li><strong>"Administrators / Developers"</strong> refers to the system owners, designers, technical teams, and authorized personnel responsible for managing the Portal.</li>
                                <li><strong>"Data"</strong> includes any information users upload, submit, generate, or store within the Portal.</li>
                            </ul>
                        </section>

                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">2. Acceptance of Terms</h2>
                            <p className="text-gray-700 mb-4 leading-relaxed">
                                By accessing or using the Portal, you confirm that you:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                                <li>Have read and understood these Terms.</li>
                                <li>Agree to comply with all applicable laws and institutional policies.</li>
                                <li>Are authorized by your county, institution, or employer to submit data to this Portal.</li>
                            </ul>
                            <p className="text-gray-700 leading-relaxed">
                                If you do not agree to these Terms, you must not use the Portal.
                            </p>
                        </section>

                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">3. Purpose of the Portal</h2>
                            <p className="text-gray-700 mb-4 leading-relaxed">
                                The Portal is designed exclusively for:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-gray-700">
                                <li>Collecting, validating, and reporting climate-related county data</li>
                                <li>Supporting national NDC tracking, reporting, and transparency mechanisms</li>
                                <li>Facilitating structured Monitoring, Reporting, and Verification (MRV)</li>
                            </ul>
                            <p className="text-gray-700 mt-4 leading-relaxed">
                                It may not be used for any purpose outside its intended mandate.
                            </p>
                        </section>

                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">4. User Responsibilities</h2>
                            <p className="text-gray-700 mb-4 leading-relaxed">
                                Users agree to:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                                <li>Provide accurate, complete, and verifiable data.</li>
                                <li>Use the Portal only for official county or institutional work.</li>
                                <li>Maintain the confidentiality of their login credentials.</li>
                                <li>Report any unauthorized access or suspected breach immediately.</li>
                                <li>Ensure that uploaded data does not violate any copyright, confidentiality agreements, or legal restrictions.</li>
                                <li>Comply with data protection and privacy requirements when handling personal or sensitive data.</li>
                            </ul>
                            <p className="text-gray-700 leading-relaxed">
                                Users are fully responsible for any activity conducted under their account.
                            </p>
                        </section>

                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">5. Data Submission and Ownership</h2>
                            <ul className="list-disc pl-6 space-y-2 text-gray-700">
                                <li>Data submitted to the Portal remains the property of the respective county or institution that generated it.</li>
                                <li>By submitting data, users grant the Portal Administrators a non-exclusive, royalty-free license to use, store, process, and analyze the data for national climate reporting and research purposes.</li>
                                <li>The Portal Administrators may aggregate or anonymize data for national-level reporting, policy development, or system analytics.</li>
                                <li>The Portal Administrators do not claim ownership of county-generated data.</li>
                            </ul>
                        </section>

                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">6. Data Accuracy and Liability</h2>
                            <ul className="list-disc pl-6 space-y-2 text-gray-700">
                                <li>Users are solely responsible for ensuring the accuracy and reliability of the data they upload.</li>
                                <li>The Portal Administrators do not guarantee the accuracy, completeness, or validity of any submitted data.</li>
                                <li>The Portal Administrators shall not be liable for any damages, decisions, or actions taken based on data submitted by users.</li>
                            </ul>
                        </section>

                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">7. Privacy and Data Protection</h2>
                            <p className="text-gray-700 mb-4 leading-relaxed">
                                The Portal adheres to recognized privacy and data protection principles, including:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                                <li>Lawfulness, fairness, and transparency</li>
                                <li>Purpose limitation</li>
                                <li>Data minimization</li>
                                <li>Accuracy</li>
                                <li>Storage limitation</li>
                                <li>Integrity and confidentiality</li>
                            </ul>
                            <p className="text-gray-700 mb-4 leading-relaxed">
                                The Portal may collect limited metadata such as:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                                <li>Login timestamps</li>
                                <li>IP addresses</li>
                                <li>System activity logs</li>
                                <li>User actions within the Portal</li>
                            </ul>
                            <p className="text-gray-700 mb-4 leading-relaxed">
                                This information is used solely for security, audit trails, and system improvements.
                            </p>
                            <p className="text-gray-700 mb-4 leading-relaxed">
                                The Portal Administrators will not:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                                <li>Sell user data</li>
                                <li>Share personal information with unauthorized third parties</li>
                                <li>Use data for advertising or commercial profiling</li>
                            </ul>
                            <p className="text-gray-700 leading-relaxed">
                                For more details, refer to the Portal's Privacy Policy.
                            </p>
                        </section>

                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">8. Security Measures</h2>
                            <p className="text-gray-700 mb-4 leading-relaxed">
                                The Portal uses reasonable technical and organizational security measures to protect data, including:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                                <li>Authentication and access controls</li>
                                <li>Encryption where applicable</li>
                                <li>Audit logs</li>
                                <li>Regular system updates and monitoring</li>
                            </ul>
                            <p className="text-gray-700 mb-4 leading-relaxed">
                                However, no system is completely secure. Users accept that:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-gray-700">
                                <li>The Portal Administrators cannot guarantee absolute protection against cyber threats</li>
                                <li>They are not liable for breaches caused by factors beyond their control (e.g., user negligence, force majeure events, or third-party attacks)</li>
                            </ul>
                        </section>

                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">9. Acceptable Use Policy</h2>
                            <p className="text-gray-700 mb-4 leading-relaxed">
                                Users must NOT:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                                <li>Attempt to hack, disable, or disrupt the Portal</li>
                                <li>Introduce malware or harmful code</li>
                                <li>Misrepresent data or impersonate other users</li>
                                <li>Use the Portal for political, commercial, or personal activities</li>
                                <li>Share restricted information without authorization</li>
                                <li>Upload false, misleading, or fraudulent information</li>
                            </ul>
                            <p className="text-gray-700 leading-relaxed">
                                Violation of these conditions may result in account suspension, data removal, or legal action.
                            </p>
                        </section>

                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">10. Intellectual Property</h2>
                            <p className="text-gray-700 mb-4 leading-relaxed">
                                All Portal content, including:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                                <li>Software</li>
                                <li>Design elements</li>
                                <li>Analytics dashboards</li>
                                <li>User interface components</li>
                                <li>Documentation</li>
                            </ul>
                            <p className="text-gray-700 leading-relaxed">
                                …is the intellectual property of the Portal Administrators or its licensed partners.
                            </p>
                            <p className="text-gray-700 mt-4 leading-relaxed">
                                Users may not copy, reproduce, distribute, or modify Portal content without prior written consent.
                            </p>
                        </section>

                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">11. System Availability</h2>
                            <p className="text-gray-700 mb-4 leading-relaxed">
                                The Portal is provided "as is" and "as available", without guarantees of uninterrupted service.
                            </p>
                            <p className="text-gray-700 mb-4 leading-relaxed">
                                Maintenance, updates, or technical faults may cause temporary downtime.
                            </p>
                            <p className="text-gray-700 mb-4 leading-relaxed">
                                The Portal Administrators are not liable for:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-gray-700">
                                <li>Losses caused by system downtime</li>
                                <li>Inability to access or submit data</li>
                                <li>Technical failures or data transmission errors</li>
                            </ul>
                        </section>

                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">12. Limitation of Liability</h2>
                            <p className="text-gray-700 mb-4 leading-relaxed">
                                To the maximum extent permitted by law, the Portal Administrators:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-gray-700">
                                <li>Are not responsible for direct, indirect, incidental, or consequential damages</li>
                                <li>Are not liable for errors, omissions, or delays in system performance</li>
                                <li>Are not liable for actions taken based on system outputs or reported data</li>
                                <li>Are not liable for any unauthorized access beyond their reasonable control</li>
                            </ul>
                        </section>

                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">13. Termination of Access</h2>
                            <p className="text-gray-700 mb-4 leading-relaxed">
                                The Portal Administrators may suspend or terminate a user's access if:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                                <li>These Terms are violated</li>
                                <li>Invalid or fraudulent data is submitted</li>
                                <li>Unauthorized access is detected</li>
                                <li>Misuse or system abuse is identified</li>
                            </ul>
                            <p className="text-gray-700 leading-relaxed">
                                Counties or institutions may request account deletion in writing.
                            </p>
                        </section>

                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">14. Amendments</h2>
                            <ul className="list-disc pl-6 space-y-2 text-gray-700">
                                <li>These Terms may be updated periodically.</li>
                                <li>Users will be notified of significant updates via the Portal dashboard or email.</li>
                                <li>Continued use of the Portal after updates constitutes acceptance of the new Terms.</li>
                            </ul>
                        </section>

                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">15. Governing Law</h2>
                            <p className="text-gray-700 mb-4 leading-relaxed">
                                These Terms shall be governed by and interpreted in accordance with:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                                <li>Applicable national laws in Kenya</li>
                                <li>Relevant data protection statutes</li>
                                <li>Public sector ICT regulations</li>
                            </ul>
                            <p className="text-gray-700 leading-relaxed">
                                Any disputes shall be resolved through the appropriate administrative or legal frameworks.
                            </p>
                        </section>
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    )
}

