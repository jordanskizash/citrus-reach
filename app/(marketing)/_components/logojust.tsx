import Image from "next/image";
import { Poppins } from "next/font/google";
import Link from "next/link";

import { cn } from "@/lib/utils";

const font = Poppins({
    subsets: ["latin"],
    weight: ["400", "600"]
});

export const LogoOnly = ({ mode = "light" }) => {
    return (
        <div className="flex items-center gap-x-2">
            <Link href="/" passHref>
                {mode === "dark" ? (
                    <Image 
                        src="/logo-dark.svg"
                        height="40"
                        width="40"
                        alt="Logo"
                    />
                ) : (
                    <Image 
                        src="/logo.svg"
                        height="40"
                        width="40"
                        alt="Logo"
                        className="dark:hidden"
                    />
                )}
            </Link>
        </div>
    )
}