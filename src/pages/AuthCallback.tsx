import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, AlertCircle } from 'lucide-react';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { handleGoogleCallback } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    const userData = searchParams.get('user');

    if (token && userData) {
      try {
        handleGoogleCallback(token, userData);
        // Redirect to dashboard after successful login
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      } catch (error) {
        console.error('Error processing Google callback:', error);
        // Redirect to login page on error
        setTimeout(() => {
          navigate('/auth');
        }, 2000);
      }
    } else {
      // No token or user data, redirect to login
      setTimeout(() => {
        navigate('/auth');
      }, 2000);
    }
  }, [searchParams, handleGoogleCallback, navigate]);

  const token = searchParams.get('token');
  const userData = searchParams.get('user');

  return (
    <div className="min-h-screen bg-zoss-cream flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <div className="text-center">
            {token && userData ? (
              <>
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-zoss-blue mb-2">
                  Login Successful!
                </h2>
                <p className="text-zoss-gray">
                  Redirecting to dashboard...
                </p>
              </>
            ) : (
              <>
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-zoss-blue mb-2">
                  Authentication Failed
                </h2>
                <p className="text-zoss-gray">
                  Redirecting to login page...
                </p>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthCallback; 