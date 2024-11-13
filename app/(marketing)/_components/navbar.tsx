"use client"

import { useState } from 'react'
import Link from 'next/link'
import Image from "next/image"
import { useConvexAuth } from "convex/react"
import { SignInButton, UserButton } from "@clerk/clerk-react"
import { Menu, ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Logo } from "./logo"
import { Spinner } from "@/components/spinner"
import { useScrollTop } from "@/hooks/use-scroll-top"

interface NavItemsProps {
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface ExampleItem {
  title: string
  description: string
  logo: string
  hoverLogo: string
  href: string
}

interface ExampleSection {
  title: string
  items: ExampleItem[]
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

const ExamplesDropdown = () => {
  const [isOpen, setIsOpen] = useState(false)

  const sections: ExampleSection[] = [
    {
      title: "ANY FORMAT",
      items: [
        {
          title: "Blog Pages",
          description: "Create engaging face-to-face experiences",
          logo: "/bloggray.png",
          hoverLogo: "/blogorange.png",
          href: "#"
        },
        {
          title: "Video Sites",
          description: "Host immersive online gatherings",
          logo: "/cameragray.png",
          hoverLogo: "/cameraorange.png",
          href: "#"
        },
        {
          title: "Hybrid Events",
          description: "Blend physical and digital experiences",
          logo: "/calendargray.png",
          hoverLogo: "/calendarorange.png",
          href: "#"
        }
      ]
    },
    {
      title: "INTEGRATIONS",
      items: [
        {
          title: "Cloud Storage",
          description: "Connect with google drive, box, seismic and more ",
          logo: "/cloudgray.png",
          hoverLogo: "/cloudorange.png",
          href: "#"
        },
        {
          title: "CRM",
          description: "Connect to salesforce, hubspot or your custom CRM",
          logo: "/messagegray.png",
          hoverLogo: "/messageorange.png",
          href: "#"
        },
        {
          title: "Your Website",
          description: "Connect any custom domain to your sites.",
          logo: "/browsergray.png",
          hoverLogo: "/browserorange.png",
          href: "#"
        }
      ]
    }
  ]

  const featuredPost = {
    title: "Citrus Pulp: November 2024",
    description: "Check out our latest product updates and improvements",
    image: "/oranges.png",
    href: "/blog/release-log-001-november-2024",
    label: "New Blog Post"
  }

  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsOpen(true)} 
      onMouseLeave={() => setIsOpen(false)}
    >
      <Button 
        variant="ghost" 
        size="sm"
        className={cn(
          "text-gray-700 hover:text-gray-900 gap-2",
          isOpen && "text-orange-500"
        )}
      >
        Examples
        <ChevronDown 
          className={cn(
            "h-4 w-4 transition-transform duration-200",
            isOpen && "transform rotate-180"
          )} 
        />
      </Button>
      
      {isOpen && (
        <>
          <div 
            className="fixed inset-x-0 top-16 h-screen bg-black/5 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          <div 
            className={cn(
              "absolute inset-x-0 top-full border-b border-black bg-white origin-top z-50 transition-all duration-500 ease-out",
              isOpen ? "animate-dropdown-open" : "animate-dropdown-close"
            )}
            style={{
              width: '120vw',
              marginLeft: '50%',
              transform: 'translateX(-50%)',
            }}
          >
            <div className="w-full px-4 md:px-6 py-6">
              <div className="max-w-[1400px] mx-auto">
                <div className="grid grid-cols-12 gap-8">
                  <div className="col-span-4 -ml-4">
                    <div className="space-y-6">
                      <h3 className="font-semibold text-sm text-muted-foreground">{sections[0].title}</h3>
                      <div className="grid gap-4">
                        {sections[0].items.map((item) => (
                          <Link
                            key={item.title}
                            href={item.href}
                            className="group grid grid-cols-[auto,1fr] gap-4 p-3 rounded-lg hover:bg-muted"
                          >
                            <div className="relative size-10">
                              <Image
                                src={item.logo}
                                alt=""
                                className="size-full object-contain group-hover:opacity-0 transition-opacity"
                                width={40}
                                height={40}
                              />
                              <Image
                                src={item.hoverLogo}
                                alt=""
                                className="absolute inset-0 size-full object-contain opacity-0 group-hover:opacity-100 transition-opacity"
                                width={40}
                                height={40}
                              />
                            </div>
                            <div>
                              <h4 className="font-medium text-base">{item.title}</h4>
                              <p className="text-sm text-muted-foreground">{item.description}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-span-4 -ml-4">
                    <div className="space-y-6">
                      <h3 className="font-semibold text-sm text-muted-foreground">{sections[1].title}</h3>
                      <div className="grid gap-4">
                        {sections[1].items.map((item) => (
                          <Link
                            key={item.title}
                            href={item.href}
                            className="group grid grid-cols-[auto,1fr] gap-4 p-3 rounded-lg hover:bg-muted"
                          >
                            <div className="relative size-10">
                              <Image
                                src={item.logo}
                                alt=""
                                className="size-full object-contain group-hover:opacity-0 transition-opacity"
                                width={40}
                                height={40}
                              />
                              <Image
                                src={item.hoverLogo}
                                alt=""
                                className="absolute inset-0 size-full object-contain opacity-0 group-hover:opacity-100 transition-opacity"
                                width={40}
                                height={40}
                              />
                            </div>
                            <div>
                              <h4 className="font-medium text-base">{item.title}</h4>
                              <p className="text-sm text-muted-foreground">{item.description}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="col-span-3 border-l pl-6 -ml-6">
                    <div className="space-y-4">
                      <div className="text-sm font-medium text-primary rounded-full w-fit px-3 py-1 bg-primary/10">
                        {featuredPost.label}
                      </div>
                      <Link href={featuredPost.href} className="group block space-y-4">
                        <div className="aspect-[4/3] overflow-hidden rounded-lg w-[280px]">
                          <Image
                            src={featuredPost.image}
                            alt=""
                            width={280}
                            height={210}
                            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                            {featuredPost.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">{featuredPost.description}</p>
                        </div>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}


const MainNav = () => (
  <nav className="hidden md:flex items-center space-x-8">
    <div className="flex items-center space-x-2">
      <Button 
        variant="ghost" 
        size="sm"
        className="text-gray-700 hover:text-gray-900"
        asChild
      >
        <Link href="/about">About</Link>
      </Button>
      <Button 
        variant="ghost" 
        size="sm"
        className="text-gray-700 hover:text-gray-900"
        asChild
      >
        <Link href="/blog">Blog</Link>
      </Button>
      <Button 
        variant="ghost" 
        size="sm"
        className="text-gray-700 hover:text-gray-900"
        asChild
      >
        <Link href="/pricing">Pricing</Link>
      </Button>
      <ExamplesDropdown />
    </div>
  </nav>
)

export const Navbar = () => {
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