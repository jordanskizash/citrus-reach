"use client"

import type React from "react"
import { useState } from "react"
import { Check, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface DomainSetupModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (domain: string) => Promise<void>
}

export function DomainSetupModal({ open, onOpenChange, onSubmit }: DomainSetupModalProps) {
  const [domain, setDomain] = useState("")
  const [step, setStep] = useState(1)
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationStatus, setVerificationStatus] = useState<"pending" | "success" | "error">()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsVerifying(true)
    try {
      await onSubmit(domain)
      setStep(2)
      setVerificationStatus("pending")
    } catch (error) {
      setVerificationStatus("error")
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Custom Domain</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {step === 1 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="domain">Domain Name</Label>
                <Input
                  id="domain"
                  placeholder="yourdomain.com"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isVerifying}>
                {isVerifying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Continue"
                )}
              </Button>
            </form>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium">DNS Configuration</h3>
                <div className="rounded-md border p-4">
                  <p className="text-sm font-medium">Option 1: Create an A Record</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Add an A record pointing to: <code className="text-orange-500">54.235.156.25</code>
                  </p>
                </div>
                <div className="rounded-md border p-4">
                  <p className="text-sm font-medium">Option 2: Create a CNAME Record</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Add a CNAME record pointing to: <code className="text-orange-500">citrusreach.com</code>
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "h-2 w-2 rounded-full",
                      verificationStatus === "pending" && "bg-yellow-400",
                      verificationStatus === "success" && "bg-green-500",
                      verificationStatus === "error" && "bg-red-500",
                    )}
                  />
                  <p className="text-sm">
                    {verificationStatus === "pending" && "Verifying DNS configuration..."}
                    {verificationStatus === "success" && "Domain verified successfully!"}
                    {verificationStatus === "error" && "Failed to verify domain"}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  DNS changes can take up to 24 hours to propagate. Check back later if verification fails.
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

