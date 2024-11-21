// app/debug/page.tsx
"use client";

import { useUser } from "@clerk/clerk-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function DebugPage() {
  const { user } = useUser();
  const userDetails = useQuery(api.users.getUserByClerkId, {
    clerkId: user?.id ?? ""
  });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Debug Information</h1>
      
      <div className="space-y-4">
        <div className="bg-gray-100 p-4 rounded-lg">
          <h2 className="font-semibold mb-2">User Information</h2>
          <pre className="whitespace-pre-wrap">
            {JSON.stringify({
              clerkId: user?.id,
              email: user?.emailAddresses[0]?.emailAddress,
              credits: userDetails?.credits,
              lastUpdated: userDetails?.updatedAt ? 
                new Date(userDetails.updatedAt).toLocaleString() : 
                'Never'
            }, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}