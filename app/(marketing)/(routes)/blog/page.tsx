import Image from "next/image"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Sample data for blog posts
const blogPosts = [
  {
    title: "The Future of AI in Web Development",
    description: "Explore how artificial intelligence is reshaping the landscape of web development and what it means for developers.",
    author: {
      name: "Alex Johnson",
      image: "/placeholder.svg?height=40&width=40"
    },
    date: "May 15, 2023",
    image: "/coolplaceholder.jpeg"
  },
  {
    title: "Mastering React Hooks",
    description: "Dive deep into React Hooks and learn how to build more efficient and cleaner React components.",
    author: {
      name: "Samantha Lee",
      image: "/placeholder.svg?height=40&width=40"
    },
    date: "May 10, 2023",
    image: "/coolplaceholder2.jpeg"
  },
  {
    title: "The Rise of JAMstack",
    description: "Discover why JAMstack is becoming increasingly popular and how it's changing web development practices.",
    author: {
      name: "Michael Chen",
      image: "/placeholder.svg?height=40&width=40"
    },
    date: "May 5, 2023",
    image: "/placeholder3.jpeg"
  },
  {
    title: "Accessibility in Modern Web Design",
    description: "Learn best practices for creating accessible websites and why it's crucial for inclusive user experiences.",
    author: {
      name: "Emma Rodriguez",
      image: "/placeholder.svg?height=40&width=40"
    },
    date: "April 30, 2023",
    image: "/placeholder4.jpeg"
  }
]

export default function RecentBlogPosts() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-5xl font-bold mb-20 text-center text-orange-500">The latest news from Citrus</h1>
      <h2 className="text-2xl mb-20 text-center text-muted-foreground">Learn about all the ways we&apos;re increasing response rates</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {blogPosts.map((post, index) => (
          <Card key={index} className="overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
            <CardHeader className="p-0">
              <Image
                src={post.image}
                alt={post.title}
                width={400}
                height={800}
                className="w-full h-80 object-cover"
              />
            </CardHeader>
            <CardContent className="p-4">
              <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
              <p className="text-muted-foreground text-sm mb-4">{post.description}</p>
            </CardContent>
            <CardFooter className="flex items-center justify-between p-4 bg-muted/50">
              <div className="flex items-center space-x-2">
                <Avatar className="w-6 h-6">
                  <AvatarImage src={post.author.image} alt={post.author.name} />
                  <AvatarFallback>{post.author.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <span className="text-xs font-medium">{post.author.name}</span>
              </div>
              <span className="text-xs text-muted-foreground">{post.date}</span>
            </CardFooter>
          </Card>

        ))}
      </div>
    </div>
  )
}