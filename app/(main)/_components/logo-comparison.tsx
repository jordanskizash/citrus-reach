import Image from 'next/image';

// Define types for your data structures
interface UserDetails {
  logoUrl?: string;
}

interface Profile {
  icon?: string;
}

// Define props interface for the component
interface LogoComparisonProps {
  userLogo: string | undefined;
  clientLogo: string | undefined;
  userAlt?: string;
  clientAlt?: string;
  containerClassName?: string;
}

const LogoComparison = ({
  userLogo,
  clientLogo,
  userAlt = "User Company Logo",
  clientAlt = "Client Company Logo",
  containerClassName = "",
}: LogoComparisonProps) => {
  return (
    <div className={`flex flex-col items-center pb-20 pt-6 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 ${containerClassName}`}>
      <div className="w-full flex justify-center items-center mb-2">
        <div className="flex items-center space-x-4">
          <div className="w-[180px] h-[60px] relative flex items-center justify-center">
            <Image
              src={userLogo || "/placeholder.svg?height=50&width=150"}
              alt={userAlt}
              fill
              className="object-contain"
              sizes="150px"
            />
          </div>
          
          <span className="text-5xl font-bold text-black">x</span>
          
          <div className="w-[180px] h-[60px] relative flex items-center justify-center">
            <Image
              src={clientLogo || "/acme.png"}
              alt={clientAlt}
              fill
              className="object-contain"
              sizes="150px"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoComparison;