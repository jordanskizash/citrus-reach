import React, { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Paintbrush, Upload, Moon, Sun } from 'lucide-react';
import { Id } from '@/convex/_generated/dataModel';

// Define the Profile type based on your schema
interface Profile {
  _id: Id<"profiles">;
  _creationTime: number;
  displayName: string;
  bio?: string;
  description?: string;
  videoUrl?: string;
  userId: string;
  isArchived: boolean;
  parentProfile?: Id<"profiles">;
  content?: string;
  coverImage?: string;
  icon?: string;
  isPublished: boolean;
  colorPreference?: string;
}

interface FormattingSidebarProps {
  profile: Profile;
  profileId: Id<"profiles">;
  onColorChange: (color: string) => void;
  initialColor?: string;
  initialDarkMode?: boolean;
}

const FormattingSidebar: React.FC<FormattingSidebarProps> = ({ 
  profile,
  profileId,
  onColorChange,
  initialColor = '#FFFFFF',
  initialDarkMode = false,
}) => {
  const updateProfile = useMutation(api.profiles.update);
  const [isOpen, setIsOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(initialDarkMode);
  const [customTitle, setCustomTitle] = useState(profile?.displayName || 'Hey, check out this recording!');
  
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Implement your file upload logic here
      // After successful upload, update the profile with the logo URL
      const logoUrl = 'YOUR_UPLOADED_LOGO_URL';
      await updateProfile({
        id: profileId,
        coverImage: logoUrl, // Using coverImage instead of organizationLogo
      });
    }
  };

  const handleDarkModeToggle = async (checked: boolean) => {
    setIsDarkMode(checked);
    // Store dark mode preference in localStorage or another state management solution
    localStorage.setItem('darkMode', checked.toString());
    // Note: We're not storing this in the database since it's not in our schema
  };

  const handleTitleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setCustomTitle(newTitle);
    await updateProfile({
      id: profileId,
      displayName: newTitle, // Using displayName instead of customTitle
    });
  };

  return (
    <div className={`fixed right-0 top-0 h-full w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4">Format Page</h2>
        
        {/* Background Color */}
        <div className="mb-6">
          <Label className="block mb-2">Background Color</Label>
          <div className="flex items-center gap-2">
            <div 
              className="w-8 h-8 rounded border"
              style={{ backgroundColor: initialColor }}
            />
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => document.getElementById('colorPicker')?.click()}
            >
              <Paintbrush className="h-4 w-4 mr-2" />
              Change Color
            </Button>
            <input
              type="color"
              id="colorPicker"
              className="hidden"
              value={initialColor}
              onChange={(e) => onColorChange(e.target.value)}
            />
          </div>
        </div>

        {/* Dark Mode Toggle */}
        <div className="mb-6">
          <Label className="block mb-2">Dark Mode</Label>
          <div className="flex items-center gap-2">
            <Switch
              checked={isDarkMode}
              onCheckedChange={handleDarkModeToggle}
            />
            {isDarkMode ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
          </div>
        </div>

        {/* Organization Logo */}
        <div className="mb-6">
          <Label className="block mb-2">Organization Logo</Label>
          <div className="flex flex-col gap-2">
            {profile.coverImage && (
              <img 
                src={profile.coverImage} 
                alt="Organization Logo" 
                className="w-20 h-20 object-contain"
              />
            )}
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => document.getElementById('logoUpload')?.click()}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Logo
            </Button>
            <input
              type="file"
              id="logoUpload"
              className="hidden"
              accept="image/*"
              onChange={handleLogoUpload}
            />
          </div>
        </div>

        {/* Custom Title */}
        <div className="mb-6">
          <Label className="block mb-2">Custom Title</Label>
          <Input
            value={customTitle}
            onChange={handleTitleChange}
            placeholder="Enter custom title"
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};

export default FormattingSidebar;