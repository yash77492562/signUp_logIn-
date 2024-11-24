import { useState, useEffect } from "react";
import { useForm } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
import { userLoginSchema, UserLoginSchema } from "@repo/zod/client";
import { Button } from "@repo/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@repo/ui/card";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import axios from 'axios';
import Link from "next/link";

export const Login = ({
  onLogin,
  error,
}: {
  onLogin: (data: UserLoginSchema) => void;
  error?: string | null;
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string>('');
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch
  } = useForm<UserLoginSchema>({
    resolver: zodResolver(userLoginSchema),
    mode: "onChange"
  });

  const email = watch('email');

  // Check email as user types
  useEffect(() => {
    const validateEmail = async () => {
      if (!email) {
        setEmailError('');
        return;
      }

      // Basic email format check using regex
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setEmailError('Please enter a valid email address');
        return null;
      }

      setIsCheckingEmail(true);
      try {
        const response = await axios.post('/api/userAuthenticate', { email }, {
          headers: {
            "Content-Type": "application/json"
          }
        });
        
        // Check if user exists based on response
        if (response.data?.exists === false || response.status !== 200) {
          setEmailError('No account found with this email');
        } else {
          setEmailError('');
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          // If the API specifically returns that the user doesn't exist
          if (error.response?.status === 500) {
            setEmailError('No account found with this email');
          } else {
            setEmailError('Error checking email. Please try again.');
          }
        }
      } finally {
        setIsCheckingEmail(false);
      }
    };

    const timeoutId = setTimeout(validateEmail, 500);
    return () => {
      clearTimeout(timeoutId);
      setIsCheckingEmail(false);
    };
  }, [email]);

  const onSubmit = async (data: UserLoginSchema) => {
    if (emailError || isCheckingEmail) {
      return;
    }
    
    try {
      setServerError(null);
      onLogin(data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setServerError(error.response?.data?.message || 'Something went wrong');
      }
    }
  };


  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Log in to your account</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  type="email"
                  id="email"
                  {...register('email')}
                  className={`pl-9 ${emailError ? 'border-red-500 focus:border-red-500' : ''}`}
                  placeholder="Enter your email"
                />
              </div>
              {emailError && (
                <div className="space-y-1 mt-1">
                  <p className="text-sm text-red-500">{emailError}</p>
                  {emailError === 'Please enter a valid email address' && (
                    <ul className="text-xs text-gray-500 list-disc pl-4">
                      <li>Must be a valid email format (e.g., name@example.com)</li>
                      <li>Cannot contain spaces</li>
                    </ul>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password">Password</Label>
                <Link href="/reset_password" className="text-sm text-blue-600 hover:text-blue-500">Forget password</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  {...register('password')}
                  className="pl-9"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
              )}
            </div>

            {(serverError || error) && (
              <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
                {serverError || error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isSubmitting || !!emailError || isCheckingEmail}
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
            </Button>

            <div className="text-center text-sm text-gray-500">
              Don't have an account?{" "}
              <Link href="/auth/signup" className="font-medium text-blue-600 hover:underline">
                Sign Up
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};