import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Component() {
  return (
    <div className="bg-[#000] p-8 rounded-lg max-w-2xl mx-auto">
      <div className="flex flex-col items-start">
        <h2 className="text-4xl font-bold text-white mb-4">Subscribe to our newsletter</h2>
        <div className="flex flex-col gap-2">
          <Input
            type="email"
            placeholder="Your e-mail address*"
            className="bg-gray-800 text-white placeholder:text-gray-500 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 w-full"
          />
          <Button className="bg-green-500 text-white font-medium rounded-md px-4 py-2 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 self-start">
            Submit
          </Button>
        </div>
      </div>
      <p className="text-gray-400 mt-4">Stay up-to-date with the world of test data.</p>
      <div className="mt-4 text-center">
        <Link href="#" className="text-gray-400 hover:underline" prefetch={false}>
          Privacy policy
        </Link>
      </div>
    </div>
  );
}
