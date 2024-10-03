/**
 * v0 by Vercel.
 * @see https://v0.dev/t/YcsDySzBPPj
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function SubscribeWidget() {
  return (
    <div className="bg-[#000] p-8 rounded-lg max-w-md mx-auto">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Subscribe to our newsletter</h2>
        <p className="text-gray-400">Stay up to date with our latest news and updates.</p>
      </div>
      <form className="mt-6 flex gap-2">
        <Input
          type="email"
          placeholder="Enter your email"
          className="flex-1 bg-gray-800 text-white placeholder:text-gray-500 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
        <Button
          type="submit"
          className="bg-orange-500 text-white font-medium rounded-md px-6 py-3 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          Subscribe
        </Button>
      </form>
      <div className="mt-4 text-center">
        <Link href="#" className="text-gray-400 hover:underline" prefetch={false}>
          Privacy Policy
        </Link>
      </div>
    </div>
  )
}