'use client'

import * as React from 'react'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Doc, Id } from '@/convex/_generated/dataModel'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Upload, ChevronLeft, ChevronRight, X } from 'lucide-react'
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

const colorOptions = [
  { name: 'Light Red', value: '#FFCCCB' },
  { name: 'Light Orange', value: '#FFE5B4' },
  { name: 'Light Yellow', value: '#FFFACD' },
  { name: 'Light Green', value: '#E0FFE0' },
  { name: 'Light Blue', value: '#E6F3FF' },
  { name: 'Light Purple', value: '#E6E6FA' },
  { name: 'White', value: '#FFFFFF' },
]

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
  const [isOpen, setIsOpen] = useState(true)
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
      const newThemeSettings = {
        backgroundColor: profile.themeSettings?.backgroundColor || backgroundColor,
        textColor: newColor,
        accentColor: newColor
      }
    }
    onColorChange(type, newColor)
  }

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  return (
    <div className="relative h-full">
      <div
        className={`absolute top-1/2 -translate-y-1/2 ${
          isOpen ? '-left-4' : '-left-6'
        } z-10 transition-all duration-300`}
      >
        <Button
          variant="secondary"
          size="icon"
          className="h-12 w-6 rounded-l"
          onClick={toggleSidebar}
        >
          {isOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </Button>
      </div>
      
      <div 
        className={`h-full bg-secondary border-l w-[240px] transition-all duration-300 overflow-hidden ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <PublishProfile initialData={profile} />
          <Menu profileId={profileId} coverImageUrl={profile.coverImage} />
        </div>
        
        <Tabs defaultValue="format" className="w-full h-[calc(100%-65px)] overflow-y-auto">
          <div className="px-3 pt-2 sticky top-0 bg-secondary z-10">
            <TabsList className="w-full bg-background rounded-md p-1">
              <TabsTrigger value="format" className="flex-1 rounded-sm data-[state=active]:bg-secondary">Format</TabsTrigger>
              <TabsTrigger value="content" className="flex-1 rounded-sm data-[state=active]:bg-secondary">Content</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="format" className="p-3">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Display Name</Label>
                <ProfTitle 
                  initialData={{
                    _id: profileId,
                    displayName: profile.displayName
                  }}
                  onSave={(newValue: string) => {
                    updateProfile({
                      id: profileId,
                      displayName: newValue,
                    });
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Greeting Text</Label>
                <ProfTitle 
                  initialData={{
                    _id: profileId,
                    displayName: greetingText
                  }}
                  onSave={(newValue: string) => {
                    setGreetingText(newValue);
                    updateProfile({
                      id: profileId,
                      greetingText: newValue,
                    });
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Background Color</Label>
                <Select 
                  value={backgroundColor}
                  onValueChange={(value) => handleColorChange('background', value)}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {colorOptions.map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-4 h-4 rounded-sm border"
                            style={{ backgroundColor: color.value }}
                          />
                          {color.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Logo</Label>
                <div className="flex items-center gap-2">
                  {profile.coverImage && (
                    <div className="relative">
                      <img
                        src={profile.coverImage}
                        alt="Logo"
                        className="w-8 h-8 object-contain rounded"
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        className="absolute -top-1 -right-1 h-4 w-4"
                        onClick={() => handleLogoDelete('cover')}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-9 w-full"
                    onClick={() => document.getElementById('cover-logo-upload')?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
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

              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Client Logo</Label>
                <div className="flex items-center gap-2">
                  {clientLogoUrl && (
                    <div className="relative">
                      <img
                        src={clientLogoUrl}
                        alt="Client Logo"
                        className="w-8 h-8 object-contain rounded"
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        className="absolute -top-1 -right-1 h-4 w-4"
                        onClick={() => handleLogoDelete('client')}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="h-9 w-full"
                    onClick={() => document.getElementById('client-logo-upload')?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

