'use client'

import { useState } from 'react'

export const Sections = () => {
  const [selectedIndex, setSelectedIndex] = useState(0)

  const sections = [
    {
      title: "New Leads",
      content: "Explore your latest prospects in this section designed to streamline your lead management process. View and sort new leads with detailed profiles and customizable engagement tools, all within a user-friendly interface. The expanded content area is optimized for clarity and functionality, ensuring you have all the necessary information at your fingertips for effective decision-making."
    },
    {
      title: "Product-Lead Growth",
      content: "Delve into product-led growth tactics that can transform your product into a primary growth driver. This section provides strategic insights, practical case studies, and actionable advice on using your product to attract and retain customers. Enhanced with extra space, it's perfect for deeper exploration of methodologies and interactive learning elements."
    },
    {
      title: "Search Optimized",
      content: "Maximize your content's reach with our search optimization tools featured in this section. Tailor your content to meet SEO standards with tips on keyword integration, meta descriptions, and more. The larger area allows for the inclusion of lists, images, and interactive elements to make your content not only optimized but also engaging."
    },
    {
      title: "CRM Sync",
      content: "Efficiently synchronize and manage your customer relationships with our CRM Sync feature. This section helps you integrate data across platforms, ensuring that your customer information is up-to-date and accessible. With the expanded content space, you can dive deeper into feature functionalities, setup guides, and best practices."
    }
  ]

  return (
    <div className="bg-orange-50 w-full py-12">
        <div className="max-w-4xl mx-auto p-4 text-center">
        <h1 className="text-4xl font-bold mb-4">Main Heading</h1>
        <p className="text-xl text-gray-600 mb-8">This is the main description for your component. You can provide an overview or introduction here.</p>
        
        <div className="mb-8">
            <div className="flex justify-center space-x-6 border-b">
            {sections.map((section, index) => (
                <button
                key={index}
                className={`py-3 px-6 text-xl font-semibold transition-colors duration-200 ${
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

      <div className="bg-orange-50 p-8 rounded-lg min-h-[300px] flex flex-col justify-center">
        <h2 className="text-2xl font-semibold mb-6">{sections[selectedIndex].title}</h2>
        <p className="text-lg">{sections[selectedIndex].content}</p>
      </div>
    </div>
  )
}