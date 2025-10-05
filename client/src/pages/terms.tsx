import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Footer from "@/components/layout/footer";
import { useQuery } from "@tanstack/react-query";
import { useSEOPage } from "@/hooks/use-seo";

export default function TermsPage() {
  // SEO for terms page
  useSEOPage('terms');
  
  // Fetch platform settings
  const { data: settings } = useQuery({
    queryKey: ["/api/settings/public"],
    enabled: true,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <h1 className="text-xl sm:text-2xl font-bold text-primary">
                {settings?.platformName || "CollabPro"}
              </h1>
            </div>

            <div className="flex items-center space-x-3">
              <Link href="/auth">
                <Button variant="ghost" size="sm">
                  Login
                </Button>
              </Link>
              <Link href="/auth">
                <Button size="sm">Sign Up</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Terms of Service
          </h1>

          <div className="prose prose-gray max-w-none">
            <p className="text-gray-600 mb-6">
              <strong>Last Updated:</strong> August 8, 2025
            </p>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                1. Acceptance of Terms
              </h2>
              <p className="text-gray-700 leading-relaxed">
                By accessing and using {settings?.platformName || "Outmarkly"}{" "}
                ("the Platform"), you agree to comply with and be bound by these
                Terms of Service and any related policies. If you do not agree
                with these terms, you must discontinue using the Platform
                immediately.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                2. Description of Service
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {settings?.platformName || "Outmarkly"} is a platform that
                facilitates link collaborations (reciprocal and non-reciprocal)
                and guest post opportunities between website owners. Users can
                register domains, list opportunities, search for potential
                partners, and manage transactions through our integrated wallet
                system.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                3. User Responsibilities
              </h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>
                  Provide accurate and truthful information when registering and
                  listing domains
                </li>
                <li>
                  Maintain the confidentiality and security of your account
                  credentials
                </li>
                <li>
                  Ensure you own or are authorized to list the domains you
                  submit
                </li>
                <li>Comply with all applicable laws and regulations</li>
                <li>
                  Refrain from spam, fraudulent activity, or abusive behavior
                  towards other users
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                4. Domain Verification
              </h2>
              <p className="text-gray-700 leading-relaxed">
                All domains listed on the Platform are subject to verification.
                We reserve the right to approve, reject, or remove domain
                listings that do not meet our quality standards or violate these
                Terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                5. Wallet, Top-ups, and Withdrawals
              </h2>
              <p className="text-gray-700 leading-relaxed">
                The Platform provides an internal wallet for handling payments
                related to guest post transactions only. Link collaborations
                between users are free and do not require any payment through
                the Platform. Top-ups for guest post payments are processed via
                supported payment methods and are usually available immediately
                after confirmation. Withdrawals from your wallet are typically
                completed within a few minutes but may take up to 24 hours. It
                is the user’s responsibility to ensure payment details are
                correct, as transactions cannot be reversed. Any applicable
                platform fees are shown before each transaction and deducted
                automatically.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                6. Prohibited Activities
              </h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Submitting false or misleading information</li>
                <li>
                  Attempting to bypass or manipulate verification processes
                </li>
                <li>
                  Engaging in illegal, fraudulent, or unauthorized transactions
                </li>
                <li>Harassment or abuse of other users</li>
                <li>Distribution of spam, malware, or harmful content</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                7. Limitation of Liability
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {settings?.platformName || "Outmarkly"} is not liable for any
                indirect, incidental, or consequential damages, including but
                not limited to loss of profits, revenue, or data, arising from
                your use of the Platform.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                8. Support and Dispute Policy
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {settings?.platformName || "Outmarkly"} Team is available to
                assist with any issues related to guest post orders or
                collaboration requests while the transaction remains active. A
                transaction is considered active until it is marked as completed
                by the parties involved. Once a transaction is marked as
                completed, it is considered closed and we will no longer be able
                to intervene or provide dispute resolution. Users are encouraged
                to communicate and resolve any concerns before marking a
                transaction as completed.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                9. Termination
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to suspend or terminate accounts at our
                discretion if a user violates these Terms or engages in
                activities that may harm the integrity of the Platform. Users
                may also request account closure through our support system.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                10. Changes to Terms
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We may update or modify these Terms at any time. Significant
                changes will be communicated to users, and continued use of the
                Platform after changes take effect constitutes acceptance of the
                updated Terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                11. Contact Information
              </h2>
              <p className="text-gray-700 leading-relaxed">
                If you have any questions or concerns about these Terms of
                Service, please contact us through our support system or via the
                contact page on the Platform.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
