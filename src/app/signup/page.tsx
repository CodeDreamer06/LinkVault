'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from '@/lib/supabaseClient';

const SignupPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSignup = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email,
        password: password,
        // Optional: Add options like redirect URL or metadata
        // options: {
        //   emailRedirectTo: `${window.location.origin}/auth/callback`,
        // }
      });

      if (signUpError) {
        throw signUpError;
      }

      // Check if email confirmation is required (Supabase default)
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        // This case might happen if email confirmation is disabled, handle appropriately
        setMessage('Signup successful! You can now log in.');
        // Optionally redirect or clear form
      } else if (data.session === null && data.user) {
         setMessage('Signup successful! Check your email for the verification link.');
      } else {
          setMessage('Signup successful! You can now log in.'); // Or handle other cases
      }
      // Clear form fields on success
      setEmail('');
      setPassword('');

    } catch (err) {
      console.error("Error signing up:", err);
      setError(err.message || 'An unexpected error occurred during sign up.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">Sign Up</CardTitle>
          <CardDescription>
            Enter your information to create an account
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSignup}>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                aria-label="Email address"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                aria-label="Password"
                // Consider adding password strength requirements/feedback
              />
            </div>
            {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
            {message && <p className="text-sm text-green-600" role="status">{message}</p>}
          </CardContent>
          <CardFooter className="flex-col items-start gap-4">
            <Button type="submit" className="w-full" disabled={loading} aria-live="polite">
              {loading ? 'Creating account...' : 'Create account'}
            </Button>
             <div className="mt-4 text-center text-sm w-full">
              Already have an account?{" "}
              <Link href="/login" className="underline">
                Login
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default SignupPage; 