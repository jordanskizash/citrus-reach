"use client";

import Image from "next/image";
import { useUser } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { ArrowRight, PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";

import { useMutation} from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "react-hot-toast";


const DocumentsPage = () => {
    const { user } = useUser();
    const router = useRouter();
    const create = useMutation(api.documents.create);

    const onCreateNote = () => {
        const promise = create({ title: "Untitled" })
            .then((documentId) => router.push(`/documents/${documentId}`))

        toast.promise(promise, {
            loading: "Creating a new site...",
            success: "New site created!",
            error: "Failed to create a new site.",
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
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="overflow-hidden rounded-lg shadow-lg hover:shadow-orange-300" onClick={onCreateNote}>
              <div className="relative h-48 w-full">
                <img
                  src="/writebetter.png"
                  alt="Card Image"
                  width={600}
                  height={400}
                  className="h-full w-full object-cover"
                  style={{ aspectRatio: "600/400", objectFit: "cover" }}
                />
              </div>
              <CardContent className="p-4">
                <h3 className="text-xl font-semibold">Note Pad</h3>
                <p className="mt-2 text-muted-foreground">A clean, functional text-editor to store notes.</p>
              </CardContent>
            </Card>
            <Card className="overflow-hidden rounded-lg shadow-lg shadow-orange-300" onClick={onCreateSales}>
              <div className="relative h-48 w-full">
                <img
                  src="/write.png"
                  alt="Card Image"
                  width={600}
                  height={400}
                  className="h-full w-full object-cover"
                  style={{ aspectRatio: "600/400", objectFit: "cover" }}
                />
              </div>
              <CardContent className="p-4">
                <h3 className="text-xl font-semibold">Sales Outreach</h3>
                <p className="mt-2 text-muted-foreground">Showcase your work and skills with this portfolio template.</p>
              </CardContent>
            </Card>
            <Card className="overflow-hidden rounded-lg shadow-lg hover:shadow-orange-300" onClick={onCreateNote}>
              <div className="relative h-48 w-full">
                <img
                  src="/checkout.png"
                  alt="Card Image"
                  width={600}
                  height={400}
                  className="h-full w-full object-cover"
                  style={{ aspectRatio: "600/400", objectFit: "cover" }}
                />
              </div>
              <CardContent className="p-4">
                <h3 className="text-xl font-semibold">E-commerce</h3>
                <p className="mt-2 text-muted-foreground">Sell your products with this modern e-commerce template.</p>
              </CardContent>
            </Card>
            <Card className="overflow-hidden rounded-lg shadow-lg hover:shadow-orange-300" onClick={onCreateNote}>
              <div className="relative h-48 w-full">
                <img
                  src="/resume.png"
                  alt="Card Image"
                  width={600}
                  height={400}
                  className="h-full w-full object-cover"
                  style={{ aspectRatio: "600/400", objectFit: "cover" }}
                />
              </div>
              <CardContent className="p-4">
                <h3 className="text-xl font-semibold">Resume</h3>
                <p className="mt-2 text-muted-foreground">Showcase your business with this professional template.</p>
              </CardContent>
            </Card>
            <Card className="overflow-hidden rounded-lg shadow-lg hover:shadow-orange-300" onClick={onCreateNote}>
              <div className="relative h-48 w-full">
                <img
                  src="/eventdetails.png"
                  alt="Card Image"
                  width={600}
                  height={400}
                  className="h-full w-full object-cover"
                  style={{ aspectRatio: "600/400", objectFit: "cover" }}
                />
              </div>
              <CardContent className="p-4">
                <h3 className="text-xl font-semibold">Event</h3>
                <p className="mt-2 text-muted-foreground">Promote your event with this engaging template.</p>
              </CardContent>
            </Card>
            <Card className="overflow-hidden rounded-lg shadow-lg hover:shadow-orange-300" onClick={onCreateNote}>
              <div className="relative h-48 w-full">
                <img
                  src="/domain.png"
                  alt="Card Image"
                  width={600}
                  height={400}
                  className="h-full w-full object-cover"
                  style={{ aspectRatio: "600/400", objectFit: "cover" }}
                />
              </div>
              <CardContent className="p-4">
                <h3 className="text-xl font-semibold">Blog</h3>
                <p className="mt-2 text-muted-foreground">Raise awareness and funds with this non-profit template.</p>
              </CardContent>
            </Card>
          </div>
          <div className="mt-8 text-center">
            <Button onClick={onCreateNote} size="lg" className="w-full max-w-md">
              Create Site
              <ArrowRight className="ml-10" />
            </Button>
          </div>
        </div>
      )
    }
 
export default DocumentsPage;