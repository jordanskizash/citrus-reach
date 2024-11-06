"use client"

import { useState } from 'react'
import Link from 'next/link'
import { useConvexAuth } from "convex/react"
import { SignInButton, UserButton } from "@clerk/clerk-react"
import { Menu, ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Logo } from "./logo"
import { Spinner } from "@/components/spinner"
import { useScrollTop } from "@/hooks/use-scroll-top"

// ... (keeping NavItemsProps interface and NavItems component the same)
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


const ExamplesDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);

  const items = [
    {
      section: "YOUR FORMAT",
      items: [
        { icon: "🎯", title: "In-Person Events", description: "Create engaging face-to-face experiences" },
        { icon: "💻", title: "Virtual Events", description: "Host immersive online gatherings" },
        { icon: "🔄", title: "Hybrid Events", description: "Blend physical and digital experiences" }
      ]
    },
    {
      section: "YOUR BUSINESS",
      items: [
        { icon: "🏢", title: "Enterprise", description: "Solutions for large organizations" },
        { icon: "💻", title: "Technology", description: "Digital-first event experiences" },
        { icon: "🛍️", title: "Retail", description: "Engage customers and drive sales" }
      ]
    },
    {
      section: "YOUR EVENTS",
      items: [
        { icon: "🎤", title: "Conferences", description: "Large-scale professional gatherings" },
        { icon: "📺", title: "Webinars", description: "Online educational sessions" },
        { icon: "📣", title: "Field Marketing", description: "Local and regional events" }
      ]
    }
  ];

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
          {/* Semi-transparent overlay */}
          <div 
            className="fixed inset-x-0 top-16 h-screen bg-black/5 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown container */}
          <div 
            className={cn(
              "absolute left-0 right-0 border-b border-black bg-white origin-top z-50",
              isOpen ? "animate-dropdown-open" : "animate-dropdown-close"
            )}
            style={{
              top: 'calc(100% + 1px)',
              marginTop: '2px',
              width: '120vw',
              marginLeft: '50%',
              transform: 'translateX(-50%)',
            }}
          >
            {/* Content wrapper for max-width constraint */}
            <div className="w-full px-4 md:px-6 py-6">
              <div className="max-w-[1400px] mx-auto">
                <div className="grid grid-cols-3 gap-8">
                  {items.map((section) => (
                    <div key={section.section}>
                      <h3 className="text-sm font-semibold text-gray-400 mb-4">{section.section}</h3>
                      <div className="space-y-4">
                        {section.items.map((item) => (
                          <Link 
                            href="#" 
                            key={item.title}
                            className="group flex items-start p-3 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <span className="text-2xl mr-3">{item.icon}</span>
                            <div>
                              <h4 className="text-sm font-medium text-gray-900 group-hover:text-orange-500 transition-colors">
                                {item.title}
                              </h4>
                              <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
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