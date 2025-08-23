'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Eye, EyeOff, X } from "lucide-react";
import Link from "next/link";

interface AuthenticateProps {
  onSuccess?: () => void;
  onClose?: () => void;
}

// Logo component for the auth dialog
const Logo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    fill="currentColor"
    height="48"
    viewBox="0 0 40 48"
    width="40"
    {...props}
  >
    <clipPath id="a">
      <path d="m0 0h40v48h-40z" />
    </clipPath>
    <g clipPath="url(#a)">
      <path d="m25.0887 5.05386-3.933-1.05386-3.3145 12.3696-2.9923-11.16736-3.9331 1.05386 3.233 12.0655-8.05262-8.0526-2.87919 2.8792 8.83271 8.8328-10.99975-2.9474-1.05385625 3.933 12.01860625 3.2204c-.1376-.5935-.2104-1.2119-.2104-1.8473 0-4.4976 3.646-8.1436 8.1437-8.1436 4.4976 0 8.1436 3.646 8.1436 8.1436 0 .6313-.0719 1.2459-.2078 1.8359l10.9227 2.9267 1.0538-3.933-12.0664-3.2332 11.0005-2.9476-1.0539-3.933-12.0659 3.233 8.0526-8.0526-2.8792-2.87916-8.7102 8.71026z" />
      <path d="m27.8723 26.2214c-.3372 1.4256-1.0491 2.7063-2.0259 3.7324l7.913 7.9131 2.8792-2.8792z" />
      <path d="m25.7665 30.0366c-.9886 1.0097-2.2379 1.7632-3.6389 2.1515l2.8794 10.746 3.933-1.0539z" />
      <path d="m21.9807 32.2274c-.65.1671-1.3313.2559-2.0334.2559-.7522 0-1.4806-.102-2.1721-.2929l-2.882 10.7558 3.933 1.0538z" />
      <path d="m17.6361 32.1507c-1.3796-.4076-2.6067-1.1707-3.5751-2.1833l-7.9325 7.9325 2.87919 2.8792z" />
      <path d="m13.9956 29.8973c-.9518-1.019-1.6451-2.2826-1.9751-3.6862l-10.95836 2.9363 1.05385 3.933z" />
    </g>
  </svg>
);

const Authenticate = ({ onSuccess, onClose }: AuthenticateProps = {}) => {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const createUserProfile = async (userId: string, email: string) => {
    try {
      const username = email.split('@')[0];
      const { error } = await supabase.from('profiles').upsert([
        {
          id: userId,
          username: username,
          full_name: username,
          avatar_url: '',
          images_generated: 0,
          paid: false,
          subscription_id: ''
        }
      ], {
        onConflict: 'id'
      });

      if (error) {
        console.error('Error creating profile:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "🔴 Missing fields",
        description: "Please fill in all fields.",
      });
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/app`
        }
      });

      if (error) {
        toast({
          title: "🔴 Error signing up",
          description: error.message,
        });
      } else if (data?.user) {
        await createUserProfile(data.user.id, email);
        toast({
          title: "✉️ Check your email",
          description: "We've sent you a verification link.",
        });
        
        // If email confirmation is not required, call onSuccess or redirect
        if (data.session) {
          if (onSuccess) {
            // Don't set isLoading to false here, let the parent component handle it
            onSuccess();
          } else {
            // Keep loading state active during redirect
            router.push('/app');
            // Don't set isLoading to false here as we want to show loading during redirect
            return; // Skip the finally block to keep loading state active
          }
        }
      }
    } catch (error) {
      console.error('Sign up error:', error);
      toast({
        title: "🔴 Something went wrong",
        description: "Please try again.",
      });
    } finally {
      // Only set loading to false if we haven't redirected
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "🔴 Missing fields",
        description: "Please fill in all fields.",
      });
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        toast({
          title: "🔴 Error signing in",
          description: error.message,
        });
        return;
      }

      if (!data?.user) {
        toast({
          title: "🔴 Error signing in",
          description: "User not found.",
        });
        return;
      }

      // Create or update profile
      await createUserProfile(data.user.id, email);

      toast({
        title: "✅ Success",
        description: "Successfully signed in!",
      });

      // Keep loading state active during redirect
      // Call onSuccess callback if provided, otherwise redirect
      if (onSuccess) {
        // Don't set isLoading to false here, let the parent component handle it
        onSuccess();
      } else {
        // Redirect to app - loading state will remain active during redirect
        router.push('/app');
        // Don't set isLoading to false here as we want to show loading during redirect
        return; // Skip the finally block to keep loading state active
      }
    } catch (error) {
      console.error('Sign in error:', error);
      toast({
        title: "🔴 Something went wrong",
        description: "Please try again.",
      });
    } finally {
      // Only set loading to false if we haven't redirected
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto border-none shadow-lg pb-0 relative">
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-2 h-8 w-8 z-10"
        onClick={onClose || (() => console.log('Close button clicked, but no onClose handler provided'))}
        type="button"
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </Button>
      <CardHeader className="flex flex-col items-center space-y-1.5 pb-4 pt-6">
        <Logo className="w-12 h-12" />
        <div className="space-y-0.5 flex flex-col items-center">
          <h2 className="text-2xl font-semibold text-foreground text-center">
            Sign in or create an account
          </h2>
          <p className="text-sm text-muted-foreground text-center">
            Sign in to get more free generations and unlock premium features.
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 px-8">
        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="signin" className="space-y-4">
            <form onSubmit={handleSignIn}>
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email address</Label>
                  <Input
                    id="signin-email"
                    placeholder="name@example.com"
                    type="email"
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect="off"
                    disabled={isLoading}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="signin-password">Password</Label>
                    <Link href="#" className="text-sm text-primary hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input
                      id="signin-password"
                      className="pr-10"
                      type={showPassword ? "text" : "password"}
                      disabled={isLoading}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="remember" 
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked === true)}
                  />
                  <Label htmlFor="remember" className="text-sm font-normal">
                    Remember me
                  </Label>
                </div>
                
                <Button className="w-full" type="submit" disabled={isLoading}>
                  {isLoading && (
                    <span className="mr-2 inline-block animate-spin">
                      <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </span>
                  )}
                  Sign In
                </Button>
                
                {/* SSO button removed per request */}
              </div>
            </form>
          </TabsContent>
          
          <TabsContent value="signup" className="space-y-4">
            <form onSubmit={handleSignUp}>
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email address</Label>
                  <Input
                    id="signup-email"
                    placeholder="name@example.com"
                    type="email"
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect="off"
                    disabled={isLoading}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="signup-password"
                      className="pr-10"
                      type={showPassword ? "text" : "password"}
                      disabled={isLoading}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox id="terms" />
                  <label htmlFor="terms" className="text-sm text-muted-foreground">
                    I agree to the{" "}
                    <Link href="#" className="text-primary hover:underline">
                      Terms
                    </Link>{" "}
                    and{" "}
                    <Link href="#" className="text-primary hover:underline">
                      Conditions
                    </Link>
                  </label>
                </div>
                
                <Button className="w-full" type="submit" disabled={isLoading}>
                  {isLoading && (
                    <span className="mr-2 inline-block animate-spin">
                      <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </span>
                  )}
                  Create Account
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-center border-t !py-4">
        <p className="text-center text-sm text-muted-foreground">
          {/* Dynamic text based on active tab */}
          <span id="auth-footer-text">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </span>
        </p>
      </CardFooter>
    </Card>
  );
}

export default Authenticate;
