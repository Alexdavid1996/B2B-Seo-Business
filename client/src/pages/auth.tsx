import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "../hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { ADMIN_BASE_PATH, EMPLOYEE_BASE_PATH } from "@/lib/constants";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  RefreshCw,
  Eye,
  EyeOff,
  PenTool,
  Link2,
} from "lucide-react";
import { useSEOPage } from "@/hooks/use-seo";
import { useIsMobile } from "@/hooks/use-mobile";

// Resend Verification Button Component
interface ResendVerificationButtonProps {
  email: string;
  canResendAt: Date | null;
  onResend: () => void;
  isLoading: boolean;
}

const ResendVerificationButton = ({
  email,
  canResendAt,
  onResend,
  isLoading,
}: ResendVerificationButtonProps) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    if (!canResendAt) return;

    const updateTimer = () => {
      const now = Date.now();
      const resendTime = canResendAt.getTime();
      const timeUntilResend = Math.max(0, resendTime - now);
      setTimeLeft(Math.ceil(timeUntilResend / 1000));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [canResendAt]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const canResend = !canResendAt || timeLeft <= 0;

  return (
    <Button
      onClick={onResend}
      disabled={!canResend || isLoading}
      variant="secondary"
      className="w-full"
    >
      {isLoading ? (
        <>
          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          Sending...
        </>
      ) : canResend ? (
        <>
          <RefreshCw className="w-4 h-4 mr-2" />
          Resend Verification Link
        </>
      ) : (
        <>
          <Clock className="w-4 h-4 mr-2" />
          Resend in {formatTime(timeLeft)}
        </>
      )}
    </Button>
  );
};

const loginSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email")
    .max(255, "Email must be 255 characters or less"),
  password: z
    .string()
    .min(1, "Password is required")
    .max(128, "Password must be 128 characters or less"),
});

const registerSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name must be 50 characters or less")
    .refine(
      (name) => !/[<>\"'&]/.test(name),
      "First name contains invalid characters",
    ),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name must be 50 characters or less")
    .refine(
      (name) => !/[<>\"'&]/.test(name),
      "Last name contains invalid characters",
    ),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be 30 characters or less")
    .refine(
      (username) => !/[<>\"'&]/.test(username),
      "Username contains invalid characters",
    ),
  email: z
    .string()
    .email("Please enter a valid email")
    .max(255, "Email must be 255 characters or less"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(128, "Password must be 128 characters or less"),
  acceptTerms: z
    .boolean()
    .refine((val) => val === true, "You must accept the Terms of Service"),
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

export default function AuthPage() {
  // SEO for auth page (noindex)
  useSEOPage('auth');
  
  const isMobile = useIsMobile();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");
  const [canResendAt, setCanResendAt] = useState<Date | null>(null);
  const [, setLocation] = useLocation();
  const { login, refreshAuth } = useAuth();
  const { toast } = useToast();

  // Fetch platform settings
  const { data: settings } = useQuery({
    queryKey: ["/api/settings/public"],
    enabled: true,
  });

  // Resend verification mutation
  const resendVerificationMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await apiRequest("/api/auth/resend-verification", {
        method: "POST",
        body: { email },
      });
      return response;
    },
    onSuccess: (result) => {
      if (result.canResendAt) {
        setCanResendAt(new Date(result.canResendAt));
      }
      toast({
        title: "Verification Link Sent",
        description: result.message,
        variant: "default",
      });
    },
    onError: (error) => {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to resend verification";
      if (errorMessage.includes("wait")) {
        // Extract time information if available
        const timeMatch = errorMessage.match(/(\d+) more minutes/);
        if (timeMatch) {
          const minutes = parseInt(timeMatch[1]);
          setCanResendAt(new Date(Date.now() + minutes * 60 * 1000));
        }
      }
      toast({
        title: "Resend Failed",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  // Handle URL parameters for verification success/failure and referral
  const [referralCode, setReferralCode] = useState<string | null>(null);
  
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const verified = params.get("verified");
    const error = params.get("error");
    const ref = params.get("ref");

    // Check for referral code from URL or localStorage
    const storedReferralCode = localStorage.getItem('pendingReferralCode');
    const finalReferralCode = ref || storedReferralCode;

    if (finalReferralCode) {
      setReferralCode(finalReferralCode);
      setIsSignUp(true); // Switch to signup mode when referral is present
      // Clear stored referral code after using it
      if (storedReferralCode) {
        localStorage.removeItem('pendingReferralCode');
      }
    }

    if (verified === "true") {
      toast({
        title: "Email Verified!",
        description:
          "Your email has been verified successfully. You can now log in.",
        variant: "default",
      });
      // Clean URL but preserve referral
      const newUrl = ref ? `/auth?ref=${ref}` : "/auth";
      window.history.replaceState({}, "", newUrl);
    } else if (verified === "false" && error) {
      toast({
        title: "Verification Failed",
        description:
          "The verification link is invalid or has expired. Please try registering again.",
        variant: "destructive",
      });
      // Clean URL
      window.history.replaceState({}, "", "/auth");
    }
  }, [toast]);

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      username: "",
      email: "",
      password: "",
      acceptTerms: false,
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormData) => {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Authentication failed");
      }

      return response.json();
    },
    onSuccess: async (result) => {
      console.log("Login success, refreshing auth state...");

      // Force refresh auth state from server
      const serverUser = await refreshAuth();

      console.log("refreshAuth returned:", serverUser);

      if (serverUser) {
        // Force a page refresh to ensure proper state sync
        console.log("Redirecting user with role:", serverUser.role);
        const targetUrl =
          serverUser.role === "admin"
            ? ADMIN_BASE_PATH
            : serverUser.role === "employee"
              ? EMPLOYEE_BASE_PATH
              : "/dashboard";

        // Use window.location to force full page navigation
        window.location.href = targetUrl;
      } else {
        console.log("refreshAuth failed, showing error");
        toast({
          title: "Login Issue",
          description: "Session verification failed. Please try again.",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      const errorMessage =
        error instanceof Error ? error.message : "An error occurred";

      // Check if it's an email verification error
      if (
        errorMessage.includes("verify your email") ||
        errorMessage.includes("verification")
      ) {
        // Extract email from form if possible
        const email = loginForm.getValues("email");
        setPendingEmail(email);
        setShowVerificationMessage(true);
        toast({
          title: "Email Verification Required",
          description:
            "Please check your email and click the verification link before logging in.",
          variant: "default",
        });
      } else {
        toast({
          title: "Login Failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterFormData) => {
      // Include referral code in registration data
      const registrationData = {
        ...data,
        referralCode: referralCode || undefined
      };

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registrationData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Registration failed");
      }

      return response.json();
    },
    onSuccess: async (result) => {
      // Check if email verification is required
      if (result.requiresVerification) {
        setShowVerificationMessage(true);
        setPendingEmail(result.email);
        toast({
          title: "Registration Successful!",
          description:
            result.message ||
            "A link has been sent successfully to your email for confirmation",
          variant: "default",
        });
        return;
      }

      // If no verification required, user is automatically logged in
      // Show success message briefly, then redirect
      toast({
        title: "Registration Successful!",
        description:
          result.message ||
          `Welcome to ${settings?.platformName || "CollabPro"}!`,
        variant: "default",
      });

      // The backend has already created the session, so we can redirect immediately
      // Use setTimeout to ensure the toast shows briefly before redirect
      setTimeout(() => {
        const user = result.user;
        if (user && user.role === "admin") {
          window.location.href = ADMIN_BASE_PATH;
        } else if (user && user.role === "employee") {
          window.location.href = EMPLOYEE_BASE_PATH;
        } else {
          window.location.href = "/dashboard";
        }
      }, 1000); // 1 second delay to show the success message
    },
    onError: (error) => {
      toast({
        title: "Registration Failed",
        description:
          error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    },
  });

  const handleLoginSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  const handleRegisterSubmit = (data: RegisterFormData) => {
    registerMutation.mutate(data);
  };

  // Show verification message if needed
  if (showVerificationMessage) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">
              Check Your Email
            </CardTitle>
            <CardDescription className="text-center">
              A verification link has been sent to your email address.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Email sent to:</strong> {pendingEmail}
                </p>
                <p className="text-sm text-blue-600 dark:text-blue-300 mt-2">
                  Click the verification link in your email to activate your
                  account. The link will expire in 1 hour.
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>What's next?</strong>
                </p>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Check your email (including spam folder)</li>
                  <li>• Click the verification link</li>
                  <li>• Return here to log in</li>
                </ul>
              </div>

              <div className="space-y-3">
                <ResendVerificationButton
                  email={pendingEmail}
                  canResendAt={canResendAt}
                  onResend={() =>
                    resendVerificationMutation.mutate(pendingEmail)
                  }
                  isLoading={resendVerificationMutation.isPending}
                />

                <Button
                  onClick={() => {
                    setShowVerificationMessage(false);
                    setPendingEmail("");
                    setCanResendAt(null);
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Back to Login
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50/40 via-white to-slate-50/60">
      {isMobile ? (
        // Mobile Layout
        <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          {/* Platform Name - Standalone with elegant spacing */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-primary mb-1 tracking-tight">
              {settings?.platformName || "CollabPro"}
            </h1>
            <p className="text-sm text-muted-foreground">
              Collaboration Made Simple and Effective
            </p>
          </div>

          {/* Auth Card - Cleaner and tighter */}
          <Card className="w-full shadow-lg border-0 bg-white">
            <CardHeader className="text-center pb-6 pt-8">
              <CardTitle className="text-2xl font-semibold mb-2">
                {isSignUp ? "Create Account" : "Welcome Back"}
              </CardTitle>
              <CardDescription className="text-base">
                {isSignUp
                  ? "Join the community and start exchanging links"
                  : "Sign in to access your dashboard"}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              {!isSignUp ? (
              <form
                onSubmit={loginForm.handleSubmit(handleLoginSubmit)}
                className="space-y-5"
              >
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    className="h-11"
                    {...loginForm.register("email")}
                  />
                  {loginForm.formState.errors.email && (
                    <p className="text-sm text-red-600 mt-1">
                      {loginForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    className="h-11"
                    {...loginForm.register("password")}
                  />
                  {loginForm.formState.errors.password && (
                    <p className="text-sm text-red-600 mt-1">
                      {loginForm.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 text-base font-medium"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? "Signing In..." : "Sign In"}
                </Button>
              </form>
            ) : (
              <>
                {referralCode && (
                  <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                    <p className="text-sm text-green-700 dark:text-green-300">
                      🎉 You're signing up through a referral from <strong>{referralCode}</strong>!
                    </p>
                  </div>
                )}
                <form
                  onSubmit={registerForm.handleSubmit(handleRegisterSubmit)}
                  className="space-y-5"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-sm font-medium">
                      First Name
                    </Label>
                    <Input
                      id="firstName"
                      placeholder="John"
                      className="h-11"
                      {...registerForm.register("firstName")}
                    />
                    {registerForm.formState.errors.firstName && (
                      <p className="text-sm text-red-600 mt-1">
                        {registerForm.formState.errors.firstName.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-sm font-medium">
                      Last Name
                    </Label>
                    <Input
                      id="lastName"
                      placeholder="Doe"
                      className="h-11"
                      {...registerForm.register("lastName")}
                    />
                    {registerForm.formState.errors.lastName && (
                      <p className="text-sm text-red-600 mt-1">
                        {registerForm.formState.errors.lastName.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-medium">
                    Username
                  </Label>
                  <Input
                    id="username"
                    placeholder="johndoe123"
                    className="h-11"
                    {...registerForm.register("username")}
                  />
                  {registerForm.formState.errors.username && (
                    <p className="text-sm text-red-600 mt-1">
                      {registerForm.formState.errors.username.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    className="h-11"
                    {...registerForm.register("email")}
                  />
                  {registerForm.formState.errors.email && (
                    <p className="text-sm text-red-600 mt-1">
                      {registerForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Create a strong password"
                    className="h-11"
                    {...registerForm.register("password")}
                  />
                  {registerForm.formState.errors.password && (
                    <p className="text-sm text-red-600 mt-1">
                      {registerForm.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <div className="flex items-start space-x-3 pt-1">
                  <Checkbox
                    id="acceptTerms"
                    data-testid="checkbox-terms"
                    checked={registerForm.watch("acceptTerms")}
                    onCheckedChange={(checked) => {
                      registerForm.setValue("acceptTerms", !!checked);
                    }}
                  />
                  <Label
                    htmlFor="acceptTerms"
                    className="text-sm leading-relaxed text-gray-600 dark:text-gray-300"
                  >
                    I agree to the{" "}
                    <a
                      href="/terms"
                      target="_blank"
                      className="text-primary hover:underline font-medium"
                    >
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a
                      href="/privacy"
                      target="_blank"
                      className="text-primary hover:underline font-medium"
                    >
                      Privacy Policy
                    </a>
                  </Label>
                </div>
                {registerForm.formState.errors.acceptTerms && (
                  <p className="text-sm text-red-600 mt-1">
                    {registerForm.formState.errors.acceptTerms.message}
                  </p>
                )}

                <Button
                  type="submit"
                  className="w-full h-11 text-base font-medium"
                  disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending
                    ? "Creating Account..."
                    : "Create Account"}
                </Button>
                </form>
              </>
            )}

            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              {!isSignUp && (
                <div className="text-center mb-4">
                  <Link href="/auth/forgot-password">
                    <Button
                      variant="link"
                      className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary"
                    >
                      Forgot your password?
                    </Button>
                  </Link>
                </div>
              )}
              <p className="text-center text-gray-600 dark:text-gray-400">
                {isSignUp
                  ? "Already have an account?"
                  : "Don't have an account?"}
                <Button
                  variant="link"
                  className="ml-2 p-0 text-primary font-medium"
                  onClick={() => setIsSignUp(!isSignUp)}
                >
                  {isSignUp ? "Sign In" : "Sign Up"}
                </Button>
              </p>
              </div>
            </CardContent>
          </Card>
        </div>
        </div>
      ) : (
        // Desktop Layout
        <div className="grid grid-cols-2 min-h-screen">
        {/* Left Side - Welcome & Features */}
        <div className="flex items-center justify-center p-8 lg:p-12 bg-gradient-to-br from-primary/8 via-blue-50/60 to-primary/5 relative overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute -top-20 -left-20 w-40 h-40 bg-gradient-to-br from-primary/10 to-blue-400/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-gradient-to-tl from-blue-500/8 to-primary/8 rounded-full blur-3xl"></div>
          <div className="max-w-md w-full space-y-6 relative z-10">
            {/* Welcome Section */}
            <div className="text-center mb-8">
              <h1 className="text-3xl lg:text-4xl font-bold text-primary mb-3 tracking-tight">
                Welcome to {settings?.platformName || "CollabPro"}
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                Connect, Collaborate, Grow
              </p>
              <div className="w-24 h-1 bg-gradient-to-r from-primary via-blue-500 to-primary/70 mx-auto mt-4 rounded-full shadow-sm"></div>
            </div>

            {/* Compact Feature Cards */}
            <div className="space-y-4">
              {/* Guest Post */}
              <div className="flex items-center gap-4 p-5 bg-white/90 backdrop-blur-sm rounded-xl border border-blue-100/50 hover:shadow-lg hover:bg-white transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500/15 to-green-500/25 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                  <PenTool className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Guest Post</h3>
                  <p className="text-sm text-gray-600">Submit articles and explore publishing opportunities</p>
                </div>
              </div>

              {/* Link Collaboration */}
              <div className="flex items-center gap-4 p-5 bg-white/90 backdrop-blur-sm rounded-xl border border-blue-100/50 hover:shadow-lg hover:bg-white transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500/15 to-primary/25 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Link2 className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Link Exchange</h3>
                  <p className="text-sm text-gray-600">Connect with site owners for link partnerships</p>
                </div>
              </div>
            </div>

            {/* Bottom accent */}
            <div className="text-center pt-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 backdrop-blur-sm rounded-full border border-primary/20">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                <p className="text-sm text-primary font-medium">
                  Join a demo b2b platform.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="flex items-center justify-center p-8 lg:p-12 bg-gradient-to-bl from-white via-blue-50/20 to-gray-50/40 relative overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-bl from-primary/8 to-blue-400/8 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-gradient-to-tr from-blue-500/6 to-primary/6 rounded-full blur-2xl"></div>
          <div className="w-full max-w-md relative z-10">
            <Card className="shadow-2xl border border-blue-100/60 bg-white/95 backdrop-blur-sm">
              <CardHeader className="text-center pb-6 pt-8">
                <CardTitle className="text-3xl font-semibold mb-2">
                  {isSignUp ? "Create Account" : "Sign In"}
                </CardTitle>
                <CardDescription className="text-lg">
                  {isSignUp
                    ? "Join the community and start collaborating"
                    : "Access your dashboard"}
                </CardDescription>
              </CardHeader>
              <CardContent className="px-8 pb-8">
                {!isSignUp ? (
                  <form
                    onSubmit={loginForm.handleSubmit(handleLoginSubmit)}
                    className="space-y-5"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="email-desktop" className="text-sm font-medium">
                        Email Address
                      </Label>
                      <Input
                        id="email-desktop"
                        type="email"
                        placeholder="your.email@example.com"
                        className="h-12"
                        {...loginForm.register("email")}
                      />
                      {loginForm.formState.errors.email && (
                        <p className="text-sm text-red-600 mt-1">
                          {loginForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password-desktop" className="text-sm font-medium">
                        Password
                      </Label>
                      <Input
                        id="password-desktop"
                        type="password"
                        placeholder="Enter your password"
                        className="h-12"
                        {...loginForm.register("password")}
                      />
                      {loginForm.formState.errors.password && (
                        <p className="text-sm text-red-600 mt-1">
                          {loginForm.formState.errors.password.message}
                        </p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-12 text-base font-medium"
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? "Signing In..." : "Sign In"}
                    </Button>
                  </form>
                ) : (
                  <form
                    onSubmit={registerForm.handleSubmit(handleRegisterSubmit)}
                    className="space-y-5"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName-desktop" className="text-sm font-medium">
                          First Name
                        </Label>
                        <Input
                          id="firstName-desktop"
                          placeholder="John"
                          className="h-12"
                          {...registerForm.register("firstName")}
                        />
                        {registerForm.formState.errors.firstName && (
                          <p className="text-sm text-red-600 mt-1">
                            {registerForm.formState.errors.firstName.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName-desktop" className="text-sm font-medium">
                          Last Name
                        </Label>
                        <Input
                          id="lastName-desktop"
                          placeholder="Doe"
                          className="h-12"
                          {...registerForm.register("lastName")}
                        />
                        {registerForm.formState.errors.lastName && (
                          <p className="text-sm text-red-600 mt-1">
                            {registerForm.formState.errors.lastName.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="username-desktop" className="text-sm font-medium">
                        Username
                      </Label>
                      <Input
                        id="username-desktop"
                        placeholder="johndoe123"
                        className="h-12"
                        {...registerForm.register("username")}
                      />
                      {registerForm.formState.errors.username && (
                        <p className="text-sm text-red-600 mt-1">
                          {registerForm.formState.errors.username.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email-register-desktop" className="text-sm font-medium">
                        Email Address
                      </Label>
                      <Input
                        id="email-register-desktop"
                        type="email"
                        placeholder="your.email@example.com"
                        className="h-12"
                        {...registerForm.register("email")}
                      />
                      {registerForm.formState.errors.email && (
                        <p className="text-sm text-red-600 mt-1">
                          {registerForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password-register-desktop" className="text-sm font-medium">
                        Password
                      </Label>
                      <Input
                        id="password-register-desktop"
                        type="password"
                        placeholder="Create a strong password"
                        className="h-12"
                        {...registerForm.register("password")}
                      />
                      {registerForm.formState.errors.password && (
                        <p className="text-sm text-red-600 mt-1">
                          {registerForm.formState.errors.password.message}
                        </p>
                      )}
                    </div>

                    <div className="flex items-start space-x-3 pt-1">
                      <input
                        type="checkbox"
                        id="acceptTerms-desktop"
                        className="mt-1 h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                        {...registerForm.register("acceptTerms")}
                      />
                      <Label
                        htmlFor="acceptTerms-desktop"
                        className="text-sm leading-relaxed text-gray-600"
                      >
                        I agree to the{" "}
                        <a
                          href="/terms"
                          target="_blank"
                          className="text-primary hover:underline font-medium"
                        >
                          Terms of Service
                        </a>{" "}
                        and{" "}
                        <a
                          href="/privacy"
                          target="_blank"
                          className="text-primary hover:underline font-medium"
                        >
                          Privacy Policy
                        </a>
                      </Label>
                    </div>
                    {registerForm.formState.errors.acceptTerms && (
                      <p className="text-sm text-red-600 mt-1">
                        {registerForm.formState.errors.acceptTerms.message}
                      </p>
                    )}

                    <Button
                      type="submit"
                      className="w-full h-12 text-base font-medium"
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending
                        ? "Creating Account..."
                        : "Create Account"}
                    </Button>
                  </form>
                )}

                <div className="mt-8 pt-6 border-t border-gray-200">
                  {!isSignUp && (
                    <div className="text-center mb-4">
                      <Link href="/auth/forgot-password">
                        <Button
                          variant="link"
                          className="text-sm text-gray-600 hover:text-primary"
                        >
                          Forgot your password?
                        </Button>
                      </Link>
                    </div>
                  )}
                  <p className="text-center text-gray-600">
                    {isSignUp
                      ? "Already have an account?"
                      : "Don't have an account?"}
                    <Button
                      variant="link"
                      className="ml-2 p-0 text-primary font-medium"
                      onClick={() => setIsSignUp(!isSignUp)}
                    >
                      {isSignUp ? "Sign In" : "Sign Up"}
                    </Button>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        </div>
      )}
    </div>
  );
}
