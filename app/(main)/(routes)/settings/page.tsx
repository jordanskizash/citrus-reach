"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/clerk-react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useEdgeStore } from "@/lib/edgestore"
import { Search, Bell, Zap, LinkIcon, Camera, CreditCard, Calendar, Receipt, ArrowRight, Crown, Star } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "react-hot-toast"
import { cn } from "@/lib/utils"
import { DomainSetupModal } from "../../_components/domain-integration"
import PlanCards from "../../_components/subscription/plan-cards"
import { useSearchParams } from "next/navigation"
import router from "next/router"
import { PlanManagementDialog } from "../../_components/subscription/plan-management-dialog"


// Add this type definition
type DomainStatus = "processing" | "connected" | "failed" | null

export default function SettingsPage() {
  const { user } = useUser()
  const { edgestore } = useEdgeStore()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState("my-account")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [linkedin, setLinkedin] = useState("")
  const [website, setWebsite] = useState("")
  const [calComUsername, setCalComUsername] = useState("")
  const [meetingLink, setMeetingLink] = useState("")
  const [domainName, setDomainName] = useState("")
  const [logoUrl, setLogoUrl] = useState("")
  const [description, setDescription] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [companyWebsite, setCompanyWebsite] = useState("")
  const [companyDescription, setCompanyDescription] = useState("")
  const [image, setImage] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [isDomainModalOpen, setIsDomainModalOpen] = useState(false)
  const [domainStatus, setDomainStatus] = useState<DomainStatus>(null)

  const userSettings = useQuery(api.users.getUserSettings, { clerkId: user?.id ?? "" })
  const updateUserSettings = useMutation(api.users.updateUserSettings)

  const invoices = [
    {
      id: "INV-001",
      date: Date.now() - 86400000 * 2, // 2 days ago
      amount: 10.00,
      status: "paid"
    },
    {
      id: "INV-002",
      date: Date.now() - 86400000 * 32, // 32 days ago
      amount: 10.00,
      status: "paid"
    },
    {
      id: "INV-003",
      date: Date.now() - 86400000 * 62, // 62 days ago
      amount: 10.00,
      status: "paid"
    }
  ];
  
  // Get subscription information
  const subscription = useQuery(api.users.getUserSubscription, {
    clerkId: user?.id ?? ""
  })

  // Check if this is a redirect back from Stripe successful checkout
  const success = searchParams.get('success')
  useEffect(() => {
    if (success === 'true') {
      toast.success("Payment successful! Your subscription has been updated.", {
        duration: 5000,
        position: "top-center",
      })
      // Set active tab to billing to show the updated plan
      setActiveTab("billing")
    }
  }, [success])

  useEffect(() => {
    if (userSettings) {
      setName(userSettings.name || user?.fullName || "")
      setEmail(userSettings.email || user?.primaryEmailAddress?.emailAddress || "")
      setPhoneNumber(userSettings.phoneNumber || "")
      setLinkedin(userSettings.linkedin || "")
      setWebsite(userSettings.website || "")
      setMeetingLink(userSettings.meetingLink || "")
      setCalComUsername(userSettings.calComUsername || "")
      setDomainName(userSettings.domainName || "")
      setLogoUrl(userSettings.logoUrl || "")
      setImage(userSettings.image || "")
      setDescription(userSettings.description || "")
      setCompanyName(userSettings.companyName || "")
      setCompanyWebsite(userSettings.companyWebsite || "")
      setCompanyDescription(userSettings.companyDescription || "")
    }
  }, [userSettings, user])

  const handleImageUpload = async (file: File) => {
    if (file) {
      const response = await edgestore.publicFiles.upload({ file })
      setImage(response.url)
      handleSave({ image: response.url })
    }
  }

  const handleLogoUpload = async (file: File) => {
    if (file) {
      const response = await edgestore.publicFiles.upload({ file })
      setLogoUrl(response.url)
      handleSave({ logoUrl: response.url })
    }
  }

  const handleSave = async (overrides = {}) => {
    if (user?.id) {
      try {
        await updateUserSettings({
          clerkId: user.id,
          name: name || user.fullName || "",
          email: email || user.primaryEmailAddress?.emailAddress || "",
          phoneNumber,
          linkedin,
          website,
          calComUsername,
          meetingLink,
          domainName,
          logoUrl,
          description,
          companyName,
          companyWebsite,
          companyDescription,
          ...overrides,
        })

        toast.success("Settings saved successfully!", {
          duration: 3000,
          position: "top-center",
          style: {
            background: "#10B981", // Green background
            color: "#FFFFFF", // White text
            borderRadius: "8px",
          },
        })
      } catch (error) {
        toast.error("Failed to save settings. Please try again.", {
          duration: 3000,
          position: "bottom-right",
        })
      }
    }
  }

  const handleDomainSubmit = async (domain: string) => {
    if (user?.id) {
      try {
        setDomainStatus("processing")
        await updateUserSettings({
          clerkId: user.id,
          name: name || user.fullName || "",
          email: email || user.primaryEmailAddress?.emailAddress || "",
          phoneNumber,
          linkedin,
          website,
          calComUsername,
          meetingLink,
          domainName: domain,
          logoUrl,
          description,
          companyName,
          companyWebsite,
          companyDescription,
        })
        // Remove the success toast from here
        // Start checking the domain status
        checkDomainStatus(domain)
      } catch (error) {
        setDomainStatus("failed")
        toast.error("Failed to update domain. Please try again.", {
          duration: 3000,
          position: "bottom-right",
        })
        throw error // Re-throw the error so the modal can handle it
      }
    }
  }

  // Add this new function to check domain status
  const checkDomainStatus = async (domain: string) => {
    // This is a placeholder function. You'll need to implement the actual status checking logic.
    // For now, we'll simulate a delay and then set the status to 'connected'.
    setTimeout(() => {
      setDomainStatus("connected")
      toast.success("Domain connected successfully!", {
        duration: 3000,
        position: "top-center",
        style: {
          background: "#10B981",
          color: "#FFFFFF",
          borderRadius: "8px",
        },
      })
    }, 5000) // Simulate a 5-second delay
  }

  // Format date helper function
  const formatDate = (timestamp?: number) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 ml-16">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="w-full max-w-[400px] pl-9"
              placeholder="Search for sites, folders, content and settings"
            />
          </div>
        </div>
      </header>

      {/* Navigation */}
      <div className="container mx-auto px-4 py-4 ml-16">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="border-b pb-px h-auto p-0 bg-transparent space-x-6">
            <TabsTrigger
              value="my-account"
              className={cn(
                "pb-4 rounded-none border-b-2 border-transparent data-[state=active]:border-orange-500 data-[state=active]:text-orange-500",
                "focus-visible:ring-0 focus-visible:ring-offset-0",
              )}
            >
              My account
            </TabsTrigger>
            <TabsTrigger
              value="my-company"
              className={cn(
                "pb-4 rounded-none border-b-2 border-transparent data-[state=active]:border-orange-500 data-[state=active]:text-orange-500",
                "focus-visible:ring-0 focus-visible:ring-offset-0",
              )}
            >
              Company Information
            </TabsTrigger>
            <TabsTrigger
              value="billing"
              className={cn(
                "pb-4 rounded-none border-b-2 border-transparent data-[state=active]:border-orange-500 data-[state=active]:text-orange-500",
                "focus-visible:ring-0 focus-visible:ring-offset-0",
              )}
            >
              Billing
            </TabsTrigger>
            <TabsTrigger
              value="integrations"
              className={cn(
                "pb-4 rounded-none border-b-2 border-transparent data-[state=active]:border-orange-500 data-[state=active]:text-orange-500",
                "focus-visible:ring-0 focus-visible:ring-offset-0",
              )}
            >
              Integrations
            </TabsTrigger>
            <TabsTrigger
              value="quick-record"
              className={cn(
                "pb-4 rounded-none border-b-2 border-transparent data-[state=active]:border-orange-500 data-[state=active]:text-orange-500",
                "focus-visible:ring-0 focus-visible:ring-offset-0",
              )}
            >
              Quick record
            </TabsTrigger>
          </TabsList>

          <TabsContent value="my-account" className="space-y-8">
            {/* Name and Photos Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Name and photos</h2>
              <p className="text-sm text-muted-foreground">
                Changing your name below will update your name on your profile.{" "}
                <a href="/homepage">
                  <Button variant="link" className="text-orange-500 p-0 h-auto font-normal">
                    View your profile
                  </Button>
                </a>
              </p>

              <div className="flex items-start gap-8">
                <div className="relative">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={image} />
                    <AvatarFallback>{name?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                  <div className="absolute -right-2 -bottom-2">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="rounded-full h-8 w-8"
                      onClick={() => document.getElementById("profile-upload")?.click()}
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                    <Input
                      id="profile-upload"
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          handleImageUpload(e.target.files[0])
                        }
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-4 flex-1 max-w-md">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First name</Label>
                    <Input
                      id="firstName"
                      value={name.split(" ")[0]}
                      onChange={(e) => setName(`${e.target.value} ${name.split(" ").slice(1).join(" ")}`)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last name</Label>
                    <Input
                      id="lastName"
                      value={name.split(" ").slice(1).join(" ")}
                      onChange={(e) => setName(`${name.split(" ")[0]} ${e.target.value}`)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Description Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Description</h2>
              <p className="text-sm text-muted-foreground">
                Add a brief description about yourself that will appear on your profile.
              </p>
              <div className="space-y-2 max-w-md">
                <Label htmlFor="description">About me</Label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Tell others about yourself..."
                />
              </div>
            </div>

            {/* Contact Info Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Contact info</h2>
              <p className="text-sm text-muted-foreground">
                Access your Workspaces with any email address, or by connecting an account. To change your email, you
                must first disconnect from all connected accounts.{" "}
                <Button variant="link" className="text-orange-500 p-0 h-auto font-normal">
                  Learn more
                </Button>
              </p>

              <div className="space-y-6 max-w-md">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input id="linkedin" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input id="website" value={website} onChange={(e) => setWebsite(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="calComUsername">Cal.com Username</Label>
                  <Input
                    id="calComUsername"
                    value={calComUsername}
                    onChange={(e) => setCalComUsername(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="meetingLink">Meeting Link</Label>
                  <Input id="meetingLink" value={meetingLink} onChange={(e) => setMeetingLink(e.target.value)} />
                  <p className="text-sm text-muted-foreground">
                    Add a direct meeting link as an alternative to Cal.com scheduling
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="domainName">Domain Name</Label>
                  <Input id="domainName" value={domainName} onChange={(e) => setDomainName(e.target.value)} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Appearance</Label>
                    <p className="text-sm text-muted-foreground">Customize how Citrus looks on your device</p>
                  </div>
                  <ModeToggle />
                </div>

                <Button onClick={() => handleSave()} className="bg-orange-500 hover:bg-orange-600">
                  Save changes
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="my-company">
            {/* Company Information Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Company Information</h2>
              <p className="text-sm text-muted-foreground">
                Add your company details that will appear on your profile.
              </p>

              <div className="flex items-start gap-8">
                <div className="relative">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={logoUrl} />
                    <AvatarFallback>C</AvatarFallback>
                  </Avatar>
                  <div className="absolute -right-2 -bottom-2">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="rounded-full h-8 w-8"
                      onClick={() => document.getElementById("company-logo-upload")?.click()}
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                    <Input
                      id="company-logo-upload"
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          handleLogoUpload(e.target.files[0])
                        }
                      }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8 flex-1">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Company name</Label>
                      <Input
                        id="companyName"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="Enter company name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="companyWebsite">Company website</Label>
                      <Input
                        id="companyWebsite"
                        value={companyWebsite}
                        onChange={(e) => setCompanyWebsite(e.target.value)}
                        placeholder="https://"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* New Billing Tab */}
          <TabsContent value="billing" className="space-y-4 max-w-4xl">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Billing & Subscription</h2>
              <p className="text-sm text-muted-foreground">
                Manage your plan and payment details.
              </p>
            </div>

            {/* Current Plan Summary */}
            <div className="mb-4">
              <div className="bg-muted/30 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <h3 className="text-base font-medium">Current Plan</h3>
                    <div className="flex items-center mt-1">
                      {subscription?.tier === "enterprise" && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10B981' }}>
                          <Crown className="w-3 h-3 mr-1" />
                          Enterprise
                        </span>
                      )}
                      {subscription?.tier === "pro" && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: 'rgba(253, 140, 102, 0.15)', color: '#FD8C66' }}>
                          <Star className="w-3 h-3 mr-1" />
                          Pro
                        </span>
                      )}
                      {(!subscription?.tier || subscription?.tier === "free") && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Free
                        </span>
                      )}
                      {subscription?.status === "active" && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 ml-2">
                          Active
                        </span>
                      )}
                      {subscription?.status !== "active" && (
                        <span className="text-xs text-muted-foreground ml-2">
                          Inactive
                        </span>
                      )}
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="gap-1"
                  >
                    <PlanManagementDialog 
                      trigger={
                        <div className="flex items-center gap-1">
                          Change Plan
                          <ArrowRight className="w-3 h-3" />
                        </div>
                      } 
                    />
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-3 mt-3">
                  <div className="rounded-md border p-3">
                    <div className="flex items-center text-xs font-medium mb-1">
                      <Calendar className="w-3 h-3 mr-1 text-muted-foreground" />
                      Next billing date
                    </div>
                    <p className="text-xs">
                      {subscription?.currentPeriodEnd 
                        ? formatDate(subscription.currentPeriodEnd) 
                        : "Not applicable"}
                    </p>
                  </div>
                  <div className="rounded-md border p-3">
                    <div className="flex items-center text-xs font-medium mb-1">
                      <CreditCard className="w-3 h-3 mr-1 text-muted-foreground" />
                      Payment method
                    </div>
                    <p className="text-xs">
                      {subscription?.status === "active" 
                        ? "Credit Card •••• 4242" 
                        : "None"}
                    </p>
                  </div>
                  <div className="rounded-md border p-3 flex flex-col justify-between">
                    <div className="flex items-center text-xs font-medium mb-1">
                      <Receipt className="w-3 h-3 mr-1 text-muted-foreground" />
                      Billing history
                    </div>
                    <p className="text-xs">
                      {invoices?.length 
                        ? `${invoices.length} invoices` 
                        : "No invoices yet"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Invoice Table */}
            <div>
              <h3 className="text-base font-medium mb-2">Recent Invoices</h3>
              <div className="rounded-md border overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50 border-b">
                      <th className="py-2 px-3 text-left text-xs font-medium text-muted-foreground">Invoice</th>
                      <th className="py-2 px-3 text-left text-xs font-medium text-muted-foreground">Date</th>
                      <th className="py-2 px-3 text-left text-xs font-medium text-muted-foreground">Amount</th>
                      <th className="py-2 px-3 text-left text-xs font-medium text-muted-foreground">Status</th>
                      <th className="py-2 px-3 text-right text-xs font-medium text-muted-foreground"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices && invoices.length > 0 ? (
                      invoices.map((invoice, index) => (
                        <tr key={invoice.id} className={index !== invoices.length - 1 ? "border-b" : ""}>
                          <td className="py-2 px-3 text-xs">{invoice.id}</td>
                          <td className="py-2 px-3 text-xs">{formatDate(invoice.date)}</td>
                          <td className="py-2 px-3 text-xs">${invoice.amount.toFixed(2)}</td>
                          <td className="py-2 px-3">
                            <span className={cn(
                              "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                              invoice.status === "paid" ? "bg-green-100 text-green-700" : 
                              invoice.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                              "bg-red-100 text-red-700"
                            )}>
                              {invoice.status}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-right">
                            <Button variant="ghost" size="sm" className="h-6 text-xs">
                              Download
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-4 px-3 text-center text-muted-foreground text-xs">
                          No invoices found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {invoices && invoices.length > 0 && (
                <div className="mt-2 flex justify-end">
                  <Button variant="link" size="sm" className="h-6 text-xs">
                    View all invoices
                    <ArrowRight size="sm" className="h-3 text-xs" />
                  </Button>
                </div>
              )}
            </div>

            {/* Add debug panel in development only */}
            {process.env.NODE_ENV === 'development'}
          </TabsContent>

          <TabsContent value="integrations">
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Integrations</h2>
                <p className="text-sm text-muted-foreground">Manage your connected applications and services.</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Custom Domain</h3>
                  <div className="flex items-center justify-between rounded-lg border p-4 max-w-3xl">
                    <div className="space-y-0.5 flex items-center">
                      <div
                        className={cn("w-2 h-2 rounded-full mr-2", {
                          "bg-yellow-400": domainStatus === "processing",
                          "bg-green-500": domainStatus === "connected",
                          "bg-red-500": domainStatus === "failed",
                          "bg-gray-300": domainStatus === null,
                        })}
                      />
                      <div>
                        <p className="text-sm font-medium">{domainName || "No custom domain configured"}</p>
                        <p className="text-sm text-muted-foreground">
                          {domainStatus === "processing" && "Domain is being processed..."}
                          {domainStatus === "connected" && "Domain is connected"}
                          {domainStatus === "failed" && "Domain connection failed"}
                          {domainStatus === null && "Add your own domain to personalize your site's URL"}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" onClick={() => setIsDomainModalOpen(true)}>
                      {domainName ? "Update Domain" : "Add Domain"}
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Connected accounts</h3>
                  <div className="space-y-2 max-w-3xl">
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M7.9 7v2.4H12c-.2 1-1.2 3-4 3-2.4 0-4.3-2-4.3-4.4 0-2.4 2-4.4 4.3-4.4 1.4 0 2.3.6 2.8 1.1l1.9-1.8C11.5 1.7 9.9 1 8 1 4.1 1 1 4.1 1 8s3.1 7 7 7c4 0 6.7-2.8 6.7-6.8 0-.5 0-.8-.1-1.2H7.9z" />
                      </svg>
                      Connect with Google
                    </Button>
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M13.5 1.5h-11C1.7 1.5 1 2.2 1 3v10c0 .8.7 1.5 1.5 1.5h11c.8 0 1.5-.7 1.5-1.5V3c0-.8-.7-1.5-1.5-1.5zm-11 1h11c.3 0 .5.2.5.5v2h-12v-2c0-.3.2-.5.5-.5zm11 9h-11c-.3 0-.5-.2-.5-.5V6h12v5c0 .3-.2.5-.5.5z" />
                      </svg>
                      Connect with Slack
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <DomainSetupModal
              open={isDomainModalOpen}
              onOpenChange={setIsDomainModalOpen}
              onSubmit={handleDomainSubmit}
            />
          </TabsContent>

          <TabsContent value="quick-record">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Quick Record</h2>
              <p className="text-sm text-muted-foreground">Configure your recording preferences.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}