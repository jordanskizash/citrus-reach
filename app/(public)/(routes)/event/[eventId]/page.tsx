"use client"

import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useParams } from "next/navigation"
import { useState } from "react"
import { CalendarIcon, ClockIcon, MapPinIcon } from "lucide-react"
import { Id } from "@/convex/_generated/dataModel"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card } from "@/components/ui/card"
import toast from "react-hot-toast"

interface RegistrationForm {
  firstName: string
  lastName: string
  email: string
  company: string
  jobTitle: string
}

interface Host {
  name: string
  role: string
}

export default function EventPage(): JSX.Element {
  const params = useParams()
  const eventId = params.eventId as Id<"events">
  const event = useQuery(api.events.getEvent, { eventId })
  const submitRegistration = useMutation(api.events.submitRegistration)
  
  const [registrationForm, setRegistrationForm] = useState<RegistrationForm>({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    jobTitle: ""
  })

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
    toast.success('Registration submitted successfully')
  }

  const renderHosts = () => {
    return (
      <div className="container mx-auto px-4 py-12 mt-10">
        <h2 className="text-4xl font-bold mb-8">Hosts</h2>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3">
          {event.hosts?.map((host, index) => (
            <div key={index} className="flex flex-col items-center space-y-4">
              <div className="aspect-square w-full max-w-[300px] overflow-hidden rounded-lg bg-muted" />
              <div className="text-center">
                <h3 className="text-xl font-semibold">{host.name}</h3>
                <p className="text-muted-foreground">{host.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="h-full bg-background overflow-y-auto overflow-x-hidden">
      {/* Hero Section with Cover */}
      <div className="relative">
        {/* Cover Background */}
        <div className="h-[400px] bg-muted-foreground/10" />
        
        {/* Content Overlay */}
        <div className="absolute inset-0">
          <div className="container mx-auto h-full px-4">
            <div className="relative h-full">
              {/* Event Details */}
              <div className="max-w-2xl pt-16">
                <h1 className="mb-4 text-6xl font-bold tracking-tight">
                  {event.title}
                </h1>
                <div className="space-y-2 mt-6">
                  <div className="inline-flex items-center rounded-md bg-emerald-100 px-3 py-1 text-sm text-emerald-700">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {event.eventDate}
                  </div>
                  <div className="space-y-2">
                    <div className="inline-flex items-center rounded-md bg-emerald-100 px-3 py-1 text-sm text-emerald-700">
                      <ClockIcon className="mr-2 h-4 w-4" />
                      {event.eventTime}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="inline-flex items-center rounded-md bg-emerald-100 px-3 py-1 text-sm text-emerald-700">
                      <MapPinIcon className="mr-2 h-4 w-4" />
                      {event.location}
                    </div>
                  </div>
                </div>
              </div>

              {/* Registration Form */}
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
                          I&apos;d like to learn more about your organization. <span className="text-red-500">*</span>
                        </Label>
                        <RadioGroup defaultValue="no" className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="yes" id="yes" />
                            <Label htmlFor="yes">Yes, please have a member of the sales team contact me</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="no" id="no" />
                            <Label htmlFor="no">No, I&apos;m not interested</Label>
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
            <p>{event.title.toUpperCase()} / {event.eventDate}</p>
            <p>{event.eventTime}</p>
          </div>
          <div className="max-w-2xl mt-8">
            <p className="text-xl leading-relaxed">
              {event.description || "Welcome to our event! Join us for an engaging experience."}
            </p>
          </div>
        </div>
      </div>

      {/* Hosts Section */}
      {renderHosts()}
    </div>
  )
}