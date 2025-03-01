// components/user-dropdown.tsx
"use client";

import { useUser, SignOutButton } from "@clerk/clerk-react";
import { 
  CreditCard, 
  LogOut, 
  Settings, 
  User, 
  Star, 
  ChevronUp,
  Zap,
  Crown,
  Home
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import toast from "react-hot-toast";

export const UserDropdown = () => {
  const router = useRouter();
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const createSubscriptionSession = useAction(api.stripe.createSubscriptionSession);

  const documents = useQuery(api.documents.getSidebar, {
    parentDocument: undefined
  });
  
  const profiles = useQuery(api.profiles.getSidebar, {
    parentProfile: undefined
  });
  
  const events = useQuery(api.events.getSidebar, {
    // Assuming events has the same pattern as documents and profiles
  });
  
  // Get subscription info
  const subscription = useQuery(api.users.getUserSubscription, {
    clerkId: user?.id ?? ""
  });

  // Calculate usage
  const totalAllowed = subscription?.tier === "pro" ? 10 : subscription?.tier === "enterprise" ? Infinity : 5;
  const currentUsage = (documents?.length ?? 0) + (profiles?.length ?? 0) + (events?.length ?? 0);
  const usagePercentage = totalAllowed === Infinity ? 0 : (currentUsage / totalAllowed) * 100;

  // Determine color based on usage
  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return "bg-red-500";
    if (percentage >= 70) return "bg-orange-300";
    return "bg-gray-300";
  };

  const handleSubscription = async () => {
    try {
      setIsLoading(true);
      
      if (!user?.id) {
        toast.error("Please log in to manage your subscription");
        return;
      }
      
      // Determine which plan to subscribe to
      let targetTier;
      let priceId;
      
      if (!subscription?.tier || subscription.tier === "free") {
        targetTier = "pro";
        priceId = process.env.NEXT_PUBLIC_STRIPE_STANDARD_PRICE_ID;
      } else if (subscription.tier === "pro") {
        targetTier = "enterprise";
        priceId = process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID;
      } else {
        // Already on enterprise - manage subscription
        router.push('/settings');
        setIsLoading(false);
        return;
      }
      
      const checkoutUrl = await createSubscriptionSession({
        userId: user.id,
        priceId: priceId!,
        tier: targetTier
      });
      
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        toast.error("Failed to create checkout session");
      }
    } catch (error) {
      console.error('Subscription error:', error);
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex items-center p-3 w-full hover:bg-primary/5 rounded-lg cursor-pointer">
          <div className="gap-x-2 flex items-center w-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.imageUrl} />
              <AvatarFallback>
                {user?.firstName?.charAt(0)}
                {user?.lastName?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col flex-1 items-center">
              {subscription?.tier === "pro" && (
                <div className="px-4 py-0.5 rounded-full text-xs text-[#FD8C66] border border-[#FD8C66] font-medium text-center">
                  Pro Plan
                </div>
              )}
              {subscription?.tier === "enterprise" && (
                <div className="px-4 py-0.5 rounded-full text-xs text-[#10B981] border border-[#10B981] font-medium text-center">
                  Enterprise Plan
                </div>
              )}
              <span className="text-sm font-medium mt-1">
                {user?.fullName ?? user?.username}
              </span>
            </div>
          </div>
          <ChevronUp className="h-4 w-4 ml-2 text-muted-foreground" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-60" 
        align="start" 
        alignOffset={11}
        sideOffset={8}
        side="top"
      >
        <div className="flex flex-col space-y-4 p-2">
          {/* Commented out Sites Used section with progress bar
          <div className="space-y-1">
            <DropdownMenuLabel>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Sites Used</span>
                <span className="text-sm text-muted-foreground">
                  {currentUsage} / {totalAllowed === Infinity ? "∞" : totalAllowed}
                </span>
              </div>
            </DropdownMenuLabel>
            
            {totalAllowed !== Infinity && (
              <Progress 
                value={usagePercentage} 
                className={cn(
                  "h-2",
                  getProgressColor(usagePercentage)
                )}
              />
            )}
          </div>
          */}
          
          <div className="px-2 py-1.5 text-sm">
            <div className="font-medium mb-1 text-xs">
              {subscription?.tier === "enterprise" ? "Enterprise Plan" : 
               subscription?.tier === "pro" ? "Pro Plan" : "Free Plan"}
            </div>
            <div className="text-muted-foreground text-xs mb-2">
              {subscription?.tier === "enterprise" ? "Unlimited sites" : 
               subscription?.tier === "pro" ? "10 sites/month" : 
               "5 sites only"}
            </div>
            
            <Button
              onClick={handleSubscription}
              className={cn(
                "w-full mt-1 text-white text-xs px-2 py-1 h-8",
                subscription?.tier === "enterprise" 
                  ? "bg-[#10B981] hover:bg-[#33c695]" 
                  : subscription?.tier === "pro"
                  ? "bg-[#F8494D] hover:bg-[#e03c40]"
                  : "bg-[#FD8C66] hover:bg-[#e67e5a]"
              )}
              disabled={isLoading}
            >
              <CreditCard className="mr-1 h-3 w-3" />
              {isLoading ? "Loading..." : 
               subscription?.tier === "enterprise" 
                 ? "Manage Subscription" 
                 : subscription?.tier === "pro"
                 ? "Upgrade to Enterprise"
                 : "Upgrade to Pro"}
            </Button>
          </div>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => router.push("/homepage")}>
              <Home className="h-4 w-4 mr-2" />
              Homepage
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/profile")}>
              <User className="h-4 w-4 mr-2" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/settings")}>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </DropdownMenuItem>
          </DropdownMenuGroup>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem
            className="text-black cursor-pointer"
            asChild
          >
            <SignOutButton>
              <div className="flex items-center">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </div>
            </SignOutButton>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};