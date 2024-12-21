"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEdgeStore } from "@/lib/edgestore";
import { Search, Bell, Zap, Link as LinkIcon, Camera } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { user } = useUser();
  const { edgestore } = useEdgeStore();
  const [activeTab, setActiveTab] = useState("my-account");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [website, setWebsite] = useState("");
  const [calComUsername, setCalComUsername] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [domainName, setDomainName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [description, setDescription] = useState("");

  const userSettings = useQuery(api.users.getUserSettings, { clerkId: user?.id ?? "" });
  const updateUserSettings = useMutation(api.users.updateUserSettings);

  useEffect(() => {
    if (userSettings) {
      setName(userSettings.name || user?.fullName || "");
      setEmail(userSettings.email || user?.primaryEmailAddress?.emailAddress || "");
      setLinkedin(userSettings.linkedin || "");
      setWebsite(userSettings.website || "");
      setMeetingLink(userSettings.meetingLink || "");
      setCalComUsername(userSettings.calComUsername || "");
      setDomainName(userSettings.domainName || "");
      setLogoUrl(userSettings.logoUrl || "");
      setDescription(userSettings.description || "");
    }
  }, [userSettings, user]);

  const handleLogoUpload = async (file: File) => {
    if (file) {
      const response = await edgestore.publicFiles.upload({ file });
      setLogoUrl(response.url);
      handleSave({ logoUrl: response.url });
    }
  };

  const handleSave = async (overrides = {}) => {
    if (user?.id) {
      try {
        await updateUserSettings({
          clerkId: user.id,
          name: name || user.fullName || "",
          email: email || user.primaryEmailAddress?.emailAddress || "",
          linkedin,
          website,
          calComUsername,
          meetingLink,
          domainName,
          logoUrl,
          description,
          ...overrides,
        });
        
        toast.success("Settings saved successfully!", {
          duration: 3000,
          position: "top-center",
          style: {
            background: "#10B981", // Green background
            color: "#FFFFFF", // White text
            borderRadius: "8px",
          },
        });
      } catch (error) {
        toast.error("Failed to save settings. Please try again.", {
          duration: 3000,
          position: "bottom-right",
        });
      }
    }
  };

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
                "focus-visible:ring-0 focus-visible:ring-offset-0"
              )}
            >
              My account
            </TabsTrigger>
            <TabsTrigger
              value="my-content"
              className={cn(
                "pb-4 rounded-none border-b-2 border-transparent data-[state=active]:border-orange-500 data-[state=active]:text-orange-500",
                "focus-visible:ring-0 focus-visible:ring-offset-0"
              )}
            >
              Content
            </TabsTrigger>
            <TabsTrigger
              value="integrations"
              className={cn(
                "pb-4 rounded-none border-b-2 border-transparent data-[state=active]:border-orange-500 data-[state=active]:text-orange-500",
                "focus-visible:ring-0 focus-visible:ring-offset-0"
              )}
            >
              Integrations
            </TabsTrigger>
            <TabsTrigger
              value="quick-record"
              className={cn(
                "pb-4 rounded-none border-b-2 border-transparent data-[state=active]:border-orange-500 data-[state=active]:text-orange-500",
                "focus-visible:ring-0 focus-visible:ring-offset-0"
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
              
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={logoUrl} />
                    <AvatarFallback>{name?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                  <div className="absolute -right-2 -bottom-2">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="rounded-full h-8 w-8"
                      onClick={() => document.getElementById("logo-upload")?.click()}
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                    <Input
                      id="logo-upload"
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          handleLogoUpload(e.target.files[0]);
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
                Access your Workspaces with any email address, or by connecting an account.
                To change your email, you must first disconnect from all connected accounts.{" "}
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
                  <Label>Connected accounts</Label>
                  <div className="space-y-2">
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
                  <Input
                    id="meetingLink"
                    value={meetingLink}
                    onChange={(e) => setMeetingLink(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Add a direct meeting link as an alternative to Cal.com scheduling
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="domainName">Domain Name</Label>
                  <Input
                    id="domainName"
                    value={domainName}
                    onChange={(e) => setDomainName(e.target.value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Appearance</Label>
                    <p className="text-sm text-muted-foreground">
                      Customize how Citrus looks on your device
                    </p>
                  </div>
                  <ModeToggle />
                </div>

                <Button 
                  onClick={() => handleSave()} 
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  Save changes
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="my-content">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">My Content</h2>
              <p className="text-sm text-muted-foreground">
                Configure how you receive notifications.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="integrations">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Integrations</h2>
              <p className="text-sm text-muted-foreground">
                Manage your connected applications and services.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="quick-record">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Quick Record</h2>
              <p className="text-sm text-muted-foreground">
                Configure your recording preferences.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}