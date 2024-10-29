"use client";

import { useMutation } from "convex/react";
import { Doc } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit2 } from "lucide-react";
import { toast } from "react-hot-toast";

interface DescriptionProps {
  initialData: Doc<"profiles">;
}

export const ProfileDescription = ({ initialData }: DescriptionProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const update = useMutation(api.profiles.update);

  const [description, setDescription] = useState(initialData.description || "Add a description for your video");
  const [isEditing, setIsEditing] = useState(false);

  const enableInput = () => {
    setDescription(initialData.description || "");
    setIsEditing(true);
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.setSelectionRange(0, inputRef.current.value.length);
    }, 0);
  };

  const disableInput = () => {
    setIsEditing(false);
  };

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDescription(event.target.value);
    update({
      id: initialData._id,
      description: event.target.value || "Add a description for your video",
    });
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      disableInput();
      toast.success("Description updated successfully");
    }
  };

  return (
    <div className="relative w-full group">
      {isEditing ? (
        <Input
          ref={inputRef}
          onClick={enableInput}
          onBlur={disableInput}
          onChange={onChange}
          onKeyDown={onKeyDown}
          value={description}
          className="w-full p-2 text-lg focus-visible:ring-transparent"
          placeholder="Add a description for your video"
        />
      ) : (
        <div className="flex items-start gap-x-2 group/description w-full">
          <p 
            onClick={enableInput} 
            className="text-lg cursor-text flex-1 min-h-[2rem] hover:text-muted-foreground transition"
          >
            {description}
          </p>
          <Button
            onClick={enableInput}
            variant="ghost"
            size="sm"
            className="opacity-0 group-hover/description:opacity-100 transition"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};