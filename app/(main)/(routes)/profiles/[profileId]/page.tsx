"use client"

import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Doc, Id } from "@/convex/_generated/dataModel"
import dynamic from "next/dynamic"
import { ProfToolbar } from "@/components/profile-toolbar"
import { useMemo, useState, useEffect, useRef } from "react"
import VideoRecorder from "@/components/videoRecorder"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Share2, Calendar, MessageSquare, Linkedin, Paintbrush, FileText, X, Trash2, Edit2 } from "lucide-react"
import { toast } from "react-hot-toast"
import InlineWidget from "@calcom/embed-react"
import { motion } from "framer-motion"
import Link from "next/link"
import { useUser } from "@clerk/clerk-react"
import { Spinner } from "@/components/spinner"
import FormattingSidebar from "@/components/formatting-sidebar"
import { useTheme } from "next-themes"
import { Document, Page } from "react-pdf"
import { useEdgeStore } from "@/lib/edgestore"
import Image from "next/image"
import { ProfileDescription } from "@/app/(main)/_components/prof-description"
import "react-pdf/dist/Page/AnnotationLayer.css"
import "react-pdf/dist/Page/TextLayer.css"
import * as pdfjsLib from "pdfjs-dist"
import "pdfjs-dist/web/pdf_viewer.css"
import PdfViewer from "@/app/(main)/_components/pdf-viewer"
import LogoComparison from "@/app/(main)/_components/logo-comparison"
import SmartMeetingButton from "@/app/(main)/_components/meetingButton"
import ContentSelectionDialog from "@/app/(main)/_components/content-selection"

interface ProfileIdPageProps {
  params: {
    profileId: Id<"profiles">
  }
}

interface PdfPreviewProps {
  file: { name: string; url: string }
  onClose: () => void
}

type ExternalLink = {
  _id: string;
  title: string;
  coverImage?: string;
  _creationTime: number;
  isExternalLink: true;
  url: string;
}

type CombinedContent = Doc<"documents"> | ExternalLink;

const MotionLink = motion(Link)

const PdfThumbnail = ({ url }: { url: string }) => {
  const [error, setError] = useState<string | null>(null)

  return (
    <div className="h-40 overflow-hidden border rounded mb-2">
      <Document
        file={url}
        onLoadError={(error: Error) => {
          console.error("Error loading PDF thumbnail:", error)
          setError("Failed to load preview")
        }}
        loading={
          <div className="h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900" />
          </div>
        }
      >
        <Page pageNumber={1} width={200} renderTextLayer={false} renderAnnotationLayer={false} />
      </Document>
      {error && (
        <div className="h-full flex items-center justify-center text-red-500 text-sm text-center p-2">{error}</div>
      )}
    </div>
  )
}

// const PdfPreview = ({ file, onClose }: { file: { name: string; url: string }, onClose: () => void }) => {
//   const [pdfDocument, setPdfDocument] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [scale, setScale] = useState(1.0);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

//     const loadPdf = async () => {
//       try {
//         const pdf = await pdfjsLib.getDocument(file.url).promise;
//         setPdfDocument(pdf);
//       } catch (error) {
//         console.error('Error loading PDF:', error);
//         setError('Failed to load PDF');
//       }
//     };

//     loadPdf();
//   }, [file.url]);

//   return (
//     <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//       <div className="bg-white p-6 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
//         <div className="flex justify-between items-center mb-4">
//           <h2 className="text-xl font-bold">{file.name}</h2>
//           <div className="flex items-center gap-4">
//             <div className="flex items-center gap-2">
//               <button
//                 onClick={() => setScale(prev => Math.max(0.5, prev - 0.1))}
//                 className="px-2 py-1 bg-gray-100 rounded"
//               >
//                 -
//               </button>
//               <span className="mx-2">{Math.round(scale * 100)}%</span>
//               <button
//                 onClick={() => setScale(prev => Math.min(2, prev + 0.1))}
//                 className="px-2 py-1 bg-gray-100 rounded"
//               >
//                 +
//               </button>
//             </div>
//             <Button variant="ghost" size="sm" onClick={onClose}>
//               <X className="h-4 w-4" />
//             </Button>
//           </div>
//         </div>

//         {error ? (
//           <div className="text-red-500 text-center p-4">
//             {error}
//           </div>
//         ) : (
//           <div>
//             {pdfDocument && (
//               <div>
//                 {Array.from(new Array(pdfDocument.numPages), (el, index) => (
//                   <div key={`page_${index + 1}`} className="mb-4">
//                     <canvas
//                       className="w-full"
//                       ref={(ref) => {
//                         if (ref) {
//                           pdfDocument.getPage(index + 1).then((page) => {
//                             const viewport = page.getViewport({ scale });
//                             ref.width = viewport.width;
//                             ref.height = viewport.height;
//                             page.render({ canvasContext: ref.getContext('2d') as CanvasRenderingContext2D, viewport });
//                           });
//                         }
//                       }}
//                     />
//                     <p className="text-center text-sm text-gray-500 mt-2">
//                       Page {index + 1} of {pdfDocument.numPages}
//                     </p>
//                   </div>
//                 ))}
//               </div>
//             )}

//             {!pdfDocument && (
//               <div className="flex items-center justify-center p-12">
//                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
//               </div>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

export default function ProfileIdPage({ params }: ProfileIdPageProps) {
  const { user } = useUser()
  const documents = useQuery(api.documents.getPublishedDocuments)
  const latestDocuments = documents ? documents.slice(0, 6) : []
  const [allDocuments, setAllDocuments] = useState<CombinedContent[]>(latestDocuments || []);


  const Editor = useMemo(() => dynamic(() => import("@/components/editor"), { ssr: false }), [])

  const profile = useQuery(api.profiles.getById, {
    profileId: params.profileId,
  })

  const userDetails = useQuery(api.users.getUserByClerkId, user?.id ? { clerkId: user.id } : "skip")

  const getPostUrl = (post: Doc<"documents">) => {
    // If slug is available, use it; otherwise, fallback to ID
    return `/blog/${post.slug ?? post._id}`
  }

  // Retrieve user logo from user details, if available
  const userLogo = userDetails?.logoUrl
  const clientLogo = profile?.icon || "/acme.png"

  const updateProfile = useMutation(api.profiles.update)

  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)
  const [videoKey, setVideoKey] = useState(0)
  const [isReplyDialogOpen, setIsReplyDialogOpen] = useState(false)
  const [isCalDialogOpen, setIsCalDialogOpen] = useState(false)
  const [colorPreference, setColorPreference] = useState("#FFFFFF")
  const [pdfFiles, setPdfFiles] = useState<{ name: string; url: string }[]>([])
  const [selectedPdf, setSelectedPdf] = useState<string | null>(null)
  const [showAdditionalResources, setShowAdditionalResources] = useState(true)
  const [videoDescription, setVideoDescription] = useState(profile?.description || "")
  const [isEditingDescription, setIsEditingDescription] = useState(false)
  const descriptionRef = useRef<HTMLTextAreaElement>(null)
  const [selectedSites, setSelectedSites] = useState<string[]>([])
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const { resolvedTheme } = useTheme()
  const { edgestore } = useEdgeStore()

  useEffect(() => {
    if (profile?.colorPreference) {
      setColorPreference(profile.colorPreference)
    }
    if (profile?.description) {
      setVideoDescription(profile.description)
    }
  }, [profile])

  const [themeSettings, setThemeSettings] = useState({
    backgroundColor: profile?.themeSettings?.backgroundColor || "#FFFFFF",
    accentColor: profile?.themeSettings?.accentColor || "#000000",
    textColor: profile?.themeSettings?.textColor || "#000000",
  })

  useEffect(() => {
    if (profile?.themeSettings) {
      setThemeSettings(profile.themeSettings)
    }
  }, [profile])

  const handleColorChange = (type: "background" | "accent" | "text", newColor: string) => {
    const updatedThemeSettings = {
      ...themeSettings,
      [type === "background" ? "backgroundColor" : type === "accent" ? "accentColor" : "textColor"]: newColor,
    }

    setThemeSettings(updatedThemeSettings)
    updateProfile({
      id: params.profileId,
      // themeSettings: updatedThemeSettings
    })
  }

  const themeStyles = {
    button: {
      backgroundColor: themeSettings.accentColor,
      color: themeSettings.textColor,
      "&:hover": {
        backgroundColor: themeSettings.accentColor,
        filter: "brightness(90%)",
      },
    },
    hr: {
      borderColor: themeSettings.accentColor,
    },
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile?.displayName}'s Profile`,
          text: `Check out ${profile?.displayName}'s profile!`,
          url: window.location.href,
        })
      } catch (error) {
        console.error("Error sharing:", error)
      }
    } else {
      setIsShareDialogOpen(true)
    }
  }

  const { theme, setTheme } = useTheme()

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success("Profile link copied to clipboard!")
    setIsShareDialogOpen(false)
  }

  const handleVideoUpload = () => {
    setVideoKey((prevKey) => prevKey + 1)
  }

  const handlePdfUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files)
      for (const file of files) {
        try {
          const response = await edgestore.publicFiles.upload({
            file,
          })
          setPdfFiles((prev) => [...prev, { name: file.name, url: response.url }])
        } catch (error) {
          console.error("Error uploading file:", error)
          toast.error(`Failed to upload ${file.name}`)
        }
      }
    }
  }

  const handlePdfDelete = async (index: number) => {
    const fileToDelete = pdfFiles[index]
    try {
      await edgestore.publicFiles.delete({
        url: fileToDelete.url,
      })
      setPdfFiles(pdfFiles.filter((_, i) => i !== index))
      if (selectedPdf === fileToDelete.url) {
        setSelectedPdf(null)
      }
      toast.success(`${fileToDelete.name} deleted successfully`)
    } catch (error) {
      console.error("Error deleting file:", error)
      toast.error(`Failed to delete ${fileToDelete.name}`)
    }
  }

  const handleDeleteAllResources = async () => {
    try {
      for (const file of pdfFiles) {
        await edgestore.publicFiles.delete({
          url: file.url,
        })
      }
      setPdfFiles([])
      setSelectedPdf(null)
      toast.success("All resources deleted successfully")
    } catch (error) {
      console.error("Error deleting all resources:", error)
      toast.error("Failed to delete all resources")
    }
  }

  const handleDescriptionSave = () => {
    updateProfile({
      id: params.profileId,
      description: videoDescription,
    })
    setIsEditingDescription(false)
    toast.success("Video description updated successfully")
  }

  const handleDescriptionEdit = () => {
    setIsEditingDescription(true)
    setTimeout(() => {
      if (descriptionRef.current) {
        descriptionRef.current.focus()
      }
    }, 0)
  }

  if (!profile || userDetails === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    )
  }

  const gradientStyle = {
    background: `linear-gradient(to bottom, ${colorPreference}, #ffffff)`,
  }

  return (
    <div className={`min-h-screen overflow-x-auto ${profile.isDarkMode ? "dark" : ""}`} style={gradientStyle}>
      <div className="flex flex-col items-center pb-20 pt-6 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Logo Section */}
        <div className="w-full flex justify-center items-center mb-5">
          <div className="flex items-center space-x-4">
            {/* Use userLogo if it exists, otherwise show placeholder */}
            <LogoComparison userLogo={userLogo} clientLogo={clientLogo} containerClassName="my-8" />
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
            <Dialog open={isReplyDialogOpen} onOpenChange={setIsReplyDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  className="h-12 rounded-full text-base font-medium hover:scale-105 transition-transform mx-auto w-full"
                  style={{
                    backgroundColor: profile.themeSettings?.accentColor || "#000000",
                    color: "#FFFFFF",
                  }}
                >
                  <MessageSquare className="mr-2 h-4 w-4" /> Reply
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Reply to {user?.firstName}</DialogTitle>
                </DialogHeader>
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    setIsReplyDialogOpen(false)
                  }}
                  className="space-y-4 mt-4"
                >
                  <div>
                    <label className="block text-sm font-medium mb-2" htmlFor="name">
                      Your Name
                    </label>
                    <Input id="name" placeholder="Full Name" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" htmlFor="email">
                      Email Address
                    </label>
                    <Input id="email" type="email" placeholder="Email Address" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" htmlFor="message">
                      Your Message
                    </label>
                    <Textarea id="message" placeholder="Type your message here..." rows={6} required />
                  </div>
                  <Button type="submit" className="w-full">
                    Send
                  </Button>
                </form>
              </DialogContent>
            </Dialog>

            <SmartMeetingButton
              calComUsername={userDetails?.calComUsername}
              meetingLink={userDetails?.meetingLink}
              themeSettings={profile.themeSettings}
              className="h-12 rounded-full text-base font-medium hover:scale-105 transition-transform mx-auto w-full"
            />

            <Button
              className="h-12 rounded-full text-base font-medium hover:scale-105 transition-transform mx-auto w-full"
              onClick={handleShare}
              style={{
                backgroundColor: profile.themeSettings?.accentColor || "#000000",
                color: "#FFFFFF",
              }}
            >
              <Share2 className="mr-2 h-4 w-4" /> Share
            </Button>

            <Button
              className="h-12 rounded-full text-base font-medium hover:scale-105 transition-transform mx-auto w-full"
              style={{
                backgroundColor: profile.themeSettings?.accentColor || "#000000",
                color: "#FFFFFF",
              }}
              asChild
            >
              <a href={userDetails?.linkedin || "#"} target="_blank" rel="noopener noreferrer">
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

        {/* More from {user.firstName} Section */}
        {user && latestDocuments.length > 0 && (
        <div className="mt-12 w-full">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold" style={{ color: "#000000" }}>
              More from {user.firstName}
            </h2>
            <Button variant="outline" size="sm" onClick={() => setIsEditDialogOpen(true)}>
              <Edit2 className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {(selectedSites.length > 0 
                ? allDocuments.filter(doc => selectedSites.includes(doc._id))
                : allDocuments.slice(0, 6)
              ).map((post) => {
                const isExternal = 'isExternalLink' in post && post.isExternalLink;
                const postUrl = isExternal ? post.url : getPostUrl(post as Doc<"documents">);
                
                return (
                  <MotionLink
                    key={post._id}
                    href={postUrl}
                    className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
                    whileHover={{ y: -5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    target={isExternal ? "_blank" : undefined}
                    rel={isExternal ? "noopener noreferrer" : undefined}
                  >
                    <div className="relative h-48">
                      <img
                        src={post.coverImage || "/placeholder.svg?height=300&width=400"}
                        alt={post.title}
                        className="w-full h-full object-cover rounded-t-lg"
                      />
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
                        <Calendar className="h-4 w-4" />
                        {new Date(post._creationTime).toLocaleDateString()}
                      </div>
                      <h3 className="text-lg font-semibold mb-2 line-clamp-2">{post.title}</h3>
                      <p className="text-gray-600 text-sm">By {user?.fullName || "Unknown Author"}</p>
                    </div>
                  </MotionLink>
                );
              })}
            </div>
            <ContentSelectionDialog
              isOpen={isEditDialogOpen}
              onOpenChange={setIsEditDialogOpen}
              documents={allDocuments}
              selectedSites={selectedSites}
              onSelectionChange={setSelectedSites}
              onDocumentsChange={setAllDocuments}
            />
          </div>
        )}
      </div>
    </div>
  )
}

