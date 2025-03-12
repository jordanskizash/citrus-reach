import CustomerTestimonial from "./customer-testimonial"

export default function TestimonialPage() {
  return (
    <div className="min-h-screen mb-16 bg-white p-8">
      <CustomerTestimonial
        quote="Citrus Reached has become indispensable - helped our team improve meetings booked by 40%."
        name="Sarah Johnson"
        role="Marketing Director"
        company="TechSolutions"
        imageUrl="/placeholder.svg?height=48&width=48"
      />
    </div>
  )
}

