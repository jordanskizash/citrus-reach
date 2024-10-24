import { FacebookIcon, TwitterIcon, InstagramIcon } from "lucide-react";
import Link from "next/link";
import { Logo } from "./logo";
import { Button } from "@/components/ui/button";
import { SignIn, SignInButton } from "@clerk/clerk-react";

export const Footer = () => {
  return (
    <footer className="mt-20 bg-black text-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* Hero Section */}
        <div className="flex flex-col items-center text-center py-32">
          <h1 className="text-6xl font-serif mb-8">Try Citrus Free</h1>
          <a href="https://accounts.citrusreach.com/sign-up">
            <Button variant="enroll" size="lg" className="text-lg px-12 py-6 mt-8 rounded-[30px]">
              Get Started
            </Button>
          </a>
        </div>

        <div className="border-b border-gray-800"></div>

        {/* Main Footer Content */}
        <div className="py-20">
          {/* Logo - Left aligned by default, centered on mobile */}
          <div className="flex md:justify-start justify-center mb-16">
            <Logo mode="dark" />
          </div>
          
          {/* Grid Container */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 md:gap-x-8 gap-y-12">
            {/* Product Section */}
            <div>
              <h3 className="text-xl font-semibold mb-6">Product</h3>
              <ul className="space-y-4 text-gray-400">
                <li><Link href="#" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Documentation</Link></li>
              </ul>
            </div>

            {/* Company Section */}
            <div>
              <h3 className="text-xl font-semibold mb-6">Company</h3>
              <ul className="space-y-4 text-gray-400">
                <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
              </ul>
            </div>

            {/* Contact Section */}
            <div>
              <h3 className="text-xl font-semibold mb-6">Contact</h3>
              <ul className="space-y-4 text-gray-400">
                <li>840 Randolph</li>
                <li>Chicago, IL 60610</li>
                <li>info@citrusreach.com</li>
              </ul>
            </div>

            {/* T&Cs Section */}
            <div>
              <h3 className="text-xl font-semibold mb-6">Legal</h3>
              <ul className="space-y-4 text-gray-400">
                <li><Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>

          {/* Copyright and Social Icons Container */}
          <div className="mt-16 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Copyright */}
            <div className="text-gray-400 text-sm">
              © {new Date().getFullYear()} Citrus Reach. All rights reserved.
            </div>
            
            {/* Social Icons */}
            <div className="flex space-x-4">
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <FacebookIcon className="w-6 h-6" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <TwitterIcon className="w-6 h-6" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <InstagramIcon className="w-6 h-6" />
                <span className="sr-only">Instagram</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};