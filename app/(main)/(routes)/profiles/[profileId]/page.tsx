'use client';

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import dynamic from "next/dynamic";
import { ProfToolbar } from "@/components/profile-toolbar";
import { useMemo, useState, useEffect, useRef } from "react";
import VideoRecorder from "@/components/videoRecorder";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Share2, Calendar, MessageSquare, Linkedin, Paintbrush, FileText, X, Trash2, Edit2 } from "lucide-react";
import { toast } from "react-hot-toast";
import InlineWidget from "@calcom/embed-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useUser } from "@clerk/clerk-react";
import { Spinner } from "@/components/spinner";
import FormattingSidebar from '@/components/formatting-sidebar';
import { useTheme } from 'next-themes';
import { Document, Page, pdfjs } from 'react-pdf';
import { useEdgeStore } from '@/lib/edgestore';
import Image from 'next/image';
import { ProfileDescription } from "@/app/(main)/_components/prof-description";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface ProfileIdPageProps {
  params: {
    profileId: Id<"profiles">;
  };
}

const MotionLink = motion(Link);

export default function ProfileIdPage({ params }: ProfileIdPageProps) {
  const { user } = useUser();
  const documents = useQuery(api.documents.getPublishedDocuments);
  const latestDocuments = documents ? documents.slice(0, 6) : [];

  const Editor = useMemo(
    () => dynamic(() => import("@/components/editor"), { ssr: false }),
    []
  );

  const profile = useQuery(api.profiles.getById, {
    profileId: params.profileId,
  });

  const userDetails = useQuery(
    api.users.getUserByClerkId,
    user?.id ? { clerkId: user.id } : "skip"
  );

  // Retrieve user logo from user details, if available
  const userLogo = userDetails?.logoUrl;
  const clientLogo = profile?.icon || "/acme.png";

  const updateProfile = useMutation(api.profiles.update);

  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [videoKey, setVideoKey] = useState(0);
  const [isReplyDialogOpen, setIsReplyDialogOpen] = useState(false);
  const [isCalDialogOpen, setIsCalDialogOpen] = useState(false);
  const [colorPreference, setColorPreference] = useState('#FFFFFF');
  const [pdfFiles, setPdfFiles] = useState<{ name: string; url: string }[]>([]);
  const [selectedPdf, setSelectedPdf] = useState<string | null>(null);
  const [showAdditionalResources, setShowAdditionalResources] = useState(true);
  const [videoDescription, setVideoDescription] = useState(profile?.description || '');
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  const { resolvedTheme } = useTheme();
  const { edgestore } = useEdgeStore();

  useEffect(() => {
    if (profile?.colorPreference) {
      setColorPreference(profile.colorPreference);
    }
    if (profile?.description) {
      setVideoDescription(profile.description);
    }
  }, [profile]);

  const [themeSettings, setThemeSettings] = useState({
    backgroundColor: profile?.themeSettings?.backgroundColor || '#FFFFFF',
    accentColor: profile?.themeSettings?.accentColor || '#000000',
    textColor: profile?.themeSettings?.textColor || '#000000'
  });

  useEffect(() => {
    if (profile?.themeSettings) {
      setThemeSettings(profile.themeSettings);
    }
  }, [profile]);

  const handleColorChange = (type: 'background' | 'accent' | 'text', newColor: string) => {
    const updatedThemeSettings = {
      ...themeSettings,
      [type === 'background' ? 'backgroundColor' : type === 'accent' ? 'accentColor' : 'textColor']: newColor
    };
    
    setThemeSettings(updatedThemeSettings);
    updateProfile({
      id: params.profileId,
      // themeSettings: updatedThemeSettings
    });
  };

  const themeStyles = {
    button: {
      backgroundColor: themeSettings.accentColor,
      color: themeSettings.textColor,
      '&:hover': {
        backgroundColor: themeSettings.accentColor,
        filter: 'brightness(90%)',
      },
    },
    hr: {
      borderColor: themeSettings.accentColor,
    },
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile?.displayName}'s Profile`,
          text: `Check out ${profile?.displayName}'s profile!`,
          url: window.location.href,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      setIsShareDialogOpen(true);
    }
  };

  const { theme, setTheme } = useTheme();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Profile link copied to clipboard!");
    setIsShareDialogOpen(false);
  };

  const handleVideoUpload = () => {
    setVideoKey((prevKey) => prevKey + 1);
  };

  const handlePdfUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      for (const file of files) {
        try {
          const response = await edgestore.publicFiles.upload({
            file,
          });
          setPdfFiles(prev => [...prev, { name: file.name, url: response.url }]);
        } catch (error) {
          console.error("Error uploading file:", error);
          toast.error(`Failed to upload ${file.name}`);
        }
      }
    }
  };

  const handlePdfDelete = async (index: number) => {
    const fileToDelete = pdfFiles[index];
    try {
      await edgestore.publicFiles.delete({
        url: fileToDelete.url,
      });
      setPdfFiles(pdfFiles.filter((_, i) => i !== index));
      if (selectedPdf === fileToDelete.url) {
        setSelectedPdf(null);
      }
      toast.success(`${fileToDelete.name} deleted successfully`);
    } catch (error) {
      console.error("Error deleting file:", error);
      toast.error(`Failed to delete ${fileToDelete.name}`);
    }
  };

  const handleDeleteAllResources = async () => {
    try {
      for (const file of pdfFiles) {
        await edgestore.publicFiles.delete({
          url: file.url,
        });
      }
      setPdfFiles([]);
      setSelectedPdf(null);
      toast.success("All resources deleted successfully");
    } catch (error) {
      console.error("Error deleting all resources:", error);
      toast.error("Failed to delete all resources");
    }
  };

  const handleDescriptionSave = () => {
    updateProfile({
      id: params.profileId,
      description: videoDescription,
    });
    setIsEditingDescription(false);
    toast.success("Video description updated successfully");
  };

  const handleDescriptionEdit = () => {
    setIsEditingDescription(true);
    setTimeout(() => {
      if (descriptionRef.current) {
        descriptionRef.current.focus();
      }
    }, 0);
  };

  if (!profile || userDetails === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  const gradientStyle = {
    background: `linear-gradient(to bottom, ${colorPreference}, #ffffff)`,
  };

  return (
    <div 
      className={`min-h-screen overflow-x-auto ${
        profile.isDarkMode ? 'dark' : ''
      }`} 
      style={gradientStyle}
    >
      <div className="flex flex-col items-center pb-20 pt-6 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Logo Section */}
        <div className="w-full flex justify-center items-center mb-8">
          <div className="flex items-center space-x-4">
            {/* Use userLogo if it exists, otherwise show placeholder */}
            <Image
              src={userLogo || "/placeholder.svg?height=50&width=150"}
              alt="User Company Logo"
              width={50}
              height={25}
              className="object-contain"
            />
            <span className="text-2xl font-bold">x</span>
            {/* Client Logo */}
            <Image
              src={clientLogo || "/acme.png"}
              alt="Client Company Logo"
              width={150}
              height={50}
              className="object-contain"
            />
          </div>
        </div>

        {/* ProfToolbar */}
        <div className="w-full mb-6 flex justify-between items-center">
          <ProfToolbar initialData={profile} />
        </div>

        {/* Video Description */}
        {/* <div className="w-full mb-6">
          <ProfileDescription initialData={profile} />
        </div> */}

        <p className="text-xl mt-2 mb-6 text-center">{profile.bio}</p>

        <div className="w-full flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-3/4">
            <VideoRecorder
              key={videoKey}
              profileId={params.profileId}
              videoUrl={profile.videoUrl}
              onVideoUpload={handleVideoUpload}
            />
          </div>
          <div className="w-full md:w-1/4 flex flex-col gap-3">
            <Dialog
              open={isReplyDialogOpen}
              onOpenChange={setIsReplyDialogOpen}
            >
              <DialogTrigger asChild>
                <Button className="h-10 rounded-full text-sm">
                  <MessageSquare className="mr-2 h-4 w-4" /> Reply
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Reply to {user?.firstName}</DialogTitle>
                </DialogHeader>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setIsReplyDialogOpen(false);
                  }}
                  className="space-y-4 mt-4"
                >
                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      htmlFor="name"
                    >
                      Your Name
                    </label>
                    <Input id="name" placeholder="Full Name" required />
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      htmlFor="email"
                    >
                      Email Address
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Email Address"
                      required
                    />
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      htmlFor="message"
                    >
                      Your Message
                    </label>
                    <Textarea
                      id="message"
                      placeholder="Type your message here..."
                      rows={6}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Send
                  </Button>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={isCalDialogOpen} onOpenChange={setIsCalDialogOpen}>
              <DialogTrigger asChild>
                <Button className="h-10 rounded-full text-sm">
                  <Calendar className="mr-2 h-4 w-4" /> Book a meeting
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    Book a Meeting with {user?.firstName}
                  </DialogTitle>
                </DialogHeader>
                <div className="mt-4">
                  <InlineWidget
                    calLink={userDetails?.calComUsername || "citrusreach"}
                    style={{
                      height: "650px",
                      width: "100%",
                      overflow: "scroll",
                    }}
                    config={{ theme: "light", layout: "month_view" }}
                  />
                </div>
              </DialogContent>
            </Dialog>

            <Button
              className="h-10 rounded-full text-sm"
              onClick={handleShare}
            >
              <Share2 className="mr-2 h-4 w-4" /> Share
            </Button>

            <Button className="h-10 rounded-full text-sm" asChild>
              <a
                href={userDetails?.linkedin || "#"}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Linkedin className="mr-2 h-4 w-4" /> Get in Touch
              </a>
            </Button>
          </div>
        </div>

        <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
          <DialogContent>
            
            <DialogHeader>
              <DialogTitle>Share Profile</DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              <Input value={window.location.href} readOnly className="mb-4" />
              <Button onClick={copyToClipboard} className="w-full">
                Copy Link
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Additional Resources Section */}
        {showAdditionalResources ? (
          <div className="w-full mt-8">
            <div className="flex justify-between items-center  mb-6">
              <h2 className="text-2xl font-bold">Additional Resources</h2>
              <div className="flex items-center">
                {pdfFiles.length > 0 && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDeleteAllResources}
                    className="mr-2"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete All
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAdditionalResources(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {pdfFiles.map((file, index) => (
                <div key={index} className="relative bg-white p-4 rounded-lg shadow">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => handlePdfDelete(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <FileText className="h-12 w-12 text-blue-500 mb-2" />
                  <h3 className="font-medium truncate">{file.name}</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => setSelectedPdf(file.url)}
                  >
                    Preview
                  </Button>
                </div>
              ))}
              <div className="bg-gray-100 p-4 rounded-lg flex items-center justify-center">
                <label htmlFor="pdf-upload" className="cursor-pointer text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <span className="text-sm text-gray-500">Upload PDF</span>
                </label>
                <Input
                  id="pdf-upload"
                  type="file"
                  accept=".pdf"
                  multiple
                  className="hidden"
                  onChange={handlePdfUpload}
                />
              </div>
            </div>
          </div>
        ) : (
          <Button
            className="mt-8"
            onClick={() => setShowAdditionalResources(true)}
          >
            Show Additional Resources
          </Button>
        )}

        {/* PDF Preview Dialog */}
        {selectedPdf && (
          <Dialog open={!!selectedPdf} onOpenChange={() => setSelectedPdf(null)}>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>{pdfFiles.find(file => file.url === selectedPdf)?.name}</DialogTitle>
              </DialogHeader>
              <div className="mt-4 h-[600px] overflow-y-auto">
                <Document
                  file={selectedPdf}
                  onLoadSuccess={({ numPages }) => console.log(numPages)}
                >
                  <Page pageNumber={1} width={500} />
                </Document>
              </div>
            </DialogContent>
          </Dialog>
        )}
        
        {/* More from {user.firstName} Section */}
        {user && latestDocuments.length > 0 && (
          <div className="mt-12 w-full">
            <h2 className="text-2xl font-bold mb-6">
              More from {user.firstName}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {latestDocuments.map((post) => (
                <MotionLink
                  key={post._id}
                  href={`/preview/${post._id}`}
                  className="flex flex-col"
                  whileHover={{ y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <img
                    src={
                      post.coverImage || "/placeholder.svg?height=300&width=400"
                    }
                    alt={post.title}
                    className="rounded-lg object-cover w-full h-[200px] mb-4"
                  />
                  <p className="text-gray-500 text-sm mb-1">
                    {new Date(post._creationTime).toLocaleDateString()}
                  </p>
                  <h3 className="text-xl font-semibold mb-1">{post.title}</h3>
                  <p className="text-gray-600">
                    By {user?.fullName || "Unknown Author"}
                  </p>
                </MotionLink>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}