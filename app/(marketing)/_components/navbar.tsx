"use client"

import { useState } from 'react'
import Link from 'next/link'
import { useConvexAuth } from "convex/react"
import { SignInButton, UserButton } from "@clerk/clerk-react"
import { Menu } from "lucide-react"

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
          <Button 
            variant="ghost" 
            size="sm"
            className="text-gray-700 hover:text-gray-900"
          >
            Sign In
          </Button>
        </SignInButton>
        <SignInButton>
          <Button 
            size="sm"
            className="bg-orange-50 hover:bg-orange-100 text-orange-500"
          >
            Try Citrus Free
          </Button>
        </SignInButton>
      </>
    )}
    {isAuthenticated && !isLoading && (
      <>
        <Button 
          variant="ghost" 
          size="sm" 
          asChild
          className="text-gray-700 hover:text-gray-900"
        >
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
        <NavigationMenuTrigger 
          className="bg-transparent hover:bg-transparent focus:bg-transparent data-[state=open]:bg-transparent data-[active]:bg-transparent"
        >
          <Button variant="ghost" size="sm" className="text-gray-700 hover:text-gray-900">
            Examples
          </Button>
        </NavigationMenuTrigger>
        <NavigationMenuContent className="bg-white">
          <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
            <li className="row-span-3">
              <NavigationMenuLink asChild>
                <a
                  className="flex h-full w-full select-none flex-col justify-end rounded-md p-6 no-underline outline-none focus:shadow-md bg-white"
                  href="/"
                >
                  <Logo />
                  <p className="mt-6 text-sm leading-tight text-muted-foreground">
                    Beautifully designed microsites to help you secure meetings
                  </p>
                </a>
              </NavigationMenuLink>
            </li>
            <ListItem href="/blog" title="Blog Post">
              Create professional blog posts quickly with our editor
            </ListItem>
            <ListItem href="/examples/tasks" title="Video Profile">
              Create video profiles that reach prospects and book meetings
            </ListItem>
            <ListItem href="/examples/calendar" title="Event">
              Coming Soon
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
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground bg-white",
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

const MainNav = () => (
  <nav className="hidden md:flex items-center space-x-8">
    <NavigationMenu>
      <NavigationMenuList className="space-x-2">
        <NavigationMenuItem>
          <Button 
            variant="ghost" 
            size="sm"
            className="text-gray-700 hover:text-gray-900"
            asChild
          >
            <Link href="/about">About</Link>
          </Button>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Button 
            variant="ghost" 
            size="sm"
            className="text-gray-700 hover:text-gray-900"
            asChild
          >
            <Link href="/blog">Blog</Link>
          </Button>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Button 
            variant="ghost" 
            size="sm"
            className="text-gray-700 hover:text-gray-900"
            asChild
          >
            <Link href="/pricing">Pricing</Link>
          </Button>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <ExamplesDropdown />
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  </nav>
)

export const Navbar: React.FC = () => {
  const { isAuthenticated, isLoading } = useConvexAuth()
  const scrolled = useScrollTop()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className={cn(
      "z-50 fixed top-0 w-full bg-white border-b border-black",
      scrolled && "shadow-sm"
    )}>
      <div className="flex h-16 items-center px-4 md:px-6">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" className="mr-2">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[400px]">
            <nav className="flex flex-col gap-4">
              <Button variant="ghost" className="justify-start" asChild>
                <Link href="/about">About</Link>
              </Button>
              <Button variant="ghost" className="justify-start" asChild>
                <Link href="/blog">Blog</Link>
              </Button>
              <Button variant="ghost" className="justify-start" asChild>
                <Link href="/pricing">Pricing</Link>
              </Button>
              <ExamplesDropdown />
            </nav>
          </SheetContent>
        </Sheet>

        <div className="flex items-center flex-1">
          <Logo />
        </div>

        <div className="flex-1 flex justify-center">
          <MainNav />
        </div>

        <div className="flex items-center justify-end flex-1">
          <NavItems isAuthenticated={isAuthenticated} isLoading={isLoading} />
          <Button 
            size="sm" 
            className="hidden md:flex ml-4 bg-orange-500 hover:bg-orange-600 text-white"
          >
            Book a Demo
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Navbar;