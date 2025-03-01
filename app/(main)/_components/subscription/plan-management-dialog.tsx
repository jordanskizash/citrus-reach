// components/subscription/plan-management-dialog.tsx
"use client";

import * as React from "react";
import { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAction } from "convex/react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Check, CreditCard, Star, Crown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import planDescriptions from "./plan-descriptions";

// Define props
interface PlanManagementDialogProps {
  trigger?: React.ReactNode;
}

export function PlanManagementDialog({ trigger }: PlanManagementDialogProps) {
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("change-plan");
  const [isLoading, setIsLoading] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);

  // Get subscription info
  const subscription = useQuery(api.users.getUserSubscription, {
    clerkId: user?.id ?? ""
  });

  // Actions
  const createSubscriptionSession = useAction(api.stripe.createSubscriptionSession);
  
  // We need to create this action in your Stripe API
  const cancelSubscription = useAction(api.stripe.cancelSubscription);

  const currentPlan = subscription?.tier ?? "free";
  
  // Define the Pro and Enterprise colors
  const proColor = "#FD8C66";  // Orange/Coral
  const enterpriseColor = "#10B981";  // Emerald green

  // Format date helper
  const formatDate = (timestamp?: number) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  // Handle plan change
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

  // Handle subscription cancellation
  const handleCancelSubscription = async () => {
    try {
      setIsLoading(true);
      
      // Add a type check to handle the case where subscriptionId might be undefined
      const subscriptionId = subscription?.subscriptionId;
      
      if (!user?.id || !subscriptionId) {
        toast.error("No active subscription found");
        return;
      }
  
      // Call the Stripe API to cancel the subscription
      await cancelSubscription({
        subscriptionId
      });
      
      toast.success("Your subscription has been cancelled. You'll have access until the end of your billing period.");
      setOpen(false);
    } catch (error) {
      console.error('Cancellation error:', error);
      toast.error("Failed to cancel subscription");
    } finally {
      setIsLoading(false);
      setConfirmCancel(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-1">
            Manage Subscription
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Your Subscription</DialogTitle>
          <DialogDescription>
            View, change, or cancel your subscription plan.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="change-plan" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="change-plan">Change Plan</TabsTrigger>
            <TabsTrigger value="cancel" disabled={currentPlan === "free"}>
              Cancel Subscription
            </TabsTrigger>
          </TabsList>

          <TabsContent value="change-plan" className="space-y-4 py-4">
            <div className="mb-4">
              <h3 className="text-sm font-medium mb-2">Current Plan</h3>
              <div className="bg-muted/50 p-3 rounded-md flex justify-between items-center">
                <div className="flex items-center">
                  {currentPlan === "pro" && (
                    <>
                      <Star className="h-4 w-4 mr-2" style={{ color: proColor }} />
                      <span className="font-medium">Pro Plan</span>
                    </>
                  )}
                  {currentPlan === "enterprise" && (
                    <>
                      <Crown className="h-4 w-4 mr-2" style={{ color: enterpriseColor }} />
                      <span className="font-medium">Enterprise Plan</span>
                    </>
                  )}
                  {currentPlan === "free" && (
                    <span className="font-medium">Free Plan</span>
                  )}
                  
                  {subscription?.status === "active" && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      Active
                    </span>
                  )}
                </div>
                {currentPlan !== "free" && (
                  <div className="text-sm text-muted-foreground">
                    Next billing: {formatDate(subscription?.currentPeriodEnd)}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {/* Free Plan */}
              <div className={cn(
                "rounded-lg border p-4",
                currentPlan === "free" && "ring-2 ring-gray-400 bg-gray-50"
              )}>
                <div className="font-bold">Free</div>
                <div className="mt-1 text-2xl font-bold">$0</div>
                <div className="mt-1 text-xs text-muted-foreground mb-2">
                  Up to 5 sites
                </div>
                <Button 
                  className="w-full mt-2 bg-gray-500 hover:bg-gray-600" 
                  size="sm"
                  disabled={currentPlan === "free"}
                  onClick={() => {}}
                >
                  {currentPlan === "free" ? "Current" : "Downgrade"}
                </Button>
              </div>

              {/* Pro Plan */}
              <div className={cn(
                "rounded-lg border p-4 relative",
                currentPlan === "pro" && "ring-2 bg-orange-50",
                currentPlan === "pro" && { ringColor: proColor }
              )}>
                <div className="absolute -top-2 right-2 bg-orange-100 text-xs text-orange-800 px-2 py-0.5 rounded-full">
                  Popular
                </div>
                <div className="font-bold flex items-center">
                  Pro
                  <Star className="h-3 w-3 ml-1" style={{ color: proColor }} />
                </div>
                <div className="mt-1 text-2xl font-bold">$10</div>
                <div className="mt-1 text-xs text-muted-foreground mb-2">
                  Up to 10 sites
                </div>
                <Button 
                  className="w-full mt-2 text-white" 
                  size="sm"
                  style={{ backgroundColor: proColor }}
                  disabled={currentPlan === "pro" || isLoading}
                  onClick={() => handleSubscribe("pro")}
                >
                  {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : 
                   currentPlan === "pro" ? "Current" :
                   currentPlan === "enterprise" ? "Downgrade" : "Upgrade"}
                </Button>
              </div>

              {/* Enterprise Plan */}
              <div className={cn(
                "rounded-lg border p-4",
                currentPlan === "enterprise" && "ring-2 bg-emerald-50",
                currentPlan === "enterprise" && { ringColor: enterpriseColor }
              )}>
                <div className="font-bold flex items-center">
                  Enterprise
                  <Crown className="h-3 w-3 ml-1" style={{ color: enterpriseColor }} />
                </div>
                <div className="mt-1 text-2xl font-bold">$20</div>
                <div className="mt-1 text-xs text-muted-foreground mb-2">
                  Unlimited sites
                </div>
                <Button 
                  className="w-full mt-2 text-white" 
                  size="sm"
                  style={{ backgroundColor: enterpriseColor }}
                  disabled={currentPlan === "enterprise" || isLoading}
                  onClick={() => handleSubscribe("enterprise")}
                >
                  {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : 
                   currentPlan === "enterprise" ? "Current" : "Upgrade"}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="cancel" className="py-4">
            {!confirmCancel ? (
              <div className="space-y-4">
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-md">
                  <h3 className="font-medium text-amber-800">Are you sure you want to cancel?</h3>
                  <p className="mt-2 text-sm text-amber-700">
                    When you cancel your subscription:
                  </p>
                  <ul className="mt-2 space-y-1 text-sm text-amber-700">
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Your plan will remain active until the end of your current billing period.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>You will not be charged again after your current period ends.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>After your subscription ends, you'll be moved to the Free plan.</span>
                    </li>
                  </ul>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <Button variant="outline" onClick={() => setActiveTab("change-plan")}>
                    Keep My Subscription
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={() => setConfirmCancel(true)}
                  >
                    Continue to Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 p-4 rounded-md">
                  <h3 className="font-medium text-red-800">Confirm Cancellation</h3>
                  <p className="mt-2 text-sm text-red-700">
                    This action will cancel your {currentPlan === "pro" ? "Pro" : "Enterprise"} subscription.
                    You'll have access until {formatDate(subscription?.currentPeriodEnd)}.
                  </p>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <Button 
                    variant="outline" 
                    onClick={() => setConfirmCancel(false)}
                    disabled={isLoading}
                  >
                    Go Back
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={handleCancelSubscription}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Processing...</>
                    ) : (
                      "Yes, Cancel My Subscription"
                    )}
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}