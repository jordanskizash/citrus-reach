import { FacebookIcon, TwitterIcon, InstagramIcon } from "lucide-react"
import Link from "next/link"
import { Logo } from "./logo"
import { Button } from "@/components/ui/button"

export const Footer = () => {
  return (
    <footer className="mt-20">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <Link href="/" className="flex items-center">
            <Logo />
          </Link>
          <p className="text-sm text-gray-500 hidden sm:block">Increase your reach with Citrus</p>
        </div>
        <div className="border-b border-gray-200 mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              <li><Link href="#" className="hover:text-gray-900">Features</Link></li>
              <li><Link href="#" className="hover:text-gray-900">Pricing</Link></li>
              <li><Link href="#" className="hover:text-gray-900">Documentation</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li><Link href="/about" className="hover:text-gray-900">About Us</Link></li>
              <li><Link href="/blog" className="hover:text-gray-900">Blog</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <p className="mb-2">
              840 Randolph<br />
              Chicago, IL 60610<br />
            </p>
            <p className="mb-2">info@citrusreach.com</p>
            <div className="flex space-x-4">
              <Link href="#" className="hover:text-gray-900">
                <FacebookIcon className="w-6 h-6" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link href="#" className="hover:text-gray-900">
                <TwitterIcon className="w-6 h-6" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link href="#" className="hover:text-gray-900">
                <InstagramIcon className="w-6 h-6" />
                <span className="sr-only">Instagram</span>
              </Link>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-200 pt-8 mt-8 mb-10">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="text-sm mb-4 sm:mb-0">
              © {new Date().getFullYear()} Citrus Reach. All rights reserved.
            </div>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Button variant="ghost" asChild>
                <Link href="/privacy-policy">Privacy Policy</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/terms">Terms of Service</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}