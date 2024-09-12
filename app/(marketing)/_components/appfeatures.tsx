import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const CardFeatures = () => {
  const features = [
    {
      title: "Blog Studio",
      description: "Use our platform to create content-rich blogs to instantly publish to your site. Our powerful rich text editor will support any style of communication including code, images and video."
    },
    {
      title: "Video-Powered Outreach",
      description: "Record high quality video or screen recordings right on our site. Instantly embed in emails to prospects."
    },
    {
      title: "Event Registration",
      description: "Instantly create a registration page for in-person or virtual events. Stream on-demand presentations recorded ahead of time or host on your prefered video conferencing platform."
    },
    {
      title: "Bespoke Analytics",
      description: "Use  your blogs, sales, or event sites to gather intent signals and contact information from prospects. Gather important metrics as clients engage with your content"
    }
  ]

  return (
    <div className="min-h-screen w-full bg-cover bg-center py-16" style={{ backgroundImage: "url('./bgfeated.svg')" }}>
      <div className="container mx-auto px-4">
        <div className="mb-20 text-left">
          <h2 className="text-4xl font-bold mb-4 text-black">Application Features</h2>
          <p className="text-xl text-black/80">
            Discover the powerful features that make our application stand out.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="h-80 bg-white/90 backdrop-blur-sm border-l-8 border-b-8 dark:bg-[#1F1F1F]  border-black"
            >
              <CardHeader>
                <CardTitle className="text-2xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}