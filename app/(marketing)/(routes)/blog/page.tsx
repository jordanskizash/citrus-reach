'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Doc } from '@/convex/_generated/dataModel'
import { useState, useEffect } from 'react'
import Head from 'next/head'
import { Spinner } from '@/components/spinner'

const MotionLink = motion(Link)

const BLOG_AUTHOR_ID = 'user_2mrbDezxzWCnqMT5dQrLod4s1AS'
const AUTHOR_NAME = 'Citrus Reach'

export default function BlogPage() {
  const documents = useQuery(api.documents.getPublishedDocumentsByUserId, { 
    userId: BLOG_AUTHOR_ID 
  })
  const [pinnedPost, setPinnedPost] = useState<Doc<'documents'> | null>(null)
  const [otherPosts, setOtherPosts] = useState<Doc<'documents'>[]>([])

  useEffect(() => {
    if (documents) {
      if (documents.length > 0) {
        setPinnedPost(documents[0])
        setOtherPosts(documents.slice(1))
      }
    }
  }, [documents])

  if (!documents) {
    return (
      <div className="flex justify-center items-center w-full h-screen">
        <Spinner />
      </div>
    );
  }

  const getPostUrl = (post: Doc<'documents'>) => {
    return `/blog/${post.slug ?? post._id}`;
  };

  const PostCard = ({ post }: { post: Doc<'documents'> }) => (
    <MotionLink 
      href={getPostUrl(post)}
      className="flex flex-col"
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Image 
        src={post.coverImage || "/placeholder.svg?height=300&width=400"}
        alt={post.title}
        width={400}
        height={300}
        className="rounded-lg object-cover w-full h-[200px] mb-4"
      />
      <p className="text-gray-500 text-sm mb-1">{new Date(post._creationTime).toLocaleDateString()}</p>
      <h3 className="text-xl font-semibold mb-1">{post.title}</h3>
      <p className="text-gray-600">By {post.authorFullName || AUTHOR_NAME}</p>
    </MotionLink>
  );

  return (
    <>
      <Head>
        <title>Blog - Latest Posts</title>
        <meta name="description" content={`Read the latest blog posts from ${AUTHOR_NAME}`} />
        <meta property="og:title" content="Blog - Latest Posts" />
        <meta property="og:description" content={`Read the latest blog posts from ${AUTHOR_NAME}`} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="citrusreach.com/blog" />
        {pinnedPost && <meta property="og:image" content={pinnedPost.coverImage || "/placeholder.svg"} />}
      </Head>
      <div className="max-w-7xl mx-auto px-8 sm:px-16 py-8">
        <h1 className="text-4xl font-bold mb-8">Latest from {AUTHOR_NAME}</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {pinnedPost && <PostCard post={pinnedPost} />}
          {otherPosts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      </div>
    </>
  )
}