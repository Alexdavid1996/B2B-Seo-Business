import { Link } from "wouter";
import { Facebook, Linkedin, Instagram, Send, Twitter } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { SocialLink } from "@shared/schema";

export default function Footer() {
  // Fetch platform settings
  const { data: settings } = useQuery<{ platformName?: string }>({
    queryKey: ["/api/settings/public"],
    enabled: true,
  });

  // Fetch active social links for the footer
  const { data: socialLinks = [] } = useQuery<SocialLink[]>({
    queryKey: ["/api/social-links"],
  });

  // Helper function to get the icon for each social platform
  const getSocialIcon = (name: string) => {
    const iconName = name.toLowerCase();

    if (iconName.includes("twitter") || iconName.includes("x")) {
      return <Twitter className="h-5 w-5 text-gray-400 hover:text-white" />;
    }

    if (iconName.includes("facebook")) {
      return <Facebook className="h-5 w-5 text-gray-400 hover:text-white" />;
    }

    if (iconName.includes("linkedin")) {
      return <Linkedin className="h-5 w-5 text-gray-400 hover:text-white" />;
    }

    if (iconName.includes("instagram")) {
      return <Instagram className="h-5 w-5 text-gray-400 hover:text-white" />;
    }

    // Default icon for unknown platforms
    return <Send className="h-5 w-5 text-gray-400 hover:text-white" />;
  };

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">
              {settings?.platformName || "CollabPro"}
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              A B2B platform for guest posts and link partnerships. Verified sites, clear workflows.
            </p>
          </div>

          {/* About */}
          <div>
            <h4 className="font-semibold text-white mb-4">About</h4>
            <nav>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/about"
                    className="text-gray-400 hover:text-white transition-colors text-sm block"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/faq"
                    className="text-gray-400 hover:text-white transition-colors text-sm block"
                  >
                    FAQ
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-white mb-4">Support</h4>
            <nav>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/contact"
                    className="text-gray-400 hover:text-white transition-colors text-sm block"
                  >
                    Contact
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="text-gray-400 hover:text-white transition-colors text-sm block"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="text-gray-400 hover:text-white transition-colors text-sm block"
                  >
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          {/* Social Media - Dynamic Social Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Follow Us</h4>
            {socialLinks.length > 0 ? (
              <div className="flex space-x-4">
                {socialLinks.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors"
                    aria-label={link.name}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {getSocialIcon(link.name)}
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm">
                No social links configured yet.
              </p>
            )}
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © 2024 {settings?.platformName || "CollabPro"}. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
