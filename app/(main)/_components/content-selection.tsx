import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Doc, Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

type ExternalLink = Doc<"documents"> & {
  isExternalLink: true;
  externalUrl: string;
};

type DocumentOrLink = Doc<"documents"> | ExternalLink;

interface ContentSelectionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  documents: DocumentOrLink[];
  selectedSites: Id<"documents">[];
  onSelectionChange: (selectedIds: Id<"documents">[]) => void;
  onDocumentsChange: (newDocuments: DocumentOrLink[]) => void;
  profileId: Id<"profiles">;
  updateProfile: (args: { id: Id<"profiles">; featuredContent: Id<"documents">[] }) => Promise<any>;
}

const ContentSelectionDialog = ({
  isOpen,
  onOpenChange,
  documents,
  selectedSites,
  onSelectionChange,
  onDocumentsChange,
  profileId,
  updateProfile,
}: ContentSelectionDialogProps) => {
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);
  
  const createExternalLink = useMutation(api.documents.createExternalLink);

  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoadingMetadata(true);

    try {
      const response = await fetch('/api/extract-metadata', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: linkUrl }),
      });

      const metadata = await response.json();
      
      // Create a new external link in the documents table
      const documentId = await createExternalLink({
        title: metadata.title || 'Untitled',
        url: linkUrl,
        coverImage: metadata.image,
      });

      // Create a new external link object
      const newExternalLink: ExternalLink = {
        _id: documentId as Id<"documents">,
        _creationTime: Date.now(),
        title: metadata.title || 'Untitled',
        userId: '', // Will be set by server
        isArchived: false,
        isPublished: true,
        isExternalLink: true,
        externalUrl: linkUrl,
        coverImage: metadata.image,
        content: '',
        likeCount: 0,
      };

      const updatedDocuments = [...documents, newExternalLink];
      onDocumentsChange(updatedDocuments);

      if (selectedSites.length < 6) {
        onSelectionChange([...selectedSites, documentId as Id<"documents">]);
      }

      setLinkUrl('');
      setIsLinkDialogOpen(false);
      toast.success('Link added successfully');
    } catch (error) {
      console.error('Error adding link:', error);
      toast.error('Failed to add link');
    } finally {
      setIsLoadingMetadata(false);
    }
  };

  const handleSiteSelection = (docId: Id<"documents">) => {
    const newSelection = selectedSites.includes(docId)
      ? selectedSites.filter(id => id !== docId)
      : selectedSites.length < 6
      ? [...selectedSites, docId]
      : selectedSites;
    
    onSelectionChange(newSelection);
  };

  const handleSave = async () => {
    try {
      await updateProfile({
        id: profileId,
        featuredContent: selectedSites
      });
      toast.success("Featured content updated successfully");
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating featured content:", error);
      toast.error("Failed to update featured content");
    }
  };

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

          {documents.map((doc) => (
            <div
              key={doc._id}
              className={`relative rounded-lg border cursor-pointer transition-all ${
                selectedSites.includes(doc._id)
                  ? 'border-blue-500 shadow-md'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleSiteSelection(doc._id)}
            >
              <div className="relative h-24">
                <img
                  src={doc.coverImage || "/placeholder.svg?height=80&width=100"}
                  alt={doc.title}
                  className="w-full h-full object-cover rounded-t-lg"
                />
              </div>
              <div className="p-2">
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Calendar className="h-3 w-3" />
                  {new Date(doc._creationTime).toLocaleDateString()}
                </div>
                <h3 className="text-xs font-medium line-clamp-2 mt-1">{doc.title}</h3>
                {'isExternalLink' in doc && doc.isExternalLink && (
                  <div className="text-[10px] text-blue-500 mt-0.5">External Link</div>
                )}
              </div>
              {selectedSites.includes(doc._id) && (
                <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  {selectedSites.indexOf(doc._id) + 1}
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