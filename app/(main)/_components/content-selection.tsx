import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Doc, Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

type FeaturedContent = {
  type: "document" | "external";
  id: Id<"documents"> | Id<"externalLinks">;
};

type ContentItem = {
  type: "document";
  content: Doc<"documents">;
} | {
  type: "external";
  content: Doc<"externalLinks">;
};

interface ContentSelectionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  documents: Doc<"documents">[];
  externalLinks: Doc<"externalLinks">[];
  selectedContent: FeaturedContent[];
  onSelectionChange: (selected: FeaturedContent[]) => void;
  onContentChange: (docs: Doc<"documents">[], links: Doc<"externalLinks">[]) => void;
  profileId: Id<"profiles">;
  updateProfile: (args: { id: Id<"profiles">; featuredContent: FeaturedContent[] }) => Promise<any>;
}

const ContentSelectionDialog = ({
  isOpen,
  onOpenChange,
  documents,
  externalLinks,
  selectedContent,
  onSelectionChange,
  onContentChange,
  profileId,
  updateProfile,
}: ContentSelectionDialogProps) => {
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);
  
  const createExternalLink = useMutation(api.externalLinks.create);

  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoadingMetadata(true);
  
    try {
      console.log('Attempting to fetch metadata for:', linkUrl);
      
      const response = await fetch('/api/extract-metadata', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: linkUrl }),
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Metadata API error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
  
      const metadata = await response.json();
      console.log('Received metadata:', metadata);
      
      // Create a new external link
      const linkId = await createExternalLink({
        title: metadata.title || 'Untitled',
        url: linkUrl,
        coverImage: metadata.image,
      });

      // Add to the list of external links
      const newLink: Doc<"externalLinks"> = {
        _id: linkId,
        _creationTime: Date.now(),
        title: metadata.title || 'Untitled',
        url: linkUrl,
        userId: '', // Will be set by server
        isArchived: false,
        coverImage: metadata.image,
      };
  
      const updatedLinks = [...externalLinks, newLink];
      onContentChange(documents, updatedLinks);
  
      if (selectedContent.length < 6) {
        onSelectionChange([...selectedContent, { type: "external", id: linkId }]);
      }
  
      setLinkUrl('');
      setIsLinkDialogOpen(false);
      toast.success('Link added successfully');
    } catch (error) {
      console.error('Detailed error in handleAddLink:', error);
      toast.error('Failed to add link. Please try again.');
    } finally {
      setIsLoadingMetadata(false);
    }
  };

  const handleContentSelection = (type: "document" | "external", id: Id<"documents"> | Id<"externalLinks">) => {
    const isSelected = selectedContent.some(item => 
      item.type === type && item.id === id
    );
    
    const newSelection = isSelected
      ? selectedContent.filter(item => !(item.type === type && item.id === id))
      : selectedContent.length < 6
      ? [...selectedContent, { type, id }]
      : selectedContent;
    
    onSelectionChange(newSelection);
  };

  const handleSave = async () => {
    try {
      await updateProfile({
        id: profileId,
        featuredContent: selectedContent
      });
      toast.success("Featured content updated successfully");
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating featured content:", error);
      toast.error("Failed to update featured content");
    }
  };

  // Filter published documents and combine with external links
  const publishedDocuments = documents.filter((doc: Doc<"documents">) => doc.isPublished);
  
  const allContent: ContentItem[] = [
    ...publishedDocuments.map((doc: Doc<"documents">) => ({ 
      type: "document" as const, 
      content: doc 
    })),
    ...externalLinks.map((link: Doc<"externalLinks">) => ({ 
      type: "external" as const, 
      content: link 
    }))
  ].sort((a, b) => b.content._creationTime - a.content._creationTime);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Featured Content</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mt-4">
          <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
            <DialogTrigger asChild>
              <div className="flex items-center justify-center h-24 border-2 border-dashed border-gray-200 rounded-lg hover:border-gray-300 transition-colors cursor-pointer">
                <Plus className="h-6 w-6 text-gray-400" />
              </div>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add External Content</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddLink} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Input
                    type="url"
                    placeholder="Paste link here..."
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={isLoadingMetadata}
                  className="w-full"
                >
                  {isLoadingMetadata ? 'Loading...' : 'Add Content'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          {allContent.map(({ type, content }: ContentItem) => (
            <div
              key={`${type}-${content._id}`}
              className={`relative rounded-lg border cursor-pointer transition-all ${
                selectedContent.some(item => item.type === type && item.id === content._id)
                  ? 'border-blue-500 shadow-md'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleContentSelection(type, content._id)}
            >
              <div className="relative h-24">
                <img
                  src={content.coverImage || "/placeholder.svg?height=80&width=100"}
                  alt={content.title}
                  className="w-full h-full object-cover rounded-t-lg"
                />
              </div>
              <div className="p-2">
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Calendar className="h-3 w-3" />
                  {new Date(content._creationTime).toLocaleDateString()}
                </div>
                <h3 className="text-xs font-medium line-clamp-2 mt-1">{content.title}</h3>
                {type === "external" && (
                  <div className="text-[10px] text-blue-500 mt-0.5">External Link</div>
                )}
              </div>
              {selectedContent.some(item => item.type === type && item.id === content._id) && (
                <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  {selectedContent.findIndex(item => item.type === type && item.id === content._id) + 1}
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-6 flex justify-end gap-2">
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ContentSelectionDialog;