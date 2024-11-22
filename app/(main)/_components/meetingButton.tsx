import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar } from 'lucide-react';
import InlineWidget from "@calcom/embed-react";

interface ThemeSettings {
  accentColor?: string;
}

interface SmartMeetingButtonProps {
  calComUsername?: string;
  meetingLink?: string;
  themeSettings?: ThemeSettings;
  className?: string;
}

const SmartMeetingButton: React.FC<SmartMeetingButtonProps> = ({ 
  calComUsername, 
  meetingLink,
  themeSettings,
  className = "h-10 rounded-full text-sm"
}) => {
  const [isCalDialogOpen, setIsCalDialogOpen] = React.useState(false);

  // If there's no calComUsername and no meetingLink, disable the button
  if (!calComUsername && !meetingLink) {
    return null;
  }

  // If there's only a meetingLink (no calComUsername), render a simple button that redirects
  if (!calComUsername && meetingLink) {
    return (
      <Button 
        className={className}
        style={{
          backgroundColor: themeSettings?.accentColor || '#000000',
          color: '#FFFFFF'
        }}
        asChild
      >
        <a
          href={meetingLink}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Calendar className="mr-2 h-4 w-4" /> Book a Meeting
        </a>
      </Button>
    );
  }

  // We know calComUsername is defined here because of the previous conditions
  // This satisfies TypeScript's requirement for a non-optional string
  return (
    <Dialog open={isCalDialogOpen} onOpenChange={setIsCalDialogOpen}>
      <DialogTrigger asChild>
        <Button 
          className={className}
          style={{
            backgroundColor: themeSettings?.accentColor || '#000000',
            color: '#FFFFFF'
          }}
        >
          <Calendar className="mr-2 h-4 w-4" /> Book a Meeting
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Book a Meeting</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          {calComUsername && (
            <InlineWidget
              calLink={calComUsername}
              style={{ height: "650px", width: "100%", overflow: "scroll" }}
              config={{ theme: "light", layout: "month_view" }}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SmartMeetingButton;