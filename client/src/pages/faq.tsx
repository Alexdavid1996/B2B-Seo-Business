import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Footer from "@/components/layout/footer";
import { useSEOPage } from "@/hooks/use-seo";

export default function FAQPage() {
  // SEO for FAQ page
  useSEOPage('faq');
  
  const [openItems, setOpenItems] = useState<string[]>([]);

  // Fetch platform settings
  const { data: settings } = useQuery<{ platformName?: string }>({
    queryKey: ['/api/settings/public'],
    enabled: true
  });

  const toggleItem = (id: string) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const platformName = settings?.platformName || 'CollabPro';

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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
  <div className="text-center mb-12">
    <h1 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h1>
    <p className="text-xl text-gray-600">
      Find answers to common questions about {settings?.platformName || 'Outmarkly'}
    </p>
  </div>

  <div className="space-y-4">
    {[
      {
        id: 1,
        question: "Demo",
        answer:
          "This is a demo environment. All features are active, data may reset. Demo login: demo@demo.com - demo123"
      },
      {
        id: 2,
        question: "Demo",
        answer:
          "This is a demo environment. All features are active, data may reset. Demo login: demo@demo.com - demo123"
      },
      {
        id: 3,
        question: "Demo",
        answer:
          "This is a demo environment. All features are active, data may reset. Demo login: demo@demo.com - demo123"
      },
      {
        id: 4,
        question: "Demo",
        answer:
          "This is a demo environment. All features are active, data may reset. Demo login: demo@demo.com - demo123"
      },
      {
        id: 5,
        question: "Demo",
        answer:
          "This is a demo environment. All features are active, data may reset. Demo login: demo@demo.com - demo123"
      },
      {
        id: 6,
        question: "Demo",
        answer:
          "This is a demo environment. All features are active, data may reset. Demo login: demo@demo.com - demo123"
      },
      {
        id: 7,
        question: "Demo",
        answer:
          "This is a demo environment. All features are active, data may reset. Demo login: demo@demo.com - demo123"
      }
    ].map((faq) => (
      <Card key={faq.id} className="border border-gray-200">
        <CardHeader
          className="cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => toggleItem(faq.id.toString())}
        >
          <CardTitle className="flex items-center justify-between text-lg">
            {faq.question}
            <ChevronDown
              className={`h-5 w-5 transition-transform ${
                openItems.includes(faq.id.toString()) ? 'rotate-180' : ''
              }`}
            />
          </CardTitle>
        </CardHeader>
        {openItems.includes(faq.id.toString()) && (
          <CardContent className="pt-0">
            <p className="text-gray-600">{faq.answer}</p>
          </CardContent>
        )}
      </Card>
    ))}
  </div>

  <div className="text-center mt-12">
    <p className="text-gray-600 mb-4">Still have questions?</p>
    <Link href="/contact">
      <Button>Contact Us</Button>
    </Link>
  </div>
</div>
<Footer />
    </div>
  );
}