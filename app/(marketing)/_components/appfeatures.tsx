import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";

type TagType = 'Inbound' | 'Outbound' | 'Intent' | 'Success';

interface Feature {
  title: string;
  description: string;
  icon: string;
  tag: TagType;
}

export const CardFeatures = () => {
  // Map tags to background and text colors
  const tagColors: { [key in TagType]: string } = {
    Inbound: "bg-orange-100 text-orange-800",
    Outbound: "bg-blue-100 text-blue-800",
    Intent: "bg-purple-100 text-purple-800",
    Success: "bg-green-100 text-green-800"
  };

  const features: Feature[] = [
    {
      title: "Blog Studio",
      description:
        "Get started by using our platform to content-rich blogs and instantly publish to your site. Our powerful rich text editor will support any style of communication including code, images and video.",
      icon: "/docs.png",
      tag: "Inbound",
    },
    {
      title: "Video-Powered Outreach",
      description:
        "Record high-quality video or screen recordings right on our site. Create personalized videos to your prospect, ane embed them on a site that makes it easy for prospects to reply, book meetings, and share.",
      icon: "/recordicon.png",
      tag: "Outbound",
    },
    {
      title: "Share with Your Network",
      description:
        "Showcase your sites or blog posts in emails to prospects, or on any social network with automatic metadata and sharing functionality",
      icon: "/share.png",
      tag: "Outbound",
    },
    {
      title: "Collect Analytics",
      description:
        "Use your blogs, sales, or event sites to gather intent signals and contact information from prospects. Gather important metrics as clients engage with your content.",
      icon: "/analytic.png",
      tag: "Intent",
    },
    // Added 5th feature
    {
      title: "Book Meetings",
      description:
        "Connect your calendar to allow prospects to easily book meetings on your microsite. Gather intent signals to inform your targeted outreach.",
      icon: "/calendar.png",
      tag: "Success",
    },
  ];

  return (
    <div
      className="min-h-screen w-full bg-cover bg-center py-16"
      style={{ backgroundImage: "url('./bgfin.png')" }}
    >
      <div className="container mx-auto px-4">
        <div className="mb-20 text-left">
          <h2 className="text-6xl font-bold mb-4 text-black">
            How Citrus Works
          </h2>
          <p className="text-xl text-black/80">
            Improve your outreach efforts in 5 simple steps
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <Card
              key={index}
              className={`bg-white/90 backdrop-blur-sm border-l-8 border-b-8 dark:bg-[#1F1F1F] border-black relative ${
                index === features.length - 1 ? 'md:col-span-2' : ''
              }`}
            >
              {/* Content Wrapper with Adjusted Padding */}
              <div className="px-4 pt-4 pb-12">
                {/* Icon and Tag */}
                <div className="flex items-start justify-between mb-4">
                  {/* Icon */}
                  <div className="mr-4 border-2 p-1 rounded-full">
                    <Image
                      src={feature.icon}
                      alt={`${feature.title} icon`}
                      width={50}
                      height={50}
                      className="rounded-full"
                    />
                  </div>
                  {/* Tag Badge */}
                  <div
                    className={`border border-black text-xs px-2 py-1 rounded ${
                      tagColors[feature.tag]
                    }`}
                  >
                    {feature.tag}
                  </div>
                </div>

                <CardHeader>
                  <CardTitle className="text-2xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg">{feature.description}</p>
                </CardContent>
              </div>

              {/* Black Circle with Number */}
              <div className="absolute bottom-4 left-4">
                <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
                  <span className="text-white text-md font-semibold">
                    {index + 1}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
