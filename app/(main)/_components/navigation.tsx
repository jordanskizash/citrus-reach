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
import { UnifiedSiteList } from "./unified-site-list";
import{
    Popover,
    PopoverTrigger,
    PopoverContent,
} from "@/components/ui/popover";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useSearch } from "@/hooks/use-search";
import { useSettings } from "@/hooks/use-settings";
import { TrashBox } from "./trash-box";
import { Navbar } from "./navbar";
import { NavbarProfile } from "./navbarprof";
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
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false); 

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
                    <Item
                        label="Settings"
                        icon={Settings}
                        onClick={() => window.location.href = '/settings'}
                    />
                    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                        <DialogTrigger asChild>
                            <div>
                                <Item
                                    onClick={() => setIsCreateDialogOpen(true)} 
                                    label="New Site" 
                                    icon={PlusCircle} 
                                />
                            </div>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>Create New Site</DialogTitle>
                            </DialogHeader>
                            <div className="grid grid-cols-2 gap-4 py-4">
                                <button
                                    onClick={() => {
                                        handleCreate();
                                        setIsCreateDialogOpen(false);
                                    }}
                                    className="flex flex-col items-center justify-center p-6 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group"
                                >
                                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-blue-200">
                                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2m-2 9h2m-2 0V9.5m0 10.5H9" />
                                        </svg>
                                    </div>
                                    <span className="font-medium text-gray-900">Blog</span>
                                    <span className="text-sm text-gray-500 text-center">Create articles and posts</span>
                                </button>
                                
                                <button
                                    onClick={() => {
                                        handlecreateProfile();
                                        setIsCreateDialogOpen(false);
                                    }}
                                    className="flex flex-col items-center justify-center p-6 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group"
                                >
                                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-green-200">
                                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    <span className="font-medium text-gray-900">Profile</span>
                                    <span className="text-sm text-gray-500 text-center">Personal or company page</span>
                                </button>
                                
                                <div className="flex flex-col items-center justify-center p-6 border border-gray-200 rounded-lg bg-gray-50 cursor-not-allowed opacity-60">
                                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center mb-3">
                                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <span className="font-medium text-gray-400">Event</span>
                                    <span className="text-sm text-gray-400 text-center">Coming soon</span>
                                </div>
                                
                                <div className="flex flex-col items-center justify-center p-6 border border-gray-200 rounded-lg bg-gray-50 cursor-not-allowed opacity-60">
                                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center mb-3">
                                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                    </div>
                                    <span className="font-medium text-gray-400">Deal Room</span>
                                    <span className="text-sm text-gray-400 text-center">Coming soon</span>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
                <div className="mt-4">
                    <div className="flex items-center justify-between ml-4 mb-2 mt-8">
                        <h1 className="text-sm text-muted-foreground">All Sites</h1>
                        <div 
                            onClick={() => setIsCreateDialogOpen(true)} 
                            className="cursor-pointer group-hover:opacity-100 h-full ml-auto rounded-md hover:bg-neutral-300 dark:hover:bg-neutral-600 mr-2"
                        >
                            <CirclePlusIcon className="h-5 w-5 text-muted-foreground" />  
                        </div>
                    </div>
                    <UnifiedSiteList />
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
