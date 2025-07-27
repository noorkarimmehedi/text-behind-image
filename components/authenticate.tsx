'use client';

import { useState } from "react";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, AlertDialogCancel } from "./ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useSupabaseClient } from "@supabase/auth-helpers-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from "next/navigation"

const Authenticate = () => {
  const router = useRouter()
  const supabase = useSupabaseClient()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const createUserProfile = async (userId: string, email: string) => {
    try {
      const username = email.split('@')[0]
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
      })

      if (error) {
        console.error('Error creating profile:', error)
        throw error
      }
    } catch (error) {
      console.error('Error creating user profile:', error)
      throw error
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast({
        title: "🔴 Missing fields",
        description: "Please fill in all fields.",
      })
      return
    }

    try {
      setIsLoading(true)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/app`
        }
      })

      if (error) {
        toast({
          title: "🔴 Error signing up",
          description: error.message,
        })
      } else if (data?.user) {
        await createUserProfile(data.user.id, email)
        toast({
          title: "✉️ Check your email",
          description: "We've sent you a verification link.",
        })
      }
    } catch (error) {
      console.error('Sign up error:', error)
      toast({
        title: "🔴 Something went wrong",
        description: "Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast({
        title: "🔴 Missing fields",
        description: "Please fill in all fields.",
      })
      return
    }

    try {
      setIsLoading(true)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        toast({
          title: "🔴 Error signing in",
          description: error.message,
        })
        return
      }

      if (!data?.user) {
        toast({
          title: "🔴 Error signing in",
          description: "User not found.",
        })
        return
      }

      // Create or update profile
      await createUserProfile(data.user.id, email)

      toast({
        title: "✅ Success",
        description: "Successfully signed in!",
      })

      // Redirect to app
      window.location.href = '/app'
    } catch (error) {
      console.error('Sign in error:', error)
      toast({
        title: "🔴 Something went wrong",
        description: "Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AlertDialog defaultOpen>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Sign in or create an account</AlertDialogTitle>
          <AlertDialogDescription>
            Sign in to get more free generations and unlock premium features.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          <TabsContent value="signin" className="space-y-4">
            <form onSubmit={handleSignIn}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
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
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    disabled={isLoading}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <Button disabled={isLoading}>
                  {isLoading && (
                    <span className="mr-2">
                      Loading...
                    </span>
                  )}
                  Sign In
                </Button>
              </div>
            </form>
          </TabsContent>
          <TabsContent value="signup" className="space-y-4">
            <form onSubmit={handleSignUp}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
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
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    disabled={isLoading}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <Button disabled={isLoading}>
                  {isLoading && (
                    <span className="mr-2">
                      Loading...
                    </span>
                  )}
                  Sign Up
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
        <AlertDialogCancel>Continue as guest</AlertDialogCancel>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default Authenticate;
