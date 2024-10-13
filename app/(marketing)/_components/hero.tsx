"use client";

import Image from "next/image";
import { FC } from "react";

// Use case interface for TypeScript typing
interface UseCase {
  title: string;
  description: string;
  createdBy: string;
  icon: string;
  tag: string;
}

const useCases: UseCase[] = [
  {
    title: 'Feature Rich-Blog',
    description: 'Use our editor to showcase your content. Gather intent signals as prospects engage with your content.',
    createdBy: 'Citrus Reach',
    icon: '/docs.png',
    tag: 'Inbound',
  },
  {
    title: 'Video Prospecting Campaign',
    description: 'Create videos for your prospects and host them on a personalized microsite. Easily connect your calendar and receive feedback from clients.',
    createdBy: 'Dr. Harsh Singh',
    icon: '/recordicon.png',
    tag: 'Outbound',
  },
  {
    title: 'Thought Leadership',
    description: 'Showcase your sites or blog posts on any media with automatic metadata and sharing functionality.',
    createdBy: 'Alex Harris',
    icon: '/share.png',
    tag: 'Inbound',
  },
  {
    title: 'Email Integration',
    description: 'Connect to your email and send microsites directly to a list of customers.',
    createdBy: 'Suzy Wong',
    icon: '/email.png',
    tag: 'Outbound',
  },
  {
    title: 'Connect your Domain',
    description: 'Host microsites on your own domain or on ours  at no additional cost!',
    createdBy: 'Suzy Wong',
    icon: '/browser.png',
    tag: 'Inbound',
  },
  {
    title: 'Bespoke Analytics',
    description: 'Collect analytics on each of your sites, so you can improve outreach efforts with data.',
    createdBy: 'Suzy Wong',
    icon: '/analytic.png',
    tag: 'Intent',
  },
];

// Map tags to background and text colors
const tagColors: { [key: string]: string } = {
  'Inbound': 'bg-green-100 text-green-800',
  'Outbound': 'bg-blue-100 text-blue-800',
  'Intent': 'bg-purple-100 text-purple-800',
};

export const Hero: FC = () => {
  return (
    <div className="mt-10 relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
        {useCases.map((useCase, index) => (
          <div key={index} className="bg-white rounded-xl shadow-lg p-6 relative border-2 border-black">
            {/* Icon and Tag aligned */}
            <div className="flex items-start justify-between mb-4">
              {/* Icon */}
              <div className="mr-4 border-2 p-1 rounded-full">
                <Image
                  src={useCase.icon}
                  alt={`${useCase.title} icon`}
                  width={50}
                  height={50}
                  className="rounded-full"
                />
              </div>
              {/* Tag Badge */}
              <div className={`border border-black text-xs px-2 py-1 rounded ${tagColors[useCase.tag]}`}>
                {useCase.tag}
              </div>
            </div>

            {/* Title */}
            <h3 className="text-xl font-semibold mt-4">{useCase.title}</h3>

            {/* Description */}
            <p className="text-gray-600 mb-4 mt-4">{useCase.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
