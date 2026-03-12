"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, HeartPulse, Zap } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function fillDemo() {
    setEmail("demo@voiceai.com");
    setPassword("password123");
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-gray-200 bg-white shadow-xl">
      <CardHeader className="space-y-1 text-center">
        <div className="flex justify-center mb-4">
          <div className="p-3 rounded-full bg-gray-900">
            <HeartPulse className="h-8 w-8 text-white" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold text-gray-900">Welcome back</CardTitle>
        <CardDescription className="text-gray-500">
          Sign in to MedVoice AI Platform
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {/* Demo account hint */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2.5">
            <Zap className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-800">
              <p className="font-semibold mb-1">Demo Account</p>
              <p>Email: <code className="font-mono bg-amber-100 px-1 rounded">demo@voiceai.com</code></p>
              <p>Password: <code className="font-mono bg-amber-100 px-1 rounded">password123</code></p>
              <button
                type="button"
                onClick={fillDemo}
                className="mt-1.5 text-amber-700 underline underline-offset-2 hover:text-amber-900 font-medium"
              >
                Click to fill automatically →
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-700">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@healthcare.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-700">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 mt-2">
          <Button
            type="submit"
            className="w-full bg-gray-900 hover:bg-gray-800 text-white"
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sign In
          </Button>
          <p className="text-sm text-gray-500 text-center">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-gray-700 hover:text-gray-900 font-medium">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
