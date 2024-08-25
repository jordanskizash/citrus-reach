"use client";

import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button"
import Link from "next/link";
import { Poly } from '@next/font/google';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ArrowRight, Calendar, NotepadText, Video } from "lucide-react";
import { Badge } from "@/components/ui/badge";



const roboto = Poly({
    subsets: ['latin'],
    weight: ['400']
  })

export const Suite = () => {
    return (
      <div className={roboto.className}>
        <div className="max-w-3xl space-y-4 mb-8">
            <h3 className="text-xl sm:text-lg md:text-xl font-serif text-orange-500 mb-4">
              POWERFUL FEATURES
            </h3>
            <h2 className="text-base sm:text-xl md:text-5xl font-serif mb-4">
              Record, Edit, Share
            </h2>
            <h2 className="text-base sm:text-xl md:text-xl font-serif mb-4">
              Features built to enhance your prospecting efforts
            </h2>
        </div>
        <div className="justify-center items-center space-x-4 container grid gap-6 px-4 md:grid-cols-2 lg:grid-cols-3 md:px-6 lg:gap-8 ">
        <Card className="w-50 h-120 hover:shadow-xl ease-in-out duration-300">
          <CardHeader>
            <NotepadText className="mb-8" />
            <CardTitle className="mb-2">Editor</CardTitle>
            <CardDescription style={{ maxWidth: '200px' }}>Powerful built-in text editor to give you all the functionality of written email and much more.</CardDescription>
            </CardHeader>
            <CardContent>
              <Badge className="mb-5 mr-3" style={{ maxWidth: '80px'}} variant="outline">Cusotm Editor</Badge>
            </CardContent>
            <CardFooter>
              <Button variant="link">Learn More <ArrowRight size="14" /></Button>
            </CardFooter>
          </Card>

          <Card className="w-50 h-120 hover:shadow-xl ease-in-out duration-300">
          <CardHeader>
            <Video className="mb-8"/>
            <CardTitle className="mb-5">Video Creation</CardTitle>
            <CardDescription style={{ maxWidth: '200px' }}>Create videos personalized to your clients and embed them in your site. Speak directly to prospects.</CardDescription>
            </CardHeader>
            <CardContent>
              <Badge className="mb-5" style={{ maxWidth: '100px'}} variant="outline">Personalized</Badge>
            </CardContent>
            <CardFooter>
              <Button variant="link">Learn More <ArrowRight size="14" /></Button>
            </CardFooter>
          </Card>

          <Card className="w-50 h-120 hover:shadow-xl ease-in-out duration-300">
          <CardHeader>
            <Calendar className="mb-8"/>
            <CardTitle className="mb-2">Calendar</CardTitle>
            <CardDescription style={{ maxWidth: '200px'}}>Connect your micro-site directly to your calendly for prospects to book meetings instantly</CardDescription>
            </CardHeader>
            <CardContent>
              <Badge className="mb-5" style={{ maxWidth: '100px'}} variant="outline">Flexible Meetings</Badge>
            </CardContent>
            <CardFooter>
              <Button variant="link">Learn More <ArrowRight size="14" /></Button>
            </CardFooter>
          </Card>
          

        </div>
      </div>
    );
  };