import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@repo/ui/card';
import { Button } from '@repo/ui/button';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { Eye, EyeOff, User, Phone, Mail, Lock } from 'lucide-react';
import axios from 'axios';
import { userSigninSchema, type UserSigninSchema } from '@repo/zod/client';
import Link from 'next/link';


type SignUpProps = {
  onSignUp: (data: UserSigninSchema) => Promise<void>;
};

const SignUp = ({ onSignUp }: SignUpProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string>('');
  const [phoneError, setPhoneError] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch
  } = useForm<UserSigninSchema>({
    resolver: zodResolver(userSigninSchema)
  });

  const email = watch('email');
  const phone = watch('phone');

  // Check email availability
  useEffect(() => {
    const checkEmail = async () => {
      if (!email) return;
      
      try {
        const response = await axios.post('/api/userAuthenticate', { email },{
          headers:{
            "Content-Type":"application/json"
          }
        });
        if (response.status === 200) {
          setEmailError('This email is already registered');
        } else {
          setEmailError('');
        }
      } catch (error) {
        // Silently handle 500 errors
        setEmailError('');
      }
    };

    const timeoutId = setTimeout(checkEmail, 500);
    return () => clearTimeout(timeoutId);
  }, [email]);

  // Check phone availability
  useEffect(() => {
    const checkPhone = async () => {
      if (!phone) return;
      
      try {
        const response = await axios.post('/api/userAuthenticate', { phone },{
          headers:{
            "Content-Type":"application/json"
          }
        });
        if (response.status === 200) {
          setPhoneError('This phone number is already registered');
        } else {
          setPhoneError('');
        }
      } catch (error) {
        // Silently handle 500 errors
        setPhoneError('');
      }
    };

    const timeoutId = setTimeout(checkPhone, 500);
    return () => clearTimeout(timeoutId);
  }, [phone]);

  const onSubmit = async (data: UserSigninSchema) => {
    if (emailError || phoneError) {
      return;
    }
    
    try {
      setServerError(null);
      await onSignUp(data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setServerError(error.response?.data?.message || 'Something went wrong');
      }
    }
  };

  // Rest of your existing component code remains exactly the same
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Create an account</CardTitle>
          <CardDescription className="text-center">
            Enter your details below to create your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  id="username"
                  type='text'
                  {...register('username')}
                  className="pl-9"
                  placeholder="JohnDoe"
                />
              </div>
              {errors.username && (
                <p className="text-sm text-red-500 mt-1">{errors.username.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  className="pl-9"
                  placeholder="example@gmail.com"
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
              {emailError && (
                <p className="text-sm text-red-500 mt-1">{emailError}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  id="phone"
                  type="tel"
                  {...register('phone')}
                  className="pl-9"
                  placeholder="1234567890"
                />
              </div>
              {errors.phone && (
                <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>
              )}
              {phoneError && (
                <p className="text-sm text-red-500 mt-1">{phoneError}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  {...register('password')}
                  className="pl-9"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <div className="space-y-1 mt-1">
                  <p className="text-sm text-red-500">{errors.password.message}</p>
                  <ul className="text-xs text-gray-500 list-disc pl-4">
                    <li>At least 8 characters long</li>
                    <li>One uppercase letter</li>
                    <li>One lowercase letter</li>
                    <li>One number</li>
                    <li>One special character</li>
                  </ul>
                </div>
              )}
            </div>

            {serverError && (
              <div className="text-sm text-red-500 bg-red-50 p-3 rounded-md">
                {serverError}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full"
              disabled={isSubmitting || !!emailError || !!phoneError}
            >
              {isSubmitting ? "Creating Account..." : "Create Account"}
            </Button>

            <div className="text-center text-sm text-gray-500">
              Already have an account?{" "}
              <Link href="/auth/login" className="font-medium text-blue-600 hover:underline">
                Log in
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignUp;