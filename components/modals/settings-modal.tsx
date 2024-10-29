"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEdgeStore } from "@/lib/edgestore"// Adjust import path as needed
import {
  Dialog,
  DialogContent,
  DialogHeader
} from "@/components/ui/dialog";
import { useSettings } from "@/hooks/use-settings";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";

export const SettingsModal = () => {
  const settings = useSettings();
  const { user } = useUser();
  const { edgestore } = useEdgeStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [website, setWebsite] = useState("");
  const [calComUsername, setCalComUsername] = useState("");
  const [domainName, setDomainName] = useState("");
  const [logoUrl, setLogoUrl] = useState(""); // State for logo URL

  const userSettings = useQuery(api.users.getUserSettings, { clerkId: user?.id ?? "" });
  const updateUserSettings = useMutation(api.users.updateUserSettings);

  useEffect(() => {
    if (userSettings) {
      setName(userSettings.name || user?.fullName || "");
      setEmail(userSettings.email || user?.primaryEmailAddress?.emailAddress || "");
      setLinkedin(userSettings.linkedin || "");
      setWebsite(userSettings.website || "");
      setCalComUsername(userSettings.calComUsername || "");
      setDomainName(userSettings.domainName || "");
      setLogoUrl(userSettings.logoUrl || ""); // Set logo URL if it exists
    }
  }, [userSettings, user]);

  const handleLogoUpload = async (file: File): Promise<void> => {
    if (file) {
      const response = await edgestore.publicFiles.upload({ file });
      setLogoUrl(response.url); // Store the returned URL in state
    }
  };

  const handleSave = () => {
    if (user?.id) {
      updateUserSettings({
        clerkId: user.id,
        name: name || user.fullName || "",
        email: email || user.primaryEmailAddress?.emailAddress || "",
        linkedin,
        website,
        calComUsername,
        domainName,
        logoUrl, // Include logo URL in the update payload
      });
    }
    settings.onClose();
  };

  return (
    <Dialog open={settings.isOpen} onOpenChange={settings.onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="border-b pb-3">
          <h2 className="text-lg font-medium">My Settings</h2>
        </DialogHeader>
        <div className="flex flex-col gap-y-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-y-1">
              <Label>Appearance</Label>
              <span className="text-[0.8rem] text-muted-foreground">
                Customize how Citrus looks on your device
              </span>
            </div>
            <ModeToggle />
          </div>
          <div className="flex flex-col gap-y-1">
            <Label htmlFor="name">Name</Label>
            <Input 
              id="name" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-y-1">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-y-1">
            <Label htmlFor="linkedin">LinkedIn</Label>
            <Input 
              id="linkedin" 
              value={linkedin} 
              onChange={(e) => setLinkedin(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-y-1">
            <Label htmlFor="website">Website</Label>
            <Input 
              id="website" 
              value={website} 
              onChange={(e) => setWebsite(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-y-1">
            <Label htmlFor="calComUsername">Cal.com Username</Label>
            <Input 
              id="calComUsername" 
              value={calComUsername} 
              onChange={(e) => setCalComUsername(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-y-1">
            <Label htmlFor="domainName">Domain Name</Label>
            <Input 
              id="domainName" 
              value={domainName} 
              onChange={(e) => setDomainName(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-y-1">
            <Label>Logo</Label>
            {logoUrl ? (
              <img src={logoUrl} alt="User Logo" className="h-16 w-16 object-cover rounded-md" />
            ) : (
              <span>No logo uploaded</span>
            )}
            <Input
              type="file"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleLogoUpload(e.target.files[0]);
                }
              }}
              className="mt-2"
            />
          </div>
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
