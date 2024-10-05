"use client"

import { useState } from 'react'
import Link from 'next/link'
import { useConvexAuth } from "convex/react"
import { SignInButton, UserButton } from "@clerk/clerk-react"
import { Menu } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Logo } from "./logo";
import { Spinner } from "@/components/spinner"
import { useScrollTop } from "@/hooks/use-scroll-top"

interface NavItemsProps {
    isAuthenticated: boolean;
    isLoading: boolean;
}

const NavItems: React.FC<NavItemsProps> = ({ isAuthenticated, isLoading }) => (
    <>
        {isLoading && (
            <Spinner />
        )}
        {!isAuthenticated && !isLoading && (
            <>
                <SignInButton mode="modal">
                    <Button variant="ghost" size="sm">
                        Log in
                    </Button>
                </SignInButton>
                <SignInButton>
                    <Button size="sm">
                        Get Citrus free
                    </Button>
                </SignInButton>
            </>
        )}
        {isAuthenticated && !isLoading && (
            <>
                <Button variant="ghost" size="sm" asChild>
                    <Link href="/documents">
                        Enter Citrus
                    </Link>
                </Button>
                <UserButton
                    afterSignOutUrl="/"
                />
            </>
        )}
    </>
)

export const Navbar: React.FC = () => {
    const { isAuthenticated, isLoading } = useConvexAuth()
    const scrolled = useScrollTop()
    const [isOpen, setIsOpen] = useState(false)

    const toggleMenu = () => setIsOpen(!isOpen)

    return (
        <div className={cn(
            "z-50 fixed top-0 w-full p-4 md:p-6 backdrop-filter backdrop-blur-lg bg-orange-50/80 dark:bg-[#1F1F1F]/80",
             scrolled && "border-b shadow-md"
        )}>
            <div className="flex items-center justify-between max-w-8xl mx-auto">
                <div className="flex items-center flex-1">
                    <Sheet open={isOpen} onOpenChange={setIsOpen}>
                        <SheetTrigger asChild className="md:hidden mr-4">
                            <Button variant="ghost" size="icon">
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Toggle menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                            <nav className="flex flex-col gap-4">
                                <Button variant="ghost" asChild onClick={toggleMenu}>
                                    <Link href="/about">About</Link>
                                </Button>
                                <Button variant="ghost" asChild onClick={toggleMenu}>
                                    <Link href="/blog">Blog</Link>
                                </Button>
                            </nav>
                        </SheetContent>
                    </Sheet>
                    <Logo />
                    <div className="hidden md:flex items-center ml-16">
                        <Button variant="link" size="lg" asChild>
                            <Link href="/about">About</Link>
                        </Button>
                        <Button variant="link" size="sm" asChild>
                            <Link href="/blog">Blog</Link>
                        </Button>
                    </div>
                </div>
                <div className="flex items-center justify-end space-x-2">
                    <div className="hidden md:flex items-center gap-x-2">
                        <NavItems isAuthenticated={isAuthenticated} isLoading={isLoading} />
                    </div>
                    <div className="md:hidden flex items-center space-x-2">
                        {isAuthenticated && !isLoading && (
                            <Button variant="ghost" size="sm" asChild className="mr-2">
                                <Link href="/documents">
                                    Enter Citrus
                                </Link>
                            </Button>
                        )}
                        {!isAuthenticated && !isLoading && (
                            <SignInButton mode="modal">
                                <Button variant="ghost" size="sm">
                                    Log in
                                </Button>
                            </SignInButton>
                        )}
                        {isLoading && (
                            <Spinner />
                        )}
                        {isAuthenticated && !isLoading && (
                            <UserButton afterSignOutUrl="/" />
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}