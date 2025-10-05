import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { ArrowLeft, Mail, MessageSquare } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Footer from "@/components/layout/footer";
import { useSEOPage } from "@/hooks/use-seo";

export default function ContactPage() {
  // SEO for contact page
  useSEOPage('contact');
  
  // Fetch platform settings
  const { data: settings } = useQuery<{ platformName?: string }>({
    queryKey: ['/api/settings/public'],
    enabled: true
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
              <h1 className="text-xl sm:text-2xl font-bold text-primary">{settings?.platformName || 'CollabPro'}</h1>
            </div>
            
            <div className="flex items-center space-x-3">
              <Link href="/auth">
                <Button variant="ghost" size="sm">
                  Login
                </Button>
              </Link>
              <Link href="/auth">
                <Button size="sm">
                  Sign Up
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Contact Us</h1>
          <p className="text-lg sm:text-xl text-gray-600">Get in touch with the {settings?.platformName || 'CollabPro'} team</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          <Card className="border border-gray-200">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-xl">Email Support</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-4">
                Send us an email and we'll get back to you within 24 hours.
              </p>
              <a 
                href="mailto:domainexchange@test.com" 
                className="text-primary font-medium hover:underline"
              >
                domainexchange@test.com
              </a>
            </CardContent>
          </Card>

          <Card className="border border-gray-200">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-xl">General Inquiries</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-4">
                Have questions about our platform or need assistance?
              </p>
              <p className="text-gray-600">
                We're here to help with partnerships, technical support, and general questions.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-8 sm:mt-12">
          <div className="bg-gray-50 rounded-lg p-6 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Business Hours</h2>
            <p className="text-sm sm:text-base text-gray-600 mb-2">Monday - Friday: 9:00 AM - 6:00 PM EST</p>
            <p className="text-sm sm:text-base text-gray-600">We typically respond to emails within 24 hours during business days.</p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}