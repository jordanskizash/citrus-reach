// components/subscription/plan-cards.tsx
"use client";

import { useUser } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Check, CreditCard, Star, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import planDescriptions from "./plan-descriptions";

interface PlanCardsProps {
  currentPlan?: string;
}

export const PlanCards = ({ currentPlan = "free" }: PlanCardsProps) => {
  const { user } = useUser();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const createSubscriptionSession = useAction(api.stripe.createSubscriptionSession);

  // Define the Pro and Enterprise colors as CSS variables
  const proColor = "#FD8C66";
  const enterpriseColor = "#F8494D";

  const handleSubscribe = async (tier: string) => {
    try {
      setIsLoading(true);
      
      if (!user?.id) {
        toast.error("Please log in to subscribe");
        return;
      }

      let priceId;
      if (tier === "pro") {
        priceId = process.env.NEXT_PUBLIC_STRIPE_STANDARD_PRICE_ID;
      } else if (tier === "enterprise") {
        priceId = process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID;
      } else {
        toast.error("Invalid plan selected");
        return;
      }

      const checkoutUrl = await createSubscriptionSession({
        userId: user.id,
        priceId: priceId!,
        tier
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
    <div className="w-full grid grid-cols-3 gap-3 py-2">
      {/* Free Plan */}
      <div className={cn(
        "rounded-lg border p-4 shadow-sm",
        currentPlan === "free" && "border-2 border-gray-400"
      )}>
        <div className="flex flex-col h-full">
          <div>
            <h3 className="text-lg font-bold">Free Plan</h3>
            <div className="mt-2 flex items-baseline gap-x-1">
              <span className="text-3xl font-bold tracking-tight">$0</span>
              <span className="text-xs text-muted-foreground">/month</span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {planDescriptions.free.tagline}
            </p>
          </div>
          
          <div className="mt-3 flex-1">
            <p className="text-xs font-medium mb-2">
              {planDescriptions.free.description}
            </p>
            <ul className="space-y-1">
              {planDescriptions.free.features.map((feature) => (
                <li key={feature} className="flex items-start gap-x-1.5 text-xs">
                  <Check className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="mt-4">
            <Button
              onClick={() => handleSubscribe("pro")}
              disabled={isLoading || currentPlan !== "free"}
              className="w-full text-xs py-1 h-auto bg-gray-500 hover:bg-gray-600"
              variant="default"
            >
              <CreditCard className="mr-1 h-3 w-3" />
              {isLoading ? "Loading..." : 
               currentPlan === "free" ? "Upgrade Now" : 
               "Current Plan"}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Pro Plan */}
      <div className={cn(
        "rounded-lg border-2 p-4 shadow-md relative",
        currentPlan === "pro" 
          ? "border-[#FD8C66]" 
          : "border-orange-200"
      )}>
        {currentPlan !== "pro" && (
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 px-2 py-0.5 rounded-full text-xs font-medium text-white" style={{ backgroundColor: proColor }}>
            Recommended
          </div>
        )}
        
        <div className="flex flex-col h-full">
          <div className="flex items-center">
            <h3 className="text-lg font-bold">Pro Plan</h3>
            <Star className="h-4 w-4 ml-1" style={{ color: proColor }} />
          </div>
          <div className="mt-2 flex items-baseline gap-x-1">
            <span className="text-3xl font-bold tracking-tight">$10</span>
            <span className="text-xs text-muted-foreground">/month</span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {planDescriptions.pro.tagline}
          </p>
          
          <div className="mt-3 flex-1">
            <p className="text-xs font-medium mb-2">
              {planDescriptions.pro.description}
            </p>
            <ul className="space-y-1">
              {planDescriptions.pro.features.map((feature) => (
                <li key={feature} className="flex items-start gap-x-1.5 text-xs">
                  <Check className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="mt-4">
            <Button
              onClick={() => currentPlan === "pro" ? handleSubscribe("enterprise") : handleSubscribe("pro")}
              disabled={isLoading}
              className="w-full text-xs py-1 h-auto text-white"
              style={{ backgroundColor: proColor }}
            >
              <CreditCard className="mr-1 h-3 w-3" />
              {isLoading ? "Loading..." : 
               currentPlan === "pro" ? "Upgrade to Enterprise" : 
               "Get Pro"}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Enterprise Plan */}
      <div className={cn(
        "rounded-lg border p-4 shadow-sm",
        currentPlan === "enterprise" && "border-2 border-[#F8494D]"
      )}>
        <div className="flex flex-col h-full">
          <div className="flex items-center">
            <h3 className="text-lg font-bold">Enterprise Plan</h3>
            <Crown className="h-4 w-4 ml-1" style={{ color: enterpriseColor }} />
          </div>
          <div className="mt-2 flex items-baseline gap-x-1">
            <span className="text-3xl font-bold tracking-tight">$20</span>
            <span className="text-xs text-muted-foreground">/month</span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {planDescriptions.enterprise.tagline}
          </p>
          
          <div className="mt-3 flex-1">
            <p className="text-xs font-medium mb-2">
              {planDescriptions.enterprise.description}
            </p>
            <ul className="space-y-1">
              {planDescriptions.enterprise.features.map((feature) => (
                <li key={feature} className="flex items-start gap-x-1.5 text-xs">
                  <Check className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="mt-4">
            <Button
              onClick={() => handleSubscribe("enterprise")}
              disabled={isLoading || currentPlan === "enterprise"}
              className="w-full text-xs py-1 h-auto text-white"
              style={{ backgroundColor: enterpriseColor }}
            >
              <CreditCard className="mr-1 h-3 w-3" />
              {isLoading ? "Loading..." : 
               currentPlan === "enterprise" ? "Current Plan" : 
               "Get Enterprise"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanCards;