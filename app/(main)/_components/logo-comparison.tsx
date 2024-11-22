import Image from 'next/image';

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
    <div className={`flex items-center justify-center ${containerClassName}`}>
      <div className="flex items-center space-x-6">
        <div className="w-24 h-12 relative">
          <Image
            src={userLogo || "/placeholder.svg?height=50&width=150"}
            alt={userAlt}
            fill
            className="object-contain"
            sizes="96px"
          />
        </div>
        
        <span className="text-4xl font-bold text-black">×</span>
        
        <div className="w-24 h-12 relative">
          <Image
            src={clientLogo || "/acme.png"}
            alt={clientAlt}
            fill
            className="object-contain"
            sizes="96px"
          />
        </div>
      </div>
    </div>
  );
};

export default LogoComparison;