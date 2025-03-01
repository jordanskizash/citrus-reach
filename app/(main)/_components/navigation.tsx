"use client";

import { ChevronsLeft, CirclePlusIcon, CreditCard, LineChart, MenuIcon, Plus, PlusCircle, Search, Settings, Trash } from 'lucide-react';
import { ElementRef, useRef, useState, useEffect } from "react";
import { useMediaQuery } from "usehooks-ts";
import { useParams, usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { api } from "@/convex/_generated/api";
import { UserItem } from "./user-item";
import { useAction, useMutation, useQuery } from "convex/react";
import { Item } from "./item";
import toast from "react-hot-toast";
import { DocumentList } from "./document-list";
import { ProfileList } from "./profile-list";
import{
    Popover,
    PopoverTrigger,
    PopoverContent,
} from "@/components/ui/popover";
import { useSearch } from "@/hooks/use-search";
import { useSettings } from "@/hooks/use-settings";
import { TrashBox } from "./trash-box";
import { Navbar } from "./navbar";
import { NavbarProfile } from "./navbarprof";
import { EventList } from "./event-list";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/clerk-react";
import { Progress } from "@/components/ui/progress";
import NavbarEvents from "./navbarevent";
import { UserDropdown } from "./user-dropdown";
import Image from "next/image";




export const Navigation = () => {
    const router = useRouter();
    const settings = useSettings();
    const search = useSearch();
    const params = useParams();
    const pathname = usePathname();
    const isMobile = useMediaQuery("(max-width: 768px)");
    const create = useAction(api.documents.create);
    const createProf = useMutation(api.profiles.create);
    const createEvent = useMutation(api.events.create);

    const isResizingRef = useRef(false);
    const sidebarRef = useRef<ElementRef<"aside">>(null);
    const navbarRef = useRef<ElementRef<"div">>(null);
    const [isResetting, setIsResetting] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false); 

    const [isLoading, setIsLoading] = useState(false);
    const createSubscriptionSession = useAction(api.stripe.createSubscriptionSession);

    const { user } = useUser();

    const documents = useQuery(api.documents.getSidebar, {
        parentDocument: undefined
      });
      
    const profiles = useQuery(api.profiles.getSidebar, {
        parentProfile: undefined
      });
      
    const events = useQuery(api.events.getSidebar, {
        // Assuming events has the same pattern as documents and profiles
      });
      
    // Calculate total items (credits in use)
    const creditsInUse = (documents?.length ?? 0) + 
    (profiles?.length ?? 0) + 
    (events?.length ?? 0);

  
  
    // Determine color based on usage
    const getProgressColor = (percentage: number) => {
        if (percentage >= 90) return "bg-red-500";
        if (percentage >= 70) return "bg-orange-300";
        return "bg-gray-300";
    };

    const userDetails = useQuery(api.users.getUserByClerkId, {
        clerkId: user?.id ?? ""
      });

    const subscription = useQuery(api.users.getUserSubscription, {
    clerkId: user?.id ?? ""
    });

    const totalAllowed = subscription?.tier === "pro" ? Infinity : 20;
    const currentUsage = (documents?.length ?? 0) + (profiles?.length ?? 0) + (events?.length ?? 0);
    const usagePercentage = totalAllowed === Infinity ? 0 : (currentUsage / totalAllowed) * 100;

    const navigateToAnalytics = () => {
        router.push('/analytics');  
    };

    const navigateToDashboard = () => {
        router.push('/dashboard');
    };

    const userExists = useQuery(api.users.checkUserExists, {
        clerkId: user?.id ?? ""
      });

    // Add this temporarily to check user status
    useEffect(() => {
        console.log('User status:', userExists);
    }, [userExists]);

    useEffect (() => {
        if(isMobile) {
            collapse();
        } else {
            resetWidth();
        }
    }, [isMobile]);

    useEffect (() => {
        if (isMobile) {
            collapse();
        }
    }, [pathname, isMobile]);

    const handleMouseDown = (
        event: React.MouseEvent<HTMLDivElement, MouseEvent>
    ) => {
        event. preventDefault();
        event.stopPropagation();

        isResizingRef.current = true;
        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
    }

    const handleMouseMove = (event: MouseEvent) => {
        if (!isResizingRef.current) return;
        let newWidth = event.clientX;

        if (newWidth < 240) newWidth = 240;
        if (newWidth > 480) newWidth = 480;

        if (sidebarRef.current && navbarRef.current) {
            sidebarRef.current.style.width = `${newWidth}px`;
            navbarRef.current.style.setProperty("left", `${newWidth}px`);
            navbarRef.current.style.setProperty("width", `calc(100% - ${newWidth}px)`);
        }
    }
    
    const handleMouseUp = () => {
        isResizingRef.current = false;
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
    };

    const resetWidth = () => {
        if (sidebarRef.current && navbarRef.current) {
            setIsCollapsed(false);
            setIsResetting(true);

            sidebarRef.current.style.width = isMobile ? "100%" : "240px";
            navbarRef.current.style.setProperty(
                "width",
                isMobile ? "0" : "calc(100%-240px)"
            );
            navbarRef.current.style.setProperty(
                "left",
                isMobile? "100%": "240px"
            );
            setTimeout(() => setIsResetting(false), 300);
        }
    };

    const collapse = () => {
        if (sidebarRef.current && navbarRef.current) {
            setIsCollapsed(true);
            setIsResetting(true);

            sidebarRef.current.style.width="0";
            navbarRef.current.style.setProperty("width", "100%");
            navbarRef.current.style.setProperty("left", "0");
            setTimeout(() => setIsResetting(false), 300);
        }
    }

    const handlecreateProfile = async () => {
        // Check if user has available credits
        const promise = createProf({
            displayName: "Untitled",
            authorFullName: "Untitled"
        });
        
        toast
            .promise(promise, {
                loading: "Creating a new profile...",
                success: "New profile created!",
                error: "Failed to create new profile.",
            })
            .then((profileId) => {
                router.push(`/profiles/${profileId}`);
            });
    };


    const handleCreate = () => {
        // Check if user has available credits
        const promise = create({ title: "Untitled" })
            .then((documentId) => router.push(`/documents/${documentId}`))
    
        toast.promise(promise, {
            loading: "Creating a new blog",
            success: "New Blog Created!",
            error: "Failed to create a new blog",
        });
    };

    const handleUpgrade = async () => {
        try {
          setIsLoading(true);
          
          if (!user?.id) {
            toast.error("Please log in to subscribe");
            return;
          }
      
          const priceId = subscription?.tier === "standard" 
            ? process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID 
            : process.env.NEXT_PUBLIC_STRIPE_STANDARD_PRICE_ID;
      
          const tier = subscription?.tier === "standard" ? "pro" : "standard";
      
          // Change this line:
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
          console.error('Upgrade error:', error);
          toast.error("Something went wrong");
        } finally {
          setIsLoading(false);
        }
      };

      // Log user details on every render for debugging
    useEffect(() => {
        console.log('Current user state:', {
        clerkId: user?.id,
        userDetails,
        credits: userDetails?.credits
        });
    }, [user, userDetails]);

    const handleCreateEvent = () => {
        const promise = createEvent({ 
            title: "Untitled Event",
            description: "",
            eventDate: new Date().toISOString(),
            eventTime: "12:00",
            location: "",
            isArchived: false,
            isPublished: false
        })
            .then((eventId) => router.push(`/events/${eventId}`))

        toast.promise(promise, {
            loading: "Creating a new event...",
            success: "New event created!",
            error: "Failed to create a new event"
        });
    };

    return ( 
        <>
            <aside
                ref={sidebarRef}
                className={cn("group/sidebar h-full bg-secondary overflow-y-auto relative flex w-60 flex-col z-[99999]", 
                    isResetting && "transition-all ease-in-out duration-300",
                    isMobile && "w-0"
                )}
            >
                <div
                    onClick={collapse}
                    role="button"
                    className={cn("h-6 w-6 text-mutued-foreground rounded-sm hover:bg-neutral-300 dark:hover:bg-neutral-600 absolute top-3 right-2 opacity-0 group-hover/sidebar:opacity-100 transition",
                        isMobile && "opacity-100"
                    )}>
                        <ChevronsLeft className="h-6 w-6"/>
                </div>
                <div>
                <div className="flex items-center justify-start px-4 py-4 mb-2 mt-2">
                        <Image 
                            src="/CitrusName.png" 
                            alt="Citrus Logo" 
                            width={80} 
                            height={20} 
                            priority
                        />
                    </div>
                    <Item
                        label="Dashboard" 
                        icon={LineChart}
                        onClick={navigateToDashboard}
                    />
                    <Item
                        label="Search" 
                        icon={Search}
                        isSearch
                        onClick={search.onOpen}
                    />
                    {/* <Item
                        label="Settings"
                        icon={Settings}
                        onClick={() => window.location.href = '/settings'}
                    /> */}
                    <Item
                        onClick={handleCreate} 
                        label="New Site" 
                        icon={PlusCircle} 
                    />
                </div>
                <div className="mt-4">
                    <div className="flex items-center justify-between ml-4 mb-2 mt-8">
                    <h1 className="text-sm text-muted-foreground">Blogs</h1>
                    <div 
                        onClick={() => {}} 
                        className="cursor-pointer group-hover:opacity-100 h-full ml-auto rounded-md hover:bg-neutral-300 dark:hover:bg-neutral-600 mr-2"
                    >
                        <CirclePlusIcon className="h-5 w-5 text-muted-foreground" onClick={handleCreate} />  
                    </div>
                </div>
                    <DocumentList />

                {/* Add this block for the Profiles header */}
                <div className="flex items-center justify-between mt-4 ml-4 mb-2">
                    <h1 className="text-sm text-muted-foreground">Profiles</h1>
                    <div 
                        onClick={() => {}} 
                        className="cursor-pointer group-hover:opacity-100 h-full ml-auto rounded-md hover:bg-neutral-300 dark:hover:bg-neutral-600 mr-2"
                    >
                        <CirclePlusIcon className="h-5 w-5 text-muted-foreground" onClick={handlecreateProfile} />  
                    </div>
                </div>
                    <ProfileList />

                {/* Events Section */}
                <div className="flex items-center justify-between mt-4 ml-4 mb-2">
                        <h1 className="text-sm text-muted-foreground">Events</h1>
                        <div 
                            // className="cursor-pointer group-hover:opacity-100 h-full ml-auto rounded-md hover:bg-neutral-300 dark:hover:bg-neutral-600 mr-2"
                        >
                            <h2 className="text-sm text-muted-foreground mr-4">Coming soon!</h2>
                            {/* <CirclePlusIcon className="h-5 w-5 text-muted-foreground" onClick={handleCreateEvent} />   */}
                        </div>
                    </div>
                    {/* <EventList /> */}
                    {/* <Item 
                        onClick={handleCreate} 
                        icon={Plus}
                        label="Add a page"
                    /> */}
                    <Popover>
                        <PopoverTrigger className="w-full mt-4">
                            <Item label="Trash" icon={Trash} />
                        </PopoverTrigger>
                        <PopoverContent 
                            className="p=0 w-72"
                            side={isMobile ? "bottom" : "right"}
                        >
                            <TrashBox />
                        </PopoverContent>
                    </Popover>
                </div>
                <div
                    onMouseDown={handleMouseDown}
                    onClick={resetWidth}
                    className="opacity-0 group-hover/sidebar:opacity-100 transition cursor-ew-resize absolute h-full w-1 bg-primary/10 right-0 top-0"
                />
                 <div className="mt-auto">
                <UserDropdown />
            </div>
            </aside>
            <div
                ref={navbarRef}
                className={cn(
                    "absolute top-0 z-[99999] left-60 w-[calc(100%-240px)]", 
                    isResetting && "transition-all ease-in-out duration-300",
                    isMobile && "left-0 w-full"
                )}
            >
                {!!params.documentId ? (
                    <Navbar 
                        isCollapsed={isCollapsed}
                        onResetWidth={resetWidth}
                    />
                ) : !!params.eventId ? (
                    <NavbarEvents
                        isCollapsed={isCollapsed}
                        onResetWidth={resetWidth}
                    />
                ) : (
                <nav className="bg-transparent px-3 py-2 w-full">
                    {isCollapsed && <MenuIcon onClick={resetWidth} role="button" className="h-6 w-6 text-mutued-foreground" />}
                </nav>
                )}
            </div>
        </>
     );
}

