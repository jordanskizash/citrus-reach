"use client";

import Image from "next/image";
import { useUser } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Bell, ChevronRight, Home, Mail, PlusCircle, Settings, User, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

import { useAction, useMutation} from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "react-hot-toast";
import { useState } from "react";



const DocumentsPage = () => {
    const { user } = useUser();
    const router = useRouter();
    const create = useAction(api.documents.create);
    const createProf = useMutation(api.profiles.create);

    const [selectedImage, setSelectedImage] = useState<number | null>(null)

    const handleImageClick = (index: number) => {
      setSelectedImage(selectedImage === index ? null : index)

    }

    const [sidebarOpen, setSidebarOpen] = useState(false)

    const onCreateNote = () => {
        const promise = create({ title: "Untitled" })
            .then((documentId) => router.push(`/documents/${documentId}`))

        toast.promise(promise, {
            loading: "Creating a new site...",
            success: "New site created!",
            error: "Failed to create a new site.",
        });
    };

    const onCreateProfile = () => {
      const timestamp = Date.now().toString().slice(-4);
      const authorSlug = "jstein-" + timestamp;
      
      const promise = createProf({ 
          displayName: "JSTEIN", 
          bio: "Hello Mates",
          authorFullName: "JSTEIN" // Instead of handle, we use authorFullName
      })
      .then((profileId) => router.push(`/profiles/${profileId}`))
      
      toast.promise(promise, {
          loading: "Creating a new profile...",
          success: "New profile created!",
          error: "Failed to create a new profile.",
      });
  };
  

    const onCreateSales = () => {
      const promise = create({ title: "Start a brief..." })
          .then((documentId) => router.push(`/documents/${documentId}`))

      toast.promise(promise, {
          loading: "Creating a new site...",
          success: "New site created!",
          error: "Failed to create a new site.",
      });
  };
  
  const images = [
    { src: "/doc.png", label: "Start from Scratch", action: () => alert("Home clicked") },
    { src: "/proftemp.png", label: "Personal Page", action: () => alert("Settings clicked") },
    { src: "/blogpic.png", label: "Blog", action: () => alert("Notifications clicked") },
    { src: "/eventpic.png", label: "Event", action: () => alert("Profile clicked") },
  ]
  
  const moreOptions = [
    { label: "Search", action: () => alert("Search clicked") },
    { label: "Help", action: () => alert("Help clicked") },
    { label: "About", action: () => alert("About clicked") },
  ]
    

    



    // return ( 
    //     <div className="h-full flex flex-col items-center justify-center space-y-4">
    //         <Image 
    //             src="/orange.png"
    //             height="300"
    //             width="300"
    //             alt="Empty"
    //             className="dark:hidden"
    //         />
    //         <Image 
    //             src="/orange.png"
    //             height="300"
    //             width="300"
    //             alt="Empty"
    //             className="hidden dark:block"
    //         />
    //         <h2 className="text-lg font-medium">
    //             Welcome to {user?.firstName}&apos;s Citrus!
    //         </h2>
    //         <Button onClick={onCreate}>
    //             <PlusCircle className="h-4 w-4 mr-2"/>
    //             Create a site
    //         </Button>
    //     </div>
    //  );

    return (
        <div className="container mx-auto px-4 py-12 md:px-6 lg:py-16">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Choose a Template</h1>
            <p className="mt-2 text-lg text-muted-foreground">
              Select from our collection of templates to start building your microsite.
            </p>
          </div>
          <div className="bg-background flex items-center">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-3 gap-4 mb-4">
                {images.slice(0, 3).map(({ src, label, action }) => (
                  <div key={label} className="flex flex-col items-center">
                    <Button
                      variant="outline"
                      size="icon"
                      className="w-18 h-18 p-0  overflow-hidden"
                      onClick={onCreateNote}
                    >
                      <Image src={src} alt={label} width={64} height={64} />
                    </Button>
                    <span className="mt-1 text-xs text-muted-foreground">{label}</span>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-4">
                {images.slice(3, 5).map(({ src, label, action }, index) => (
                  <div key={label} className={`flex flex-col items-center ${index === 1 ? 'col-start-2' : ''}`}>
                    <Button
                      variant="outline"
                      size="icon"
                      className="w-18 h-18 p-0 overflow-hidden"
                      onClick={onCreateProfile}
                    >
                      <Image src={src} alt={label} width={64} height={64} />
                    </Button>
                    <span className="mt-1 text-xs text-muted-foreground">{label}</span>
                  </div>
                ))}
                <div className="flex flex-col items-center justify-end">
                  <Button
                    variant="outline"
                    size="icon"
                    className="w-16 h-16 rounded-full"
                    onClick={() => setSidebarOpen(true)}
                  >
                    <ChevronRight className="h-8 w-8" />
                    <span className="sr-only">View More</span>
                  </Button>
                  <span className="mt-1 text-xs text-muted-foreground">View More</span>
                </div>
              </div>
            </div>
            
            {/* Sidebar */}
            <div className={`fixed inset-y-0 right-0 w-64 bg-background border-l transform ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 ease-in-out`}>
              <div className="p-4">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold">More Options</h2>
                  <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                    <X className="h-6 w-6" />
                    <span className="sr-only">Close sidebar</span>
                  </Button>
                </div>
                <div className="space-y-4">
                  {moreOptions.map(({ label, action }) => (
                    <Button key={label} variant="ghost" className="w-full justify-start" onClick={action}>
                      {label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="mt-8 text-center">
            <Button onClick={onCreateNote} size="lg" className="w-full max-w-md">
              Create Site
            </Button>
          </div>
        </div>
      )
    }
 
export default DocumentsPage;