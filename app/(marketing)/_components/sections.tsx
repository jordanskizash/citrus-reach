'use client'

import { useState, useEffect } from 'react';

export const Sections = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 640 : true);

  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== 'undefined') {
        setIsMobile(window.innerWidth < 640);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const sections = [
    {
      title: "Blog Content",
      content: "Create compelling blog posts to engage your prospects and establish thought leadership, driving interest and credibility in your outreach efforts.",
      imageUrl: "/blogsec.png"
    },
    {
      title: "Personalized Video",
      content: "Record and share personalized video messages that speak directly to your prospects, enhancing your connection and boosting engagement in your sales process.",
      imageUrl: "/recordpic.png"
    },
    {
      title: "Event Registration",
      content: "Host webinars, virtual events, or product demos to showcase your offerings and attract qualified leads, driving targeted interactions with potential clients.",
      imageUrl: "/eventsOne.png"
    },
    {
      title: "Promotional",
      content: "Highlight your latest promotions or special offers with tailored landing pages that captivate your prospects and encourage conversions.",
      imageUrl: "/images/promotional.png"
    }
  ];

  return (
    <div className="bg-orange-50 w-full py-6">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <h1 className={`text-${isMobile ? '3xl' : '4xl'} font-bold mb-10`}>
          Build custom sites that move key metrics for your team & clients
        </h1>
        <p className={`text-${isMobile ? 'lg' : 'xl'} text-gray-600 mb-8`}>
          Sites for any revenue generating purpose
        </p>
        <div className="mb-6">
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6 justify-center border-b">
          {sections.map((section, index) => (
            <button
              key={index}
              className={`py-3 px-4 text-${isMobile ? 'lg' : 'xl'} font-semibold transition-colors duration-200 ${
                selectedIndex === index 
                ? 'text-orange-600 border-b-2 border-orange-600' 
                : 'text-gray-600 hover:text-orange-600'
              }`}
              onClick={() => setSelectedIndex(index)}
            >
              {section.title}
            </button>
          ))}
        </div>
      </div>

      </div>

      <div className="bg-orange-50 p-4 rounded-lg min-h-[250px] flex flex-col justify-center items-center">
        <p className="text-base mb-8 text-center max-w-2xl">{sections[selectedIndex].content}</p>
        <div className="w-full max-w-4xl px-4">
          <img
            src={sections[selectedIndex].imageUrl}
            alt={sections[selectedIndex].title}
            className="rounded-lg shadow-lg w-full border-black border-l-8 border-b-8 border-t-2 border-r-2"
          />
        </div>
      </div>
    </div>
  );
}