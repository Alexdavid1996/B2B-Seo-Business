import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import {
  Globe,
  Search,
  MessageSquare,
  CheckCircle,
  Users,
  TrendingUp,
  Shield,
  Star,
  Zap,
  Target,
  BookOpen,
  Handshake,
  Award,
} from "lucide-react";
import { UserAvatar } from "@/components/ui/user-avatar";
import Footer from "@/components/layout/footer";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSEOPage } from "@/hooks/use-seo";

export default function Homepage() {
  // SEO for homepage
  useSEOPage("home");

  const [currentCard, setCurrentCard] = useState(0);

  // Fetch real sites data
  const { data: sitesData, isLoading } = useQuery({
    queryKey: ["/api/sites/directory"],
    enabled: true,
  });

  // Fetch platform settings
  const { data: settings } = useQuery<{
    platformName?: string;
    maintenanceMode?: string;
    maintenanceMessage?: string;
  }>({
    queryKey: ["/api/settings/public"],
    enabled: true,
  });

  // Helper function to format traffic numbers
  function formatTraffic(traffic: number): string {
    if (traffic >= 1000000) {
      return Math.floor(traffic / 1000000) + "M";
    } else if (traffic >= 1000) {
      return Math.floor(traffic / 1000) + "K";
    }
    return traffic.toString();
  }

  // Get top 5 sites by domain authority and traffic for hero card
  const topSites =
    sitesData && Array.isArray(sitesData)
      ? sitesData
          .filter(
            (site: any) =>
              site.domainAuthority &&
              site.monthlyTraffic &&
              site.status === "approved",
          )
          .sort((a: any, b: any) => {
            // Sort by highest traffic first, then by domain authority
            const trafficComparison =
              (b.monthlyTraffic || 0) - (a.monthlyTraffic || 0);
            if (trafficComparison !== 0) return trafficComparison;
            return (b.domainAuthority || 0) - (a.domainAuthority || 0);
          })
          .slice(0, 5)
          .map((site: any) => ({
            name: site.domain,
            category: site.category, // Use actual category from database
            da: site.domainAuthority?.toString() || "0",
            dr: site.drScore?.toString() || "0", // Add DR score
            traffic: site.monthlyTraffic
              ? formatTraffic(site.monthlyTraffic)
              : "0",
            rating: "4.9", // Default rating since we don't have this in database
            topic:
              site.description || `Quality content opportunities available`,
            owner: site.user, // Include site owner data
            type:
              site.purpose === "sales"
                ? "Accepting Guest Posts"
                : site.purpose === "exchange"
                  ? "Accepting Collaborations"
                  : "Guest Posts & Collaborations", // for 'both'
          }))
      : [];

  // Get latest sites for the new container: 3 guest posts + 3 exchanges
  const latestGuestPosts =
    sitesData && Array.isArray(sitesData)
      ? sitesData
          .filter(
            (site: any) =>
              site.status === "approved" &&
              (site.purpose === "sales" || site.purpose === "both") &&
              site.domainAuthority &&
              site.monthlyTraffic
          )
          .sort((a: any, b: any) => (b.monthlyTraffic || 0) - (a.monthlyTraffic || 0))
          .slice(0, 3)
      : [];

  const latestExchanges =
    sitesData && Array.isArray(sitesData)
      ? sitesData
          .filter(
            (site: any) =>
              site.status === "approved" &&
              (site.purpose === "exchange" || site.purpose === "both") &&
              site.domainAuthority &&
              site.monthlyTraffic
          )
          .sort((a: any, b: any) => (b.monthlyTraffic || 0) - (a.monthlyTraffic || 0))
          .slice(0, 3)
      : [];

  const allLatestSites = [...latestGuestPosts, ...latestExchanges];

  useEffect(() => {
    if (topSites.length > 0) {
      const interval = setInterval(() => {
        setCurrentCard((prev) => (prev + 1) % topSites.length);
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [topSites.length]);
  const steps = [
    {
      number: "1",
      title: "Submit Your Website",
      description:
        "Add your domain for verification and choose to offer guest posts or collaborate on link opportunities.",
      icon: Globe,
      color: "bg-blue-500",
    },
    {
      number: "2",
      title: "Discover Opportunities",
      description:
        "Browse verified websites offering guest posts or free link collaboration opportunities.",
      icon: Search,
      color: "bg-green-500",
    },
    {
      number: "3",
      title: "Live Chat",
      description:
        "Chat in real time with guest post providers or link collaboration partners to discuss requirements and share content.",
      icon: Handshake,
      color: "bg-purple-500",
    },
    {
      number: "4",
      title: "Publish & Succeed",
      description:
        "Collaborate to create quality content, publish guest posts, and mark the task as completed once done.",
      icon: Target,
      color: "bg-orange-500",
    },
  ];

  const features = [
    {
      icon: Users,
      title: "Verified Publishers",
      description:
        "This is a demo environment. All features are active, data may reset. Demo login: demo@demo.com - demo123",
    },
    {
      icon: Shield,
      title: "Secure Platform",
      description:
        "This is a demo environment. All features are active, data may reset. Demo login: demo@demo.com - demo123",
    },
    {
      icon: Award,
      title: "Premium Quality",
      description:
        "This is a demo environment. All features are active, data may reset. Demo login: demo@demo.com - demo123",
    },
    {
      icon: BookOpen,
      title: "Content Excellence",
      description:
        "This is a demo environment. All features are active, data may reset. Demo login: demo@demo.com - demo123",
    },
    {
      icon: TrendingUp,
      title: "Growth Focused",
      description:
        "This is a demo environment. All features are active, data may reset. Demo login: demo@demo.com - demo123",
    },
    {
      icon: Zap,
      title: "Fast & Efficient",
      description:
        "This is a demo environment. All features are active, data may reset. Demo login: demo@demo.com - demo123",
    },
  ];

  const mainServices = [
    {
      icon: BookOpen,
      title: "Premium Guest Posts",
      description:
        "This is a demo environment. All features are active, data may reset. Demo login: demo@demo.com - demo123",
    },
    {
      icon: Handshake,
      title: "Free Link Collaboration",
      description:
        "This is a demo environment. All features are active, data may reset. Demo login: demo@demo.com - demo123",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Top Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl sm:text-2xl font-bold text-primary">
                {settings?.platformName || "CollabPro"}
              </h1>
            </div>

            <div className="flex items-center space-x-3">
              <Link href="/auth">
                <Button variant="outline" size="sm">
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

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 sm:py-12 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full text-sm text-primary font-medium mb-6 shadow-sm">
                <Star className="h-4 w-4" />
                @Demo B2B Platform
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                B2B
                <span className="text-primary block">SEO</span>
                <span className="text-gray-700">Platform</span>
              </h1>

              <p className="mt-6 text-xl text-gray-600 leading-relaxed">
                CConnect with verified site owners, authors, and contributors for guest post placements or link swaps. Build real relationships, share useful content, and grow rankings with niche-matched opportunities. Demo login: demo@demo.com
 / demo123.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/auth">
                  <Button
                    size="lg"
                    className="text-lg px-8 py-4 h-auto shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 bg-primary hover:bg-primary/90"
                  >
                    Start Publishing Today
                  </Button>
                </Link>
                <Link href="/auth">
                  <Button
                    size="lg"
                    className="text-lg px-8 py-4 h-auto shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 bg-primary hover:bg-primary/90"
                  >
                    Browse Opportunities
                  </Button>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="mt-12 grid grid-cols-3 gap-6 sm:gap-8">
                <div className="text-center group">
                  <div className="text-3xl sm:text-4xl font-bold text-gray-900 group-hover:text-primary transition-colors">
                    {sitesData && Array.isArray(sitesData)
                      ? sitesData.length
                      : 500}
                    +
                  </div>
                  <div className="text-sm text-gray-600 font-medium">
                    Quality Publishers
                  </div>
                </div>
                <div className="text-center group">
                  <div className="text-3xl sm:text-4xl font-bold text-gray-900 group-hover:text-primary transition-colors">
                    2,500+
                  </div>
                  <div className="text-sm text-gray-600 font-medium">
                    Guest Posts Published
                  </div>
                </div>
                <div className="text-center group">
                  <div className="text-3xl sm:text-4xl font-bold text-gray-900 group-hover:text-primary transition-colors">
                    99%
                  </div>
                  <div className="text-sm text-gray-600 font-medium">
                    Success Rate
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Hero Card */}
            <div className="relative lg:scale-110">
              {topSites.length > 0 ? (
                <>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur-xl opacity-20 scale-105"></div>
                  <div className="relative bg-white rounded-3xl shadow-2xl p-8 hover:shadow-3xl transition-all duration-500 hover:-translate-y-2">
                    <div className="space-y-6">
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {topSites[currentCard]?.owner ? (
                            <UserAvatar
                              user={topSites[currentCard].owner}
                              size="lg"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                              <BookOpen className="h-6 w-6 text-white" />
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-gray-900 text-lg">
                              {topSites[currentCard]?.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {topSites[currentCard]?.category}
                            </div>
                          </div>
                        </div>
                        <Badge
                          className={`px-3 py-1 hover:opacity-80 ${
                            topSites[currentCard]?.type ===
                            "Accepting Guest Posts"
                              ? "bg-green-100 text-green-800"
                              : topSites[currentCard]?.type ===
                                  "Accepting Collaborations"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-purple-100 text-purple-800"
                          }`}
                        >
                          {topSites[currentCard]?.type}
                        </Badge>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-4 gap-3 py-4 border-y border-gray-100">
                        <div className="text-center">
                          <div className="flex items-center justify-center mb-1">
                            <img
                              src="/assets/google-analytics-icon.svg"
                              alt="Traffic"
                              className="h-4 w-4 mr-1"
                            />
                            <div className="text-lg font-bold text-green-600">
                              {topSites[currentCard]?.traffic}
                            </div>
                          </div>
                          <div className="text-xs text-gray-500 font-medium">
                            Traffic
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center mb-1">
                            <img
                              src="/assets/Ahrefs-icon.jpeg"
                              alt="DR"
                              className="h-4 w-4 mr-1 rounded"
                            />
                            <div className="text-lg font-bold text-orange-600">
                              {topSites[currentCard]?.dr}
                            </div>
                          </div>
                          <div className="text-xs text-gray-500 font-medium">
                            DR
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center mb-1">
                            <div className="w-4 h-4 bg-blue-600 rounded flex items-center justify-center mr-1">
                              <span className="text-white text-xs font-bold">
                                M
                              </span>
                            </div>
                            <div className="text-lg font-bold text-blue-600">
                              {topSites[currentCard]?.da}
                            </div>
                          </div>
                          <div className="text-xs text-gray-500 font-medium">
                            DA
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-purple-600">
                            {topSites[currentCard]?.rating}
                          </div>
                          <div className="text-xs text-gray-500 font-medium">
                            Rating
                          </div>
                        </div>
                      </div>

                      {/* Site Description */}
                      {topSites[currentCard]?.topic && (
                        <div className="bg-gray-50 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="text-sm font-semibold text-gray-900">
                              {topSites[currentCard]?.type ===
                              "Accepting Collaborations"
                                ? "Latest Collaboration Opportunity:"
                                : "Latest Guest Post Opportunity:"}
                            </div>
                            <div className="flex items-center text-xs text-gray-500">
                              <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                              {topSites[currentCard]?.rating} Rating
                            </div>
                          </div>
                          <div className="text-sm text-gray-600">
                            {topSites[currentCard]?.topic}
                          </div>
                        </div>
                      )}

                      {/* Card Indicators */}
                      <div className="flex justify-center space-x-2">
                        {topSites.map((_: any, index: number) => (
                          <div
                            key={index}
                            className={`w-2 h-2 rounded-full transition-colors ${
                              index === currentCard
                                ? "bg-primary"
                                : "bg-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                // Loading state or no sites available - don't display card
                <div className="flex items-center justify-center h-64">
                  {isLoading ? (
                    <div className="text-gray-500">
                      Loading top publishers...
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Latest Sites Container */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Latest Publishers
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover our newest verified publishers ready for guest posts and collaborations
            </p>
          </div>

          {allLatestSites.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {allLatestSites.map((site: any, index: number) => (
                <Card key={site.id} className="group hover:shadow-lg transition-all duration-300 border border-gray-200 hover:border-primary/30 h-full">
                  <CardContent className="p-6 h-full flex flex-col">
                    {/* Top Section - Publisher Info */}
                    <div className="flex items-start space-x-3 mb-4">
                      {site.user ? (
                        <UserAvatar user={site.user} size="md" />
                      ) : (
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <Globe className="h-5 w-5 text-white" />
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 truncate">
                          {site.user ? `${site.user.firstName} ${site.user.lastName}` : 'Publisher'}
                        </div>
                        
                        {/* Secured domain - prevent inspection */}
                        <div className="text-sm text-gray-500 relative">
                          <span className="absolute inset-0 bg-gradient-to-r from-gray-300 to-gray-400 blur-md opacity-80 z-10 pointer-events-none select-none"></span>
                          <span className="opacity-0 select-none pointer-events-none" aria-hidden="true">
                            {site.domain}
                          </span>
                          <span className="absolute inset-0 flex items-center text-xs text-gray-400 z-20 pointer-events-none select-none">
                            Login to view domain
                          </span>
                        </div>
                        
                        {/* Purpose Badge */}
                        <div className="mt-2">
                          <Badge
                            className={`px-2 py-1 text-xs ${
                              site.purpose === "sales"
                                ? "bg-green-100 text-green-800"
                                : site.purpose === "exchange"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-purple-100 text-purple-800"
                            }`}
                          >
                            {site.purpose === "sales"
                              ? "Guest Posts"
                              : site.purpose === "exchange"
                                ? "Link Collaboration"
                                : "Both"}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Stats Section */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      {/* Language */}
                      <div className="text-center">
                        <div className="text-sm font-medium text-gray-900">{site.language}</div>
                        <div className="text-xs text-gray-500">Language</div>
                      </div>

                      {/* Traffic */}
                      <div className="text-center">
                        <div className="flex items-center justify-center space-x-1 mb-1">
                          <img src="/assets/google-analytics-icon.svg" alt="Traffic" className="w-4 h-4" />
                          <span className="text-sm font-medium text-gray-900">{formatTraffic(site.monthlyTraffic)}</span>
                        </div>
                        <div className="text-xs text-gray-500">Traffic</div>
                      </div>

                      {/* DR */}
                      <div className="text-center">
                        <div className="flex items-center justify-center space-x-1 mb-1">
                          <img src="/assets/Ahrefs-icon.jpeg" alt="DR" className="w-4 h-4 rounded" />
                          <span className="text-sm font-medium text-gray-900">{site.drScore}</span>
                        </div>
                        <div className="text-xs text-gray-500">DR</div>
                      </div>

                      {/* DA */}
                      <div className="text-center">
                        <div className="flex items-center justify-center space-x-1 mb-1">
                          <div className="w-4 h-4 bg-blue-600 rounded flex items-center justify-center">
                            <span className="text-white font-bold text-xs">M</span>
                          </div>
                          <span className="text-sm font-medium text-gray-900">{site.domainAuthority}</span>
                        </div>
                        <div className="text-xs text-gray-500">DA</div>
                      </div>
                    </div>

                    {/* Bottom Action */}
                    <div className="mt-auto pt-4 border-t border-gray-100">
                      <Link href="/auth">
                        <Button className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 text-sm">
                          View Full Details
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Disclaimer text */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600 max-w-2xl mx-auto">
              These site statistics are regularly updated from trusted sources, but we encourage you to double-check all metrics for 100% accuracy before making any business decisions.
            </p>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Quality Guest posts & Link Collaboration
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              This is a demo environment. All features are active, data may reset. Demo login: demo@demo.com
 / demo123
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {mainServices.map((service, index) => (
              <Card
                key={index}
                className="group border border-gray-200 hover:border-primary/30 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                    <service.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 group-hover:text-primary transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {service.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Additional descriptive text below cards */}
          <div className="text-center mt-12">
            <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
              This is a demo environment. All features are active, data may reset. Demo login: demo@demo.com
 / demo123
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Why Choose {settings?.platformName || "CollabPro"}?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The premium platform connecting content creators with quality
              publishers for authentic guest post collaborations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="group border border-gray-200 hover:border-primary/30 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                    <feature.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Additional descriptive text below features cards */}
          <div className="text-center mt-12">
            <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
              This is a demo environment. All features are active, data may reset. Demo login: demo@demo.com - demo123
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              This is a demo environment. All features are active, data may reset. Demo login: demo@demo.com - demo123
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {/* Connection Line */}
            <div className="hidden lg:block absolute top-24 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-blue-200 via-green-200 via-purple-200 to-orange-200"></div>

            {steps.map((step, index) => (
              <div key={index} className="relative">
                <Card className="group border border-gray-200 hover:border-primary/30 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-8 text-center relative">
                    {/* Step Icon */}
                    <div
                      className={`w-20 h-20 ${step.color} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform`}
                    >
                      <step.icon className="h-10 w-10 text-white" />
                    </div>

                    {/* Step Number */}
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-white border-2 border-primary text-primary rounded-full flex items-center justify-center text-sm font-bold shadow-sm">
                      {step.number}
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-primary transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {step.description}
                    </p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>

          <div className="text-center mt-16">
            <div className="inline-flex flex-col sm:flex-row gap-4">
              <Link href="/auth">
                <Button
                  size="lg"
                  className="text-lg px-10 py-4 h-auto shadow-lg hover:shadow-xl transition-all"
                >
                  Join as Publisher
                </Button>
              </Link>
              <Link href="/auth">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-10 py-4 h-auto border-2 hover:bg-primary hover:text-white transition-all"
                >
                  Find Guest Post Opportunities
                </Button>
              </Link>
            </div>

            {/* Additional descriptive text below How It Works cards */}
            <div className="text-center mt-12">
              <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
                This is a demo environment. All features are active, data may reset. Demo login: demo@demo.com - demo123
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Trusted by Professionals Worldwide</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              This is a demo environment. All features are active, data may reset. Demo login: demo@demo.com - demo123
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <Card className="group border border-gray-200 hover:border-primary/30 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <img
                    src="/assets/Maya_Whitaker.png"
                    alt="Maya Whitaker"
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900">Maya Whitaker</h4>
                    <p className="text-sm text-gray-600">SEO Manager</p>
                  </div>
                </div>

                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                <blockquote className="text-gray-700 italic">
                  "This is a demo environment. All features are active, data may reset. Demo login: demo@demo.com - demo123"
                </blockquote>
              </CardContent>
            </Card>

            {/* Testimonial 2 */}
            <Card className="group border border-gray-200 hover:border-primary/30 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <img
                    src="/assets/Marcus_Rodriguez.png"
                    alt="Marcus Rodriguez"
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900">Demo</h4>
                    <p className="text-sm text-gray-600">Demo</p>
                  </div>
                </div>

                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                <blockquote className="text-gray-700 italic">
                  "This is a demo environment. All features are active, data may reset. Demo login: demo@demo.com - demo123"
                </blockquote>
              </CardContent>
            </Card>

            {/* Testimonial 3 */}
            <Card className="group border border-gray-200 hover:border-primary/30 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <img
                    src="/assets/Raghav_Menon.png"
                    alt="Raghav Menon"
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900">Demo</h4>
                    <p className="text-sm text-gray-600">Demo</p>
                  </div>
                </div>

                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                <blockquote className="text-gray-700 italic">
                  "This is a demo environment. All features are active, data may reset. Demo login: demo@demo.com - demo123"
                </blockquote>
              </CardContent>
            </Card>
          </div>

          {/* Call to action */}
          <div className="text-center mt-16">
            <p className="text-lg text-gray-700 mb-6">This is a demo environment. All features are active, data may reset. Demo login: demo@demo.com - demo123</p>
            <Link href="/auth">
              <Button size="lg" className="text-lg px-10 py-4 h-auto shadow-lg hover:shadow-xl transition-all">
                This is a demo environment. All features are active, data may reset. Demo login: demo@demo.com - demo123
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary via-blue-600 to-purple-600 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-grid-white/10"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-black/20"></div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm text-white font-medium mb-6">
              <Zap className="h-4 w-4" />
              This is a demo environment. All features are active, data may reset. Demo login: demo@demo.com - demo123
            </div>

            <h2 className="text-3xl sm:text-5xl font-bold text-white mb-6 leading-tight">
              Ready to Amplify Your Content?
            </h2>
            <p className="text-xl text-blue-100 leading-relaxed max-w-2xl mx-auto">
              This is a demo environment. All features are active, data may reset. Demo login: demo@demo.com - demo123
            </p>
          </div>

          {/* Trust Badges */}
          <div className="mt-12 flex flex-wrap justify-center items-center gap-8 text-white/80">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <span className="text-sm font-medium">Secure Payments</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              <span className="text-sm font-medium">Quality Guaranteed</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              <span className="text-sm font-medium">99% Success Rate</span>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}