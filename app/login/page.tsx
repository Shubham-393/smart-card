"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { School } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation"; // For Next.js 13 and above
import { db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

export default function LoginPage() {
  const [userType, setUserType] = useState<"parent" | "vendor">("vendor");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      // Query Firestore for user with matching email and password
      const userCollection = userType === "vendor" ? "vendors" : "parents";
      const usersRef = collection(db, userCollection);
      const q = query(
        usersRef,
        where("email", "==", email),
        where("password", "==", password)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError("Invalid email or password.");
        return;
      }

      // Store user data in localStorage for session management
      const userData = querySnapshot.docs[0].data();
      localStorage.setItem('userData', JSON.stringify({
        ...userData,
        userType,
        uid: querySnapshot.docs[0].id
      }));

      // Redirect based on user type
      router.push(userType === "vendor" ? "/vendor-dashboard" : "/parent-dashboard");
    } catch (error: any) {
      console.error("Error logging in:", error);
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/30 px-4">
      <Card className="w-full max-w-md p-8">
        <div className="flex flex-col items-center space-y-2 mb-8">
          <School className="h-12 w-12 text-primary" />
          <h1 className="text-2xl font-bold text-center">Welcome Back</h1>
          <p className="text-muted-foreground text-center">
            Sign in to your Smart Campus Pay account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="userType">I am a</Label>
            <Select
              value={userType}
              onValueChange={(value: "parent" | "vendor") => setUserType(value)}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select user type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="parent">Parent</SelectItem>
                <SelectItem value="vendor">Vendor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="example@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <Button type="submit" className="w-full">
            Sign In
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <Link href="/forgot-password" className="text-primary hover:underline">
            Forgot your password?
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t text-center text-sm">
          <p className="text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}
