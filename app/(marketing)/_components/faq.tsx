import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
  } from "@/components/ui/accordion";
import { Poly } from "next/font/google";

  const roboto = Poly({
    subsets: ['latin'],
    weight: ['400']
  })

  
  export function FAQ() {
    return (
        <div className="flex flex-col w-full mt-10 mx-auto max-w-4xl"> {/* Ensure the container is centered and has a max width */}
            <h1 className="text-xl font-extrabold text-center">Frequently Asked Questions</h1>
            <div className="w-full mt-4"> {/* This container holds the accordion */}
                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                        <AccordionTrigger>Can I add a custom domain to my sites?</AccordionTrigger>
                        <AccordionContent>
                            Yes. Clients can link their own domains or use subdomains on our site. An example would be acme.citrusreach.com.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                        <AccordionTrigger>I&apos;m at my limit, how can I create more microsites?</AccordionTrigger>
                        <AccordionContent>
                            In order to get more microsites, you&apos;ll need to upgrade to our pro plan. See <b>pricing</b> for more details.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3">
                        <AccordionTrigger>Can I sync with my CRM?</AccordionTrigger>
                        <AccordionContent>
                            This feature is coming soon, and currently in beta.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>
        </div>
    )
  }    