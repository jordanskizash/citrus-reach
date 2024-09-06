import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Component() {
  return (
    <div className="flex flex-col min-h-[100dvh]">
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
              <div className="space-y-4">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-orange-500">
                  About Citrus Reach
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Citrus Reach was designed to help sales people created more personalized content for their clients. It was born out of the struggle
                  of cold-emailing, to help our users stand out in their communication and ongoing delivery throughout the sales cycle. 
                </p>
                <div className="w-full max-w-sm space-y-2">
                  <form className="flex gap-2 mt-10 mb-4">
                    <Input type="email" placeholder="Enter your email" className="max-w-lg flex-1" />
                    <Button type="submit">Stay Notified</Button>
                  </form>
                  <p className="text-xs text-muted-foreground">
                    Sign up to get notified about product updates.{" "}
                    <Link href="#" className="underline underline-offset-2" prefetch={false}>
                      Terms &amp; Conditions
                    </Link>
                  </p>
                </div>
              </div>
              <div className="grid gap-6">
                <div className="grid gap-2">
                  <h3 className="text-xl font-bold text-orange-500">Outreach that Works</h3>
                  <p className="text-muted-foreground">
                    Utilize custom microsites to deliver personalized content to your clients. Upload video, files, or written messaging that can be 
                    delivered over email, text, or social media.
                  </p>
                </div>
                <div className="grid gap-2">
                  <h3 className="text-xl font-bold text-orange-500">Proven Templates</h3>
                  <p className="text-muted-foreground">
                    Build your own site templates or utilize 100s of prebuilt templates for use cases ranging from cold-email through proposal. 
                  </p>
                </div>
                <div className="grid gap-2">
                  <h3 className="text-xl font-bold text-orange-500">Intelligent Automation</h3>
                  <p className="text-muted-foreground">
                    Send your site via email to prospects, and get more meetings. Citrus sites have gotten 400% more responses than traditional cold email 
                    by standing out in your prospect's inbox.
                  </p>
                </div>
                <div className="grid gap-2">
                  <h3 className="text-xl font-bold text-orange-500">Bespoke Analytics</h3>
                  <p className="text-muted-foreground">
                    See who's viewing your site, and get their contact information and intent signals delivered directly to salesforce.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}