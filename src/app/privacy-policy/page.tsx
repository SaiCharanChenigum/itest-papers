export const metadata = {
    title: "Privacy Policy | iTestPapers",
    description: "Learn how iTestPapers handles and protects your data.",
};

export default function PrivacyPolicyPage() {
    return (
        <main className="min-h-screen bg-background">
            {/* Header */}
            <section className="bg-accent/30 py-16 md:py-24 border-b border-border">
                <div className="container-main px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
                    <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">Privacy Policy</h1>
                    <p className="text-muted-foreground">Last Updated: March 2026</p>
                </div>
            </section>

            {/* Content */}
            <section className="py-12 md:py-20">
                <div className="container-main px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-12">

                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold text-foreground">1. Introduction</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Welcome to iTestPapers. We respect your privacy and are committed to protecting your personal data.
                            This privacy policy explaining how we collect, use, and safeguard your information when you visit our website and use our educational services.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold text-foreground">2. Information We Collect</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            We collect personal and non-personal data necessary to provide and improve our services:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
                            <li><strong>User Account Data:</strong> Name, email address, phone number, and password used during registration.</li>
                            <li><strong>Student Data:</strong> Current class (e.g., Class 9 or 10) to tailor educational content and test papers.</li>
                            <li><strong>Transaction Details:</strong> Amount, order ID, payment method preference, and delivery address for physical goods.</li>
                            <li><strong>Usage Data:</strong> Information about your interaction with our notes, test papers, and website analytics.</li>
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold text-foreground">3. Payment Processing (Razorpay)</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            When you make a payment on our website, your payment is processed securely through our third-party payment gateway provider, <strong>Razorpay</strong>.
                            We do not store your credit/debit card, bank account, or UPI details on our servers.
                        </p>
                        <p className="text-muted-foreground leading-relaxed">
                            To successfully process payments, we may share limited user information such as your name, email address, phone number, and order details directly with Razorpay.
                            This information is handled directly by Razorpay and is governed by their privacy policy and secure protocols.
                        </p>
                        <p className="text-muted-foreground leading-relaxed">
                            All payment transactions are encrypted and securely processed through Razorpay’s secure payment infrastructure.
                            By making a payment on our website, you agree to the processing of your payment information by Razorpay in accordance with their privacy policy.
                        </p>
                        <p className="pt-2">
                            <a
                                href="https://razorpay.com/privacy/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary font-medium hover:underline"
                            >
                                Read Razorpay's Privacy Policy
                            </a>
                        </p>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold text-foreground">4. Refunds and Transaction Data</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            We store transaction records provided by Razorpay (order IDs, payment status, subscription status) for internal accounting, eligible refunds, and customer support purposes.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold text-foreground">5. Data Security</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            We implement appropriate technical and organizational measures to safeguard your personal data against unauthorized access or loss.
                        </p>
                    </div>

                    <div className="space-y-4 border-t border-border pt-12">
                        <h2 className="text-xl font-bold text-foreground">Contact Us</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            If you have any questions or concerns about this privacy policy, please reach out via our <a href="/contact" className="text-primary hover:underline">Contact Us</a> page or email us directly at itestpapers.support@gmail.com.
                        </p>
                    </div>
                </div>
            </section>
        </main>
    );
}
