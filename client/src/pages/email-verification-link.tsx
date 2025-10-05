import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Mail, ArrowLeft, Loader2 } from "lucide-react";

export default function EmailVerificationLinkPage() {
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<'ready' | 'loading' | 'success' | 'error' | 'invalid'>('ready');
  const [message, setMessage] = useState('');
  const [token, setToken] = useState<string | null>(null);

  // Get platform settings
  const { data: settings } = useQuery<{ platformName?: string }>({
    queryKey: ["/api/settings/public"],
    enabled: true,
  });

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenParam = urlParams.get('token');
    const errorParam = urlParams.get('error');
    
    if (!tokenParam) {
      setStatus('invalid');
      setMessage('Invalid verification link. Please check your email and try again.');
      return;
    }

    if (errorParam === 'invalid') {
      setStatus('error');
      setMessage('The verification link is invalid or has expired. Please request a new verification email.');
      return;
    }

    setToken(tokenParam);
    setMessage('Click the button below to verify your email address.');
  }, []);

  // Verify the email token
  const handleVerifyEmail = async () => {
    if (!token) return;

    setStatus('loading');
    setMessage('Verifying your email address...');

    try {
      const response = await fetch(`/api/auth/verify-token/${token}`, {
        method: 'GET',
      });

      const data = await response.json();
      
      if (data.success) {
        setStatus('success');
        setMessage('Your email has been successfully verified! You can now log in to your account.');
      } else {
        setStatus('error');
        setMessage(data.message || 'The verification link is invalid or has expired. Please request a new verification email.');
      }
    } catch (error) {
      console.error('Verification error:', error);
      setStatus('error');
      setMessage('An error occurred while verifying your email. Please try again later.');
    }
  };

  const handleBackToLogin = () => {
    setLocation('/auth');
  };

  const handleResendVerification = () => {
    setLocation('/auth?tab=register&resend=true');
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-0">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-4">
              {status === 'ready' && (
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <Mail className="h-8 w-8 text-blue-600" />
                </div>
              )}
              {status === 'loading' && (
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                </div>
              )}
              {status === 'success' && (
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              )}
              {(status === 'error' || status === 'invalid') && (
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <XCircle className="h-8 w-8 text-red-600" />
                </div>
              )}
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              {status === 'ready' && 'Verify Your Email'}
              {status === 'loading' && 'Verifying Email...'}
              {status === 'success' && 'Email Verified!'}
              {(status === 'error' || status === 'invalid') && 'Verification Failed'}
            </CardTitle>
            <CardDescription className="text-gray-600 mt-2">
              {status === 'loading' && 'Please wait while we verify your email address.'}
              {message}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {status === 'ready' && (
              <div className="space-y-4">
                <Button 
                  onClick={handleVerifyEmail}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Verify My Email
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={handleBackToLogin}
                  className="w-full"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Login
                </Button>
              </div>
            )}

            {status === 'success' && (
              <div className="space-y-4">
                <Button 
                  onClick={handleBackToLogin}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Continue to Login
                </Button>
              </div>
            )}

            {(status === 'error' || status === 'invalid') && (
              <div className="space-y-3">
                <Button 
                  onClick={handleResendVerification}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Request New Verification Email
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={handleBackToLogin}
                  className="w-full"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Login
                </Button>
              </div>
            )}

            {status === 'loading' && (
              <div className="text-center">
                <p className="text-sm text-gray-500">
                  This should only take a few seconds...
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            {settings?.platformName || 'CollabPro'} - Advanced Link Exchange Platform
          </p>
        </div>
      </div>
    </div>
  );
}