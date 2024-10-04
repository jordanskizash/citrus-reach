import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Component() {
  return (
    <div className="bg-orange-50 p-8 rounded-lg max-w-4xl mx-auto border-b-8 border-l-8 border-t-2 border-r-2 border-black my-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="flex flex-col justify-between">
          <div>
            <h2 className="text-4xl font-bold mb-4">Subscribe to our newsletter</h2>
            <p className="text-gray-400 mb-4">Stay on the cutting edge of outreach</p>
          </div>
        </div>
        <div className="flex flex-col justify-between">
          <div className="space-y-4">
            <Input
              type="email"
              placeholder="Your e-mail address*"
              className="placeholder:text-gray-500 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 w-full"
            />
            <Button className="bg-orange-500 text-white font-medium rounded-md px-4 py-2 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 w-full">
              Submit
            </Button>
          </div>
          <div className="mt-4">
            <Link href="#" className="text-gray-400 hover:underline" prefetch={false}>
              Privacy policy
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}