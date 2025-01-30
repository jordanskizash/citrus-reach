import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Doc } from '@/convex/_generated/dataModel';

// Define the external link type
type ExternalLink = {
  _id: string;
  title: string;
  coverImage?: string;
  _creationTime: number;
  isExternalLink: true;
  url: string;
}

// Combined type for both documents and external links
type CombinedContent = Doc<"documents"> | ExternalLink;

interface ContentSelectionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  documents: CombinedContent[];
  selectedSites: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  onDocumentsChange: (newDocuments: CombinedContent[]) => void;
}

const ContentSelectionDialog = ({
  isOpen,
  onOpenChange,
  documents,
  selectedSites,
  onSelectionChange,
  onDocumentsChange,
}: ContentSelectionDialogProps) => {
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);

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
      
      // Create a new external link
      const newDocument: ExternalLink = {
        _id: `external-${Date.now()}`,
        title: metadata.title || 'Untitled',
        coverImage: metadata.image,
        _creationTime: Date.now(),
        isExternalLink: true,
        url: linkUrl,
      };

      // Add the new document to the documents array
      const updatedDocuments = [...documents, newDocument];
      onDocumentsChange(updatedDocuments);

      // Automatically select the new document
      if (selectedSites.length < 6) {
        onSelectionChange([...selectedSites, newDocument._id]);
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

  const handleSiteSelection = (docId: string) => {
    const newSelection = selectedSites.includes(docId)
      ? selectedSites.filter(id => id !== docId)
      : selectedSites.length < 6
      ? [...selectedSites, docId]
      : selectedSites;
    
    onSelectionChange(newSelection);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Featured Content</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mt-4">
          {/* Add Content Button - First */}
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

          {/* Content Cards */}
          {documents.map((doc) => {
            const isExternal = 'isExternalLink' in doc && doc.isExternalLink;
            
            return (
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
                  {isExternal && (
                    <div className="text-xs text-blue-500 mt-1">External Link</div>
                  )}
                </div>
                {selectedSites.includes(doc._id) && (
                  <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    {selectedSites.indexOf(doc._id) + 1}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        <div className="mt-6 flex justify-end gap-2">
          <Button onClick={() => onOpenChange(false)}>Save Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ContentSelectionDialog;