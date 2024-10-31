"use client"

import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useParams } from "next/navigation"
import { useState } from "react"
import { CalendarIcon, Check, ClockIcon, MapPinIcon, PencilIcon, X } from "lucide-react"
import { format } from "date-fns"
import { Id } from "@/convex/_generated/dataModel"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card } from "@/components/ui/card"
import Editor from "@/components/editor"
import toast from "react-hot-toast"

interface RegistrationForm {
  firstName: string
  lastName: string
  email: string
  company: string
  jobTitle: string
}

interface EditableField {
  title: boolean
  date: boolean
  time: boolean
  location: boolean
}

export default function EventPage() {
  const params = useParams()
  const eventId = params.eventId as Id<"events">
  
  const [registrationForm, setRegistrationForm] = useState<RegistrationForm>({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    jobTitle: ""
  })

  const [isEditing, setIsEditing] = useState<EditableField>({
    title: false, 
    date: false,
    time: false,
    location: false
  })

  const [editValues, setEditValues] = useState({
    title: "",
    date: "",
    time: "",
    location: ""
  })

  const event = useQuery(api.events.getEvent, { eventId })
  const submitRegistration = useMutation(api.events.submitRegistration)
  const updateEvent = useMutation(api.events.update)

  if (!event) return <div>Loading...</div>

  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault()
    await submitRegistration({
      eventId,
      ...registrationForm,
      timestamp: Date.now(),
      name: "",
      role: ""
    })
    setRegistrationForm({
      firstName: "",
      lastName: "",
      email: "",
      company: "",
      jobTitle: ""
    })
  }

  const handleEdit = (field: keyof EditableField) => {
    setIsEditing(prev => ({ ...prev, [field]: true }))
    setEditValues(prev => ({
      ...prev,
      [field]: field === 'title' ? event.title :
               field === 'date' ? event.eventDate : 
               field === 'time' ? event.eventTime :
               event.location
    }))
  }

  const handleSave = async (field: keyof EditableField) => {
    try {
      await updateEvent({
        id: eventId,
        [field === 'title' ? 'title' :
         field === 'date' ? 'eventDate' : 
         field === 'time' ? 'eventTime' : 'location']: editValues[field]
      })
      
      setIsEditing(prev => ({ ...prev, [field]: false }))
      toast.success(`${field} updated successfully`)
    } catch (error) {
      toast.error(`Failed to update ${field}`)
    }
  }

  const handleCancel = (field: keyof EditableField) => {
    setIsEditing(prev => ({ ...prev, [field]: false }))
  }

  const renderEditableTitle = () => {
    if (isEditing.title) {
      return (
        <div className="flex items-center gap-2">
          <Input
            value={editValues.title}
            onChange={(e) => setEditValues(prev => ({
              ...prev,
              title: e.target.value
            }))}
            className="text-4xl font-bold h-16 px-2"
            placeholder="Enter title"
          />
          <div className="flex flex-col gap-2">
            <Button
              onClick={() => handleSave('title')}
              variant="ghost"
              size="icon"
              className="h-8 w-8"
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => handleCancel('title')}
              variant="ghost"
              size="icon"
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )
    }

    return (
      <div className="group relative inline-block">
        <h1 className="mb-4 text-6xl font-bold tracking-tight">
          {event.title}
        </h1>
        <Button
          onClick={() => handleEdit('title')}
          variant="ghost"
          size="icon"
          className="absolute -right-10 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <PencilIcon className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  const renderEditableTag = (
    field: keyof EditableField,
    value: string,
    icon?: React.ReactNode
  ) => {
    if (isEditing[field]) {
      return (
        <div className="inline-flex items-center space-x-2">
          <Input
            value={editValues[field]}
            onChange={(e) => setEditValues(prev => ({
              ...prev,
              [field]: e.target.value
            }))}
            className="h-8 w-40"
            placeholder={`Enter ${field}`}
          />
          <Button
            onClick={() => handleSave(field)}
            variant="ghost"
            size="icon"
            className="h-8 w-8"
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => handleCancel(field)}
            variant="ghost"
            size="icon"
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )
    }

    return (
      <div
        onClick={() => handleEdit(field)}
        className="inline-flex items-center rounded-md bg-emerald-100 px-3 py-1 text-sm text-emerald-700 cursor-pointer hover:bg-emerald-200"
      >
        {icon}
        {value}
      </div>
    )
  }



  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Cover */}
      <div className="relative">
        {/* Cover Background */}
        <div className="h-[400px] bg-muted-foreground/10" />
        
        {/* Content Overlay */}
        {/* Content Overlay */}
        <div className="absolute inset-0">
          <div className="container mx-auto h-full px-4">
            <div className="relative h-full">
              {/* Event Details */}
              <div className="max-w-2xl pt-16">
                {renderEditableTitle()}
                <div className="space-y-4 mt-6">
                  {renderEditableTag('date', event.eventDate, <CalendarIcon className="mr-2 h-4 w-4" />)}
                  <div className="space-y-2">
                    {renderEditableTag('time', event.eventTime, <ClockIcon className="mr-2 h-4 w-4" />)}
                  </div>
                  <div className="space-y-2">
                    {renderEditableTag('location', event.location, <MapPinIcon className="mr-2 h-4 w-4" />)}
                  </div>
                </div>
              </div>

              
              {/* Registration Form - Positioned to overlap */}
              <div className="absolute right-4 top-20 w-full max-w-md position:fixed">
                <Card className="w-full bg-background p-6 shadow-lg">
                  <form onSubmit={handleRegistration} className="space-y-4">
                    <h2 className="text-2xl font-bold">Register</h2>
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First name <span className="text-red-500">*</span></Label>
                      <Input
                        id="firstName"
                        value={registrationForm.firstName}
                        onChange={(e) => setRegistrationForm(prev => ({
                          ...prev,
                          firstName: e.target.value
                        }))}
                        required
                        placeholder="Enter your first name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last name <span className="text-red-500">*</span></Label>
                      <Input
                        id="lastName"
                        value={registrationForm.lastName}
                        onChange={(e) => setRegistrationForm(prev => ({
                          ...prev,
                          lastName: e.target.value
                        }))}
                        required
                        placeholder="Enter your last name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Work email address <span className="text-red-500">*</span></Label>
                      <Input
                        id="email"
                        type="email"
                        value={registrationForm.email}
                        onChange={(e) => setRegistrationForm(prev => ({
                          ...prev,
                          email: e.target.value
                        }))}
                        required
                        placeholder="you@your.email"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company">Company name <span className="text-red-500">*</span></Label>
                      <Input
                        id="company"
                        value={registrationForm.company}
                        onChange={(e) => setRegistrationForm(prev => ({
                          ...prev,
                          company: e.target.value
                        }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="jobTitle">Job title <span className="text-red-500">*</span></Label>
                      <Input
                        id="jobTitle"
                        value={registrationForm.jobTitle}
                        onChange={(e) => setRegistrationForm(prev => ({
                          ...prev,
                          jobTitle: e.target.value
                        }))}
                        required
                      />
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>
                          I'd like to learn more about the Figma Organization or Enterprise plan. <span className="text-red-500">*</span>
                        </Label>
                        <RadioGroup defaultValue="no" className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="yes" id="yes" />
                            <Label htmlFor="yes">Yes, please have a member of the sales team contact me</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="no" id="no" />
                            <Label htmlFor="no">No, I'm not interested</Label>
                          </div>
                        </RadioGroup>
                      </div>
                    </div>
                    <Button type="submit" className="w-full bg-zinc-900 text-white hover:bg-zinc-800">
                      Submit
                    </Button>
                  </form>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Event Description */}
      <div className="container mx-auto px-4 py-12">
        <div className="prose prose-gray max-w-4xl dark:prose-invert">
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>EPISODE-002 / OCT-31-2024</p>
            <p>8:30AM PT / 11:30AM ET / 4:30PM CET</p>
          </div>
          <p className="text-xl leading-relaxed max-w-3xl mt-10">
            We're back with our second episode of Release Notes—a look at all the latest Figma updates to help you make your greatest work yet. Join us live as we drop brand new features and recap everything we shipped in October [CYMK].
          </p>
          
        </div>
      </div>

      {/* Hosts Section */}
      <div className="container mx-auto px-4 py-12 mt-32">
        <h2 className="mb-8 text-4xl font-bold">Hosts</h2>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3">
          {[1, 2, 3].map((_, index) => (
            <div key={index} className="flex flex-col items-center space-y-4">
              <div className="aspect-square w-full max-w-[300px] overflow-hidden rounded-lg bg-muted" />
              <h3 className="text-xl font-semibold">Host Name</h3>
              <p className="text-muted-foreground">Position at Figma</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}