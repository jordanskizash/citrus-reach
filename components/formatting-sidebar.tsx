'use client'

import * as React from 'react'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Upload, ChevronDown } from 'lucide-react'

interface Profile {
  _id: Id<"profiles">
  displayName: string
  coverImage?: string
  colorPreference?: string
}

interface FormattingModuleProps {
  profile: Profile
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
  const [accentColor, setAccentColor] = React.useState('#000000') // Default accent color

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Implement your file upload logic here
      // After successful upload, update the profile with the logo URL
      const logoUrl = 'YOUR_UPLOADED_LOGO_URL'
      await updateProfile({
        id: profileId,
        coverImage: logoUrl,
      })
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
      // Note: We're not updating the profile here as there's no field for accent color
    }
    onColorChange(type, newColor)
  }

  const ColorPicker = ({ type, color, onChange }: { type: 'background' | 'accent', color: string, onChange: (color: string) => void }) => (
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

  return (
    <div className="bg-background border rounded-lg shadow-sm p-4 space-y-6">
      <h3 className="text-lg font-semibold mb-4">Customize Your Page</h3>
      
      <div className="space-y-4">
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

        <div>
          <Label htmlFor="logo-upload">Logo</Label>
          <div className="flex items-center space-x-2 mt-1">
            {profile.coverImage && (
              <img
                src={profile.coverImage}
                alt="Logo"
                className="w-8 h-8 object-contain rounded"
              />
            )}
            <Button variant="outline" size="sm" onClick={() => document.getElementById('logo-upload')?.click()}>
              <Upload className="w-4 h-4 mr-2" />
              Upload Logo
            </Button>
            <input
              type="file"
              id="logo-upload"
              className="hidden"
              accept="image/*"
              onChange={handleLogoUpload}
            />
          </div>
        </div>
      </div>
    </div>
  )
}