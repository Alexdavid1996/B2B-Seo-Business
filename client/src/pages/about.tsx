import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Footer from "@/components/layout/footer";
import { useSEOPage } from "@/hooks/use-seo";

export default function AboutPage() {
  // SEO for about page
  useSEOPage('about');
  
  // Fetch platform settings
  const { data: settings } = useQuery<{ platformName?: string }>({
    queryKey: ["/api/settings/public"],
    enabled: true,
  });

  return (
    <div className="min-h-screen bg-white">
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

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-lg max-w-none">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">
            About {settings?.platformName || "CollabPro"}
          </h1>

          <div className="text-xl text-gray-600 mb-8">
            Founded in 2025, {settings?.platformName || "CollabPro"} is the
            premier platform connecting website owners, authors, and
            contributors for authentic link building and guest posting
            opportunities across the globe.
          </div>

          <div className="space-y-6 text-gray-700">
            <p>
              Our vision is to make it simple for webmasters, authors, and
              contributors to collaborate beyond borders. Whether you manage a
              small blog or a large online publication, our goal is to connect
              you with the right partners, making collaboration faster, safer,
              and more effective.
            </p>

            <p>
              {settings?.platformName || "CollabPro"} was created with the
              mission to revolutionize how websites grow their authority and
              reach. We provide a trusted environment where verified site owners
              can connect, collaborate, and create lasting partnerships through
              link exchanges and guest post opportunities.
            </p>

            <p>
              We remove the uncertainty of traditional link building by ensuring
              that all participants are legitimate domain owners. From organic
              link swaps to purchasing high-quality guest posts, our platform
              offers the tools, security, and transparency you need.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              Our Mission
            </h2>
            <p>
              To create the most transparent, secure, and effective platform for
              building online authority through authentic collaborations,
              helping our members form genuine connections that benefit both
              sides.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              Why Choose Us
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Founded in 2025 with a global collaboration vision</li>
              <li>Verified site owners and domains</li>
              <li>Secure payment processing for guest posts</li>
              <li>Built-in communication tools</li>
              <li>Quality control and approval process</li>
              <li>Transparent pricing and policies</li>
            </ul>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
