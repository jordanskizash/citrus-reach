"use client"
import Image from "next/image";

import { useState } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

export const Hero = () => {
  return (
    <div className="mt-10 relative max-w-5xl mx-auto">
      <img
        src="./tempShot.png"
        className="rounded-xl"
        alt="Image Description"
      />
        <div className="absolute bottom-12 -start-20 -z-[1] w-48 h-48 bg-gradient-to-b from-primary-foreground via-primary-foreground to-background p-px rounded-lg">
          <div className="w-48 h-48 rounded-lg bg-background/10" />
        </div>
        <div className="absolute -top-12 -end-20 -z-[1] w-48 h-48 bg-gradient-to-t from-primary-foreground via-primary-foreground to-background p-px rounded-full">
          <div className="w-48 h-48 rounded-full bg-background/10" />
        </div>
      </div>
  );
};