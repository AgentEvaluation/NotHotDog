'use client';

import { SignIn } from "@clerk/nextjs";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";

export default function LoginPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push('/tools');
    }
  }, [isSignedIn, isLoaded, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-orange-500">NotHotDog</h1>
        <p className="mt-2 text-muted-foreground">AI Evaluation Platform</p>
      </div>
      
      <div className="w-full max-w-md">
        <SignIn appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "bg-card border border-border shadow-md",
            headerTitle: "text-foreground",
            headerSubtitle: "text-muted-foreground",
            formButtonPrimary: "bg-primary text-primary-foreground hover:bg-primary/90",
            formFieldLabel: "text-foreground",
            formFieldInput: "bg-background border-input",
            footerActionLink: "text-primary hover:text-primary/90",
          }
        }} />
      </div>
    </div>
  );
}