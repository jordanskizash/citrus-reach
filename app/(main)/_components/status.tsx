import { useUser } from "@clerk/clerk-react";
import { api } from "@/convex/_generated/api";

export const Status = () => {
    const { user } = useUser();

    return(
    <div className="w-full bg-gray-100 mb-4 rounded-lg">
        <h1 className="ml-4 text-center text-muted-foreground">Lasted Edited By: {user?.fullName}</h1>
    </div>
    )
}