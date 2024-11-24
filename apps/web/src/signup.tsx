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
  const [isCheckingUser, setIsCheckingUser] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty, dirtyFields },
    watch,
    trigger,
  } = useForm<UserSigninSchema>({
    resolver: zodResolver(userSigninSchema),
    mode: 'all',
    criteriaMode: 'all',
    shouldFocusError: true,
    delayError: 500
  });

  const email = watch('email');
  const phone = watch('phone');
  const password = watch('password');
  const username = watch('username');

  // Debounce function
  const debounce = (func: Function, wait: number) => {
    let timeout: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  // Check if user exists
  const checkUserExists = async (email: string | null, phone: string | null) => {
    if (!email && !phone) return;
    
    setIsCheckingUser(true);
    try {
      const response = await axios.post('/api/userAuthenticate', {
        email,
        phone
      });

      if (response.status === 200) {
        if (email) {
          setEmailError('This email is already registered');
        }
        if (phone) {
          setPhoneError('This phone number is already registered');
        }
      }
    } catch (error) {
      // If user doesn't exist, clear the errors
      if (email) setEmailError('');
      if (phone) setPhoneError('');
    } finally {
      setIsCheckingUser(false);
    }
  };

  // Debounced version of checkUserExists
  const debouncedCheckUser = debounce(checkUserExists, 500);

  // Validate and check email
  const validateAndCheckEmail = async () => {
    if (!email) return;
    
    // Trigger zod validation for email
    const emailResult = await trigger('email');
    
    // Only check for existing user if zod validation passes
    if (emailResult && !errors.email) {
      debouncedCheckUser(email, null);
    } else {
      setEmailError(''); // Clear existing user error if validation fails
    }
  };

  // Validate and check phone
  const validateAndCheckPhone = async () => {
    if (!phone) return;
    
    // Trigger zod validation for phone
    const phoneResult = await trigger('phone');
    
    // Only check for existing user if zod validation passes
    if (phoneResult && !errors.phone) {
      debouncedCheckUser(null, phone);
    } else {
      setPhoneError(''); // Clear existing user error if validation fails
    }
  };

  useEffect(() => {
    validateAndCheckEmail();
  }, [email]);

  useEffect(() => {
    validateAndCheckPhone();
  }, [phone]);

  // Show validation errors only when field is dirty and not empty
  const shouldShowError = (field: keyof UserSigninSchema) => {
    const value = watch(field);
    return dirtyFields[field] && value && value.length > 0 && errors[field];
  };

  useEffect(() => {
    const validateField = async () => {
      if (password) await trigger('password');
      if (username) await trigger('username');
    };
    validateField();
  }, [password, username, trigger]);

  const onSubmit = async (data: UserSigninSchema) => {
    if (emailError || phoneError) {
      return; // Prevent submission if user already exists
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

  const handleFieldBlur = async (fieldName: keyof UserSigninSchema) => {
    await trigger(fieldName);
    if (fieldName === 'email') {
      validateAndCheckEmail();
    } else if (fieldName === 'phone') {
      validateAndCheckPhone();
    }
  };

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
              <Label htmlFor="username">Admin Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  id="username"
                  className={`pl-9 ${shouldShowError('username') ? 'border-red-500' : ''}`}
                  placeholder="JohnDoe"
                  {...register('username', {
                    required: true,
                    onBlur: () => handleFieldBlur('username')
                  })}
                />
              </div>
              {shouldShowError('username') && (
                <p className="text-sm text-red-500 mt-1">{errors.username?.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  className={`pl-9 ${(shouldShowError('email') || emailError) ? 'border-red-500' : ''}`}
                  placeholder="example@gmail.com"
                  {...register('email', {
                    required: true,
                    onBlur: () => handleFieldBlur('email')
                  })}
                />
                {isCheckingUser && email && !errors.email && (
                  <span className="absolute right-3 top-2.5 text-gray-400">Checking...</span>
                )}
              </div>
              {(shouldShowError('email') || emailError) && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.email?.message || emailError}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  id="phone"
                  type="tel"
                  className={`pl-9 ${(shouldShowError('phone') || phoneError) ? 'border-red-500' : ''}`}
                  placeholder="1234567890"
                  {...register('phone', {
                    required: true,
                    onBlur: () => handleFieldBlur('phone')
                  })}
                />
                {isCheckingUser && phone && !errors.phone && (
                  <span className="absolute right-3 top-2.5 text-gray-400">Checking...</span>
                )}
              </div>
              {(shouldShowError('phone') || phoneError) && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.phone?.message || phoneError}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className={`pl-9 ${shouldShowError('password') ? 'border-red-500' : ''}`}
                  placeholder="Enter your password"
                  {...register('password', {
                    required: true,
                    onBlur: () => handleFieldBlur('password')
                  })}
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
              {shouldShowError('password') ? (
                <div>
                  <p className="text-sm text-red-500 mt-1">{errors.password?.message}</p>
                  <ul className="text-xs text-gray-500 list-disc pl-4 mt-1">
                    <li>At least 8 characters long</li>
                    <li>One uppercase letter</li>
                    <li>One lowercase letter</li>
                    <li>One number</li>
                    <li>One special character</li>
                  </ul>
                </div>
              ):('')}
            </div>

            {serverError && (
              <div className="text-sm text-red-500 bg-red-50 p-3 rounded-md">
                {serverError}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full"
              disabled={isSubmitting || !!emailError || !!phoneError || !isDirty || isCheckingUser}
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
