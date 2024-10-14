"use client"

import { useState } from 'react'
import Link from 'next/link'
import { useConvexAuth } from "convex/react"
import { SignInButton, UserButton } from "@clerk/clerk-react"
import { Menu, ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { Logo } from "./logo"
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
          <Link href="/dashboard">
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

const ExamplesDropdown = () => (
  <NavigationMenu>
    <NavigationMenuList>
      <NavigationMenuItem>
        <NavigationMenuTrigger className="bg-orange-50 hover:bg-orange-50">Examples</NavigationMenuTrigger>
        <NavigationMenuContent >
          <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
            <li className="row-span-3">
              <NavigationMenuLink asChild>
                <a
                  className="bg-gray-100 flex h-full w-full select-none flex-col justify-end rounded-md p-6 no-underline outline-none focus:shadow-md"
                  href="/"
                >
                  <Logo />
                  <p className="mt-6 text-sm leading-tight text-muted-foreground">
                    Beautifully designed microsites to help you secure meetings
                  </p>
                </a>
              </NavigationMenuLink>
            </li>
            <ListItem className="hover:bg-gray-100" href="/examples/notes" title="Notes">
              Create and manage your notes with ease.
            </ListItem>
            <ListItem className="hover:bg-gray-100" href="/examples/tasks" title="Tasks">
              Organize your tasks and boost productivity.
            </ListItem>
            <ListItem className="hover:bg-gray-100" href="/examples/calendar" title="Calendar">
              Schedule and manage your events effortlessly.
            </ListItem>
          </ul>
        </NavigationMenuContent>
      </NavigationMenuItem>
    </NavigationMenuList>
  </NavigationMenu>
)

const ListItem = ({ className, title, children, ...props }: React.ComponentPropsWithoutRef<"a"> & { title: string }) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  )
}

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
                <ExamplesDropdown />
              </nav>
            </SheetContent>
          </Sheet>
          <Logo />
          <div className="hidden md:flex items-center ml-16">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Button variant="link" size="lg" asChild>
                      <Link href="/about">About</Link>
                    </Button>
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Button variant="link" size="lg" asChild>
                      <Link href="/blog">Blog</Link>
                    </Button>
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <ExamplesDropdown />
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </div>
        <div className="flex items-center justify-end space-x-2">
          <div className="hidden md:flex items-center gap-x-2">
            <NavItems isAuthenticated={isAuthenticated} isLoading={isLoading} />
          </div>
          <div className="md:hidden flex items-center space-x-2">
            {isAuthenticated && !isLoading && (
              <Button variant="ghost" size="sm" asChild className="mr-2">
                <Link href="/dashboard">
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