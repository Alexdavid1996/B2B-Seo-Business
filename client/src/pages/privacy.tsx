import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Footer from "@/components/layout/footer";
import { useQuery } from "@tanstack/react-query";
import { useSEOPage } from "@/hooks/use-seo";

export default function PrivacyPage() {
  // SEO for privacy page
  useSEOPage('privacy');
  
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
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">
            Privacy Policy
          </h1>

          <div className="prose prose-gray max-w-none">
            <p className="text-gray-600 mb-6">
              <strong>Last Updated:</strong> August 3, 2025
            </p>

            <section className="mb-6 sm:mb-8">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
                1. Information We Collect
              </h2>
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-4">
                This is a demo environment. All features are active, data may reset. Demo login: demo@demo.com - demo123
              </p>
              <ul className="list-disc pl-4 sm:pl-6 text-sm sm:text-base text-gray-700 space-y-2">
                <li>Email address (for account creation and communication)</li>
                <li>First and last name</li>
                <li>Any additional details you approve when requested</li>
              </ul>
            </section>

            <section className="mb-6 sm:mb-8">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
                2. How We Use Your Information
              </h2>
              <ul className="list-disc pl-4 sm:pl-6 text-sm sm:text-base text-gray-700 space-y-2">
                <li>To provide and maintain our service</li>
                <li>
                  To contact you regarding your account or platform activity
                </li>
                <li>To verify ownership or eligibility for certain features</li>
                <li>To send important service notifications</li>
                <li>To improve the platform and user experience</li>
              </ul>
            </section>

            <section className="mb-6 sm:mb-8">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
                3. Information Sharing
              </h2>
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-4">
                We do not sell, trade, or otherwise transfer your personal
                information to third parties except as described in this policy:
              </p>
              <ul className="list-disc pl-4 sm:pl-6 text-sm sm:text-base text-gray-700 space-y-2">
                <li>With your consent or at your direction</li>
                <li>To comply with legal obligations</li>
                <li>To protect our rights and prevent fraud</li>
                <li>With service providers who assist in our operations</li>
              </ul>
            </section>

            <section className="mb-6 sm:mb-8">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
                4. Data Security
              </h2>
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                We implement appropriate security measures to protect your
                personal information against unauthorized access, alteration,
                disclosure, or destruction. However, no method of transmission
                over the internet is 100% secure.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                5. Data Retention
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We retain your information for as long as your account is active
                or as needed to provide services. Certain information may be
                retained for legal or security purposes.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                6. Cookies and Tracking
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We use cookies and similar technologies to maintain your session
                and enhance your experience. You can control cookie settings
                through your browser preferences.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                7. Your Rights
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Depending on your location, you may have certain rights
                regarding your personal information:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Right to access your personal information</li>
                <li>Right to correct inaccurate information</li>
                <li>Right to delete your information</li>
                <li>
                  Right to refuse providing additional requested information
                </li>
                <li>Right to object to processing</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                8. Third-Party Services
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Our service may contain links to third-party websites or
                integrate with third-party services. We are not responsible for
                the privacy practices of these external services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                9. Children's Privacy
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Our service is not intended for children under 13 years of age.
                We do not knowingly collect personal information from children
                under 13.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                10. Changes to This Policy
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We may update this privacy policy from time to time. We will
                notify you of any material changes by posting the new policy on
                this page and updating the "Last Updated" date.
              </p>
            </section>

            <section className="mb-6 sm:mb-8">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
                11. Contact Us
              </h2>
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                If you have any questions about this Privacy Policy, please
                contact us through our contact page or support system.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
