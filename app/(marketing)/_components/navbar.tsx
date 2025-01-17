"use client"

import { useState } from 'react'
import Link from 'next/link'
import Image from "next/image"
import { useConvexAuth } from "convex/react"
import { SignInButton, UserButton } from "@clerk/clerk-react"
import { Menu, X, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Logo } from "./logo"
import { Spinner } from "@/components/spinner"
import { useScrollTop } from "@/hooks/use-scroll-top"
import { Zilla_Slab } from 'next/font/google'
import { LogoOnly } from './logojust'

const zilla = Zilla_Slab({
  subsets: ['latin'],
  weight: ['400']
})

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

interface FullscreenMenuProps {
  isOpen: boolean;
  onClose: () => void;
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
            className="hidden md:flex text-gray-700 hover:text-gray-900 text-sm"
          >
            Sign In
          </Button>
        </SignInButton>
        <SignInButton>
          <Button 
            size="sm"
            className="bg-orange-50 hover:bg-orange-100 text-orange-500 text-xs px-3 py-1"
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
          className="text-gray-700 hover:text-gray-900 text-xs"
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
          title: "Blogs",
          description: "Stunning blogs for your personal brand or business",
          logo: "/bloggray.png",
          hoverLogo: "/blogorange.png",
          href: "https://citrusreach.com/homepage/citrus-team"
        },
        {
          title: "Video Sites",
          description: "Personalized Video Websites for Your Prospects",
          logo: "/cameragray.png",
          hoverLogo: "/cameraorange.png",
          href: "#"
        },
        {
          title: "Hybrid Events",
          description: "Sleek and scalable event pages",
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
          "text-gray-700 hover:text-gray-900 gap-2 !text-lg",
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
            <div className="w-full px-4 md:px-6 py-8">
              <div className="max-w-[1400px] mx-auto">
                <div className="grid grid-cols-12 gap-8">
                  {sections.map((section, index) => (
                    <div key={section.title} className="col-span-4 -ml-4">
                      <div className="space-y-6">
                        <h3 className="font-semibold text-sm text-muted-foreground">{section.title}</h3>
                        <div className="grid gap-4">
                          {section.items.map((item) => (
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
                  ))}

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

const FullscreenMenu: React.FC<FullscreenMenuProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div 
      className={cn(
        "fixed inset-0 bg-white z-50 flex flex-col opacity-0 transition-opacity duration-300",
        isOpen && "opacity-100"
      )}
    >
      {/* Close button container - right aligned */}
      <div className="flex justify-end px-6 pt-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClose} 
          className="hover:bg-transparent"
        >
          <X className="h-8 w-8" />
          <span className="sr-only">Close menu</span>
        </Button>
      </div>
      
      {/* Navigation menu - right aligned */}
      <nav className={cn(
        "flex flex-col mt-20 pr-8",  // Changed pl-8 to pr-8
        zilla.className
      )}>
        <Link 
          href="/about" 
          className="text-6xl py-6 hover:text-orange-500 transition-colors transform translate-y-4 opacity-0 animate-slide-up text-right"  // Added text-right
          onClick={onClose}
        >
          About
        </Link>
        <Link 
          href="/blog" 
          className="text-6xl py-6 hover:text-orange-500 transition-colors transform translate-y-4 opacity-0 animate-slide-up text-right"  // Added text-right
          style={{ animationDelay: '0.1s' }}
          onClick={onClose}
        >
          Blog
        </Link>
        <Link 
          href="/pricing" 
          className="text-6xl py-6 hover:text-orange-500 transition-colors transform translate-y-4 opacity-0 animate-slide-up text-right"  // Added text-right
          style={{ animationDelay: '0.2s' }}
          onClick={onClose}
        >
          Pricing
        </Link>
        <Link 
          href="/examples" 
          className="text-6xl py-6 hover:text-orange-500 transition-colors transform translate-y-4 opacity-0 animate-slide-up text-right"  // Added text-right
          style={{ animationDelay: '0.3s' }}
          onClick={onClose}
        >
          Examples
        </Link>
      </nav>
    </div>
  );
};


const MainNav: React.FC = () => (
  <nav className="hidden md:flex items-center space-x-6">
    {/* Removed the nested div to simplify structure and improve centering */}
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
  </nav>
);

export const Navbar: React.FC = () => {
  const { isAuthenticated, isLoading } = useConvexAuth()
  const scrolled = useScrollTop()
  const [isOpen, setIsOpen] = useState(false)

    return (
      <>
        <div className={cn(
          "z-50 fixed top-0 w-full bg-white border-b border-black",
          scrolled && "shadow-sm"
        )}>
          <div className="flex h-16 items-center justify-between px-4 md:px-6">
            {/* Logo section - with fixed width */}
            <div className="w-[200px] flex items-center">
              <div className="md:hidden">
                <LogoOnly />
              </div>
              <div className="hidden md:block">
                <LogoOnly />
              </div>
            </div>

            {/* Center nav section - smaller text */}
            <div className="flex-1 flex justify-center">
              <nav className="hidden md:flex items-center space-x-2 !text-lg">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-gray-700 hover:text-gray-900 !text-lg"
                  asChild
                >
                  <Link href="/about">About</Link>
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-gray-700 hover:text-gray-900 !text-lg"
                  asChild
                >
                  <Link href="/blog">Blog</Link>
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-gray-700 hover:text-gray-900 !text-lg"
                  asChild
                >
                  <Link href="/pricing">Pricing</Link>
                </Button>
                <ExamplesDropdown />
              </nav>
            </div>

            {/* Actions section - with fixed width to match logo section */}
            <div className="w-[200px] flex items-center justify-end gap-2">
              <NavItems isAuthenticated={isAuthenticated} isLoading={isLoading} />
              <Button 
                size="sm"
                className="hidden md:flex bg-orange-500 hover:bg-orange-600 text-white text-xs px-3 py-1"
              >
                Book a Demo
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden"
                onClick={() => setIsOpen(true)}
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </div>
          </div>
        </div>
        
        <FullscreenMenu isOpen={isOpen} onClose={() => setIsOpen(false)} />
      </>
  )
}

export default Navbar;