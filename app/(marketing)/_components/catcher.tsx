import Image from "next/image"

export default function Catcher() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-16">
      <div className="grid grid-cols-1 md:grid-cols-3 overflow-hidden rounded-2xl shadow-lg">
        {/* First Column */}
        <div className="relative bg-orange-100 p-6 md:p-8">
          <div className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-bold leading-tight">
              Increase your response rate by 40%
            </h2>
            <p className="text-base md:text-lg">
              Your competition is sending cold emails. Stand out with websites personalized to your prospects.
            </p>
          </div>
          <div className="mt-6">
            <Image
              src="/macbook.png"
              alt="Platform dashboard showing event setup interface"
              width={300}
              height={200}
              className="mx-auto"
              
            />
          </div>
        </div>

        {/* Second Column */}
        <div className="bg-black p-6 md:p-8">
          <div className="space-y-4">
            <h2 className="text-2xl md:text-3xl text-white font-bold leading-tight">
              Reach your buyers where they are.
            </h2>
            <p className="text-base md:text-lg text-white">
              Create microsites to enhance your outbound OR share with your audience and generate inbound.
            </p>
          </div>
          <div className="mt-8">
            <Image
              src="/buyers.png"
              alt="Platform dashboard showing event setup interface"
              width={300}
              height={200}
              
            />
          </div>
        </div>

        {/* Third Column */}
        <div className="bg-orange-500 p-6 md:p-8">
          <div className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-bold leading-tight">
              Book more meetings and close faster.
            </h2>
            <p className="text-base md:text-lg">
              Make it easy for prospects to book meetings or reply by linking your calendar and email.
            </p>
          </div>
          <div className="mt-8 justify-center max-h-12 mb-4">
            <Image
              src="/meetinglink.png"
              alt="Team members collaborating and smiling"
              width={300}
              height={100}
              className="rounded-lg mx-auto"
            />
          </div>
        </div>
      </div>
    </div>
  )
}