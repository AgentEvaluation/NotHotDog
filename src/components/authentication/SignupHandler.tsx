'use client'

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";

export default function SignupHandler() {
  const { isSignedIn, user } = useUser();
  // Add state to track if we've already processed this user
  const [hasProcessed, setHasProcessed] = useState(false);

  useEffect(() => {
    const callSignupAPI = async () => {
      try {
        // Only proceed if user is signed in AND we haven't processed yet
        if (isSignedIn && user && user.id && !hasProcessed) {
          const createdAt = user.createdAt?.getTime();
          const lastSignInAt = user.lastSignInAt?.getTime();
    
          if (createdAt && lastSignInAt) {
            const createdAtSec = Math.floor(createdAt / 1000);
            const lastSignInAtSec = Math.floor(lastSignInAt / 1000);
    
            const isNewUser = createdAtSec === lastSignInAtSec;
    
            if (isNewUser) {
              // Set this flag right away to prevent future calls
              setHasProcessed(true);
              
              const payload = {
                clerkId: user.id,
                orgName: user.firstName + `'s organization` || "Default Organization",
                orgDescription: "Default organization",
                role: "admin",
                status: "active",
              };
              
              const res = await fetch("/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
              });
              
              if (!res.ok) {
                const errorData = await res.json();
                console.error(errorData.error || "Failed to call signup API");
                return;
              }
              
              await res.json();
              console.log("User signed up successfully");
            } else {
              // Not a new user, so mark as processed
              setHasProcessed(true);
            }
          }
        }
      } catch (error) {
        // Even on error, mark as processed to prevent infinite loops
        setHasProcessed(true);
        console.error("Error in signup process:", error);
      }
    };
    
    callSignupAPI();
  }, [isSignedIn, user, hasProcessed]); // Add hasProcessed to dependency array

  return null;
}