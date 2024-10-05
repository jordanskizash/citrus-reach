// components/ShareButtons.tsx
import React, { useState } from 'react';
import { Twitter, Facebook, Link as LinkIcon, Linkedin, Mail } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';

const ShareButtons = () => {
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);

  const handleShareDialog = () => {
    setIsShareDialogOpen(true);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
    setIsShareDialogOpen(false);
  };

  return (
    <div className="fixed left-8 top-2/4 transform -translate-y-1/2 flex flex-col gap-4 z-50">
      <button onClick={handleShareDialog} aria-label="Open share dialog" className="share-button">
        <LinkIcon size={20} />
      </button>
      <a
        href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(window.location.href)}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on LinkedIn"
        className="share-button"
      >
        <Linkedin size={20} />
      </a>
      <a
        href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on Twitter"
        className="share-button"
      >
        <Twitter size={20} />
      </a>
      <a
        href="https://www.facebook.com/sharer/sharer.php"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on Facebook"
        className="share-button"
      >
        <Facebook size={20} />
      </a>
      <a
        href={`mailto:?subject=Check this out&body=Check out this link: ${encodeURIComponent(window.location.href)}`}
        aria-label="Share via Email"
        className="share-button"
      >
        <Mail size={20} />
      </a>

      {/* Share Dialog */}
      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share this page</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <input value={window.location.href} readOnly className="mb-4 w-full p-2 border rounded" />
            <Button onClick={copyToClipboard} className="w-full">
              Copy Link
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ShareButtons;