import * as React from 'react'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Doc, Id } from '@/convex/_generated/dataModel'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Upload, ChevronDown, X } from 'lucide-react'
import { PublishProfile } from '@/app/(main)/_components/publishprof'
import { Menu } from '@/app/(main)/_components/menu'
import { ProfTitle } from '@/app/(main)/_components/prof-title'
import { useState } from 'react'
import { useEdgeStore } from '@/lib/edgestore'

interface ThemeSettings {
  backgroundColor: string
  textColor: string
  accentColor: string
}

interface Profile {
  _id: Id<"profiles">
  displayName: string
  coverImage?: string
  colorPreference?: string
  isPublished: boolean
  icon?: string
  greetingText?: string
  themeSettings?: ThemeSettings
  isDarkMode?: boolean
  themeSettings_backgroundColor?: string;
  themeSettings_textColor?: string;
  themeSettings_accentColor?: string;
  bio?: string;
  description?: string;
  videoUrl?: string;
  videoDescription?: string;
  userId: string;
  isArchived: boolean;
  parentProfile?: Id<"profiles">;
  content?: string;
  organizationLogo?: string;
}

interface FormattingModuleProps {
  profile: Profile & Doc<"profiles">
  profileId: Id<"profiles">
  onColorChange: (type: 'background' | 'accent', color: string) => void
}

interface ColorPickerProps {
  type: 'background' | 'accent'
  color: string
  onChange: (color: string) => void
}

const colorOptions = [
  { name: 'Light Red', value: '#FFCCCB' },
  { name: 'Light Orange', value: '#FFE5B4' },
  { name: 'Light Yellow', value: '#FFFACD' },
  { name: 'Light Green', value: '#E0FFE0' },
  { name: 'Light Blue', value: '#E6F3FF' },
  { name: 'Light Purple', value: '#E6E6FA' },
  { name: 'White', value: '#FFFFFF' },
]

const ColorPicker: React.FC<ColorPickerProps> = ({ type, color, onChange }) => (
  <Popover>
    <PopoverTrigger asChild>
      <Button
        variant="outline"
        role="combobox"
        className="w-full justify-between"
      >
        <div className="flex items-center">
          <div
            className="w-4 h-4 rounded mr-2"
            style={{ backgroundColor: color }}
          />
          {color}
        </div>
        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
    </PopoverTrigger>
    <PopoverContent className="w-full p-0">
      <div className="grid grid-cols-3 gap-2 p-2">
        {colorOptions.map((colorOption) => (
          <Button
            key={colorOption.value}
            className="w-full h-8 p-0"
            style={{ backgroundColor: colorOption.value }}
            onClick={() => onChange(colorOption.value)}
          />
        ))}
      </div>
      <div className="p-2 border-t">
        <Label htmlFor={`custom-${type}-color`} className="text-xs">Custom Color</Label>
        <div className="flex items-center mt-1">
          <Input
            id={`custom-${type}-color`}
            type="text"
            value={color}
            onChange={(e) => onChange(e.target.value)}
            placeholder="#RRGGBB"
            className="flex-grow"
          />
          <div
            className="w-6 h-6 rounded ml-2 border"
            style={{ backgroundColor: color }}
          />
        </div>
      </div>
    </PopoverContent>
  </Popover>
)

export default function FormattingModule({
  profile,
  profileId,
  onColorChange,
}: FormattingModuleProps) {
  const updateProfile = useMutation(api.profiles.update)
  const [backgroundColor, setBackgroundColor] = React.useState(profile.colorPreference || '#FFFFFF')
  const [accentColor, setAccentColor] = React.useState(profile.themeSettings?.accentColor || '#000000')
  const [clientLogoUrl, setClientLogoUrl] = React.useState(profile.icon || '')
  const [greetingText, setGreetingText] = useState(profile.greetingText || `Hey, ${profile.displayName} - Check out this recording!`)
  const { edgestore } = useEdgeStore()

  const handleLogoDelete = async (type: 'cover' | 'client') => {
    try {
      if (type === 'cover' && profile.coverImage) {
        await edgestore.publicFiles.delete({
          url: profile.coverImage
        })
        await updateProfile({
          id: profileId,
          coverImage: ''
        })
      } else if (type === 'client' && clientLogoUrl) {
        await edgestore.publicFiles.delete({
          url: clientLogoUrl
        })
        setClientLogoUrl('')
        await updateProfile({
          id: profileId,
          icon: ''
        })
      }
    } catch (error) {
      console.error("Error deleting logo:", error)
    }
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'cover' | 'client' = 'cover') => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        const response = await edgestore.publicFiles.upload({
          file,
        })
        const logoUrl = response.url
        if (type === 'cover') {
          await updateProfile({
            id: profileId,
            coverImage: logoUrl,
          })
        } else {
          setClientLogoUrl(logoUrl)
          await updateProfile({
            id: profileId,
            icon: logoUrl,
          })
        }
      } catch (error) {
        console.error("Error uploading file:", error)
      }
    }
  }

  const handleColorChange = (type: 'background' | 'accent', newColor: string) => {
    if (type === 'background') {
      setBackgroundColor(newColor)
      updateProfile({
        id: profileId,
        colorPreference: newColor,
      })
    } else {
      setAccentColor(newColor)
      
      // Create the new theme settings object
      const newThemeSettings = {
        backgroundColor: profile.themeSettings?.backgroundColor || backgroundColor,
        textColor: newColor,
        accentColor: newColor
      }
  
      // Update the profile with both individual fields and the object
      // updateProfile({
      //   id: profileId,
      //   isArchived: profile.isArchived,
      //   isPublished: profile.isPublished,
      //   themeSettings: newThemeSettings,
      //   themeSettings_backgroundColor: newThemeSettings.backgroundColor,
      //   themeSettings_textColor: newThemeSettings.textColor,
      //   themeSettings_accentColor: newThemeSettings.accentColor
      // })
    }
    onColorChange(type, newColor)
  }


  return (
    <div className="group/sidebar h-full bg-secondary overflow-y-auto relative flex w-60 flex-col z-[99999]">
      <div className="flex items-center justify-between p-4 border-b">
        <PublishProfile initialData={profile} />
        <Menu profileId={profileId} coverImageUrl={profile.coverImage} />
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-4">Customize Your Page</h3>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="display-name">Display Name</Label>
            <div className="mt-1">
              <ProfTitle initialData={profile} />
            </div>
          </div>

          <div>
            <Label htmlFor="greeting-text">Greeting Text</Label>
            <Input
              id="greeting-text"
              value={greetingText}
              onChange={(e) => {
                setGreetingText(e.target.value);
                updateProfile({
                  id: profileId,
                  greetingText: e.target.value,
                });
              }}
              placeholder="Enter your custom greeting"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="background-color">Background Color</Label>
            <ColorPicker
              type="background"
              color={backgroundColor}
              onChange={(color) => handleColorChange('background', color)}
            />
          </div>

          <div>
            <Label htmlFor="accent-color">Accent Color</Label>
            <ColorPicker
              type="accent"
              color={accentColor}
              onChange={(color) => handleColorChange('accent', color)}
            />
          </div>

          {/* Cover Logo Section */}
          <div className="mb-4">
            <Label htmlFor="logo-upload">Logo</Label>
            <div className="flex items-center space-x-2 mt-1">
              {profile.coverImage && (
                <div className="relative">
                  <img
                    src={profile.coverImage}
                    alt="Logo"
                    className="w-8 h-8 object-contain rounded"
                  />
                  <button
                    onClick={() => handleLogoDelete('cover')}
                    className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              )}
              <Button variant="outline" size="sm" onClick={() => document.getElementById('cover-logo-upload')?.click()}>
                <Upload className="w-4 h-4 mr-2" />
                Upload Logo
              </Button>
              <input
                type="file"
                id="cover-logo-upload"
                className="hidden"
                accept="image/*"
                onChange={(e) => handleLogoUpload(e, 'cover')}
              />
            </div>
          </div>

          {/* Client Logo Section */}
          <div className="mb-4">
            <Label htmlFor="client-logo-upload">Client Logo</Label>
            <div className="flex items-center space-x-2 mt-1">
              {clientLogoUrl && (
                <div className="relative">
                  <img
                    src={clientLogoUrl}
                    alt="Client Logo"
                    className="w-8 h-8 object-contain rounded"
                  />
                  <button
                    onClick={() => handleLogoDelete('client')}
                    className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              )}
              <Button variant="outline" size="sm" onClick={() => document.getElementById('client-logo-upload')?.click()}>
                <Upload className="w-4 h-4 mr-2" />
                Upload Client Logo
              </Button>
              <input
                type="file"
                id="client-logo-upload"
                className="hidden"
                accept="image/*"
                onChange={(e) => handleLogoUpload(e, 'client')}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}