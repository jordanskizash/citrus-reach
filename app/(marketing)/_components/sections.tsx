'use client'

import { useState, useEffect } from 'react';

export const Sections = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  // Initialize isMobile with a default value that makes sense for your initial render
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 640 : true);

  useEffect(() => {
    // Ensure window is defined before using it
    const handleResize = () => {
      if (typeof window !== 'undefined') {
        setIsMobile(window.innerWidth < 640);
      }
    };

    window.addEventListener('resize', handleResize);

    // Call handleResize initially to set the correct state from the start
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const sections = [
    {
      title: "Blog Content",
      content: "Create compelling blog posts to engage your prospects and establish thought leadership, driving interest and credibility in your outreach efforts."
    },
    {
      title: "Personalized Video",
      content: "Record and share personalized video messages that speak directly to your prospects, enhancing your connection and boosting engagement in your sales process."
    },
    {
      title: "Event Registration",
      content: "Host webinars, virtual events, or product demos to showcase your offerings and attract qualified leads, driving targeted interactions with potential clients."
    },
    {
      title: "Promotional",
      content: "Highlight your latest promotions or special offers with tailored landing pages that captivate your prospects and encourage conversions."
    }
  ];

  return (
    <div className="bg-orange-50 w-full py-6">
      <div className="max-w-2xl mx-auto px-6 text-center">
        <h1 className={`text-${isMobile ? '3xl' : '4xl'} font-bold mb-10`}>
          Build custom sites that move key metrics for your team & clients
        </h1>
        <p className={`text-${isMobile ? 'lg' : 'xl'} text-gray-600 mb-8`}>
          Sites for any revenue generating purpose
        </p>
        <div className="mb-6">
          <div className={`flex ${isMobile ? 'flex-col space-y-4' : 'space-x-6 justify-center'} border-b`}>
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

      <div className="bg-orange-50 p-4 rounded-lg min-h-[250px] flex flex-col justify-center">
        <h2 className="text-2xl font-semibold mb-4">{sections[selectedIndex].title}</h2>
        <p className="text-base">{sections[selectedIndex].content}</p>
      </div>
    </div>
  );
}
