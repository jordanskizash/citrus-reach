"use client";

import { useMutation } from "convex/react";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface TitleProps {
  initialData: {
    _id: Id<"profiles">;
    displayName: string;
  };
  onSave?: (newValue: string) => void;
}

export const ProfTitle = ({ initialData, onSave }: TitleProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const update = useMutation(api.profiles.update);

  const [displayName, setDisplayName] = useState(initialData.displayName || "Untitled");
  const [isEditing, setIsEditing] = useState(false);

  const enableInput = () => {
    setDisplayName(initialData.displayName);
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
    setDisplayName(event.target.value);
    if (onSave) {
      onSave(event.target.value || "Untitled");
    }
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      disableInput();
    }
  };

  return (
    <div className="flex items-center gap-x-1">
      {isEditing ? (
        <Input
          ref={inputRef}
          onClick={enableInput}
          onBlur={disableInput}
          onChange={onChange}
          onKeyDown={onKeyDown}
          value={displayName}
          className="h-7 px-2 focus-visible:ring-transparent"
        />
      ) : (
        <Button
          onClick={enableInput}
          variant="ghost"
          size="sm"
          className="font-normal h-auto p-1 text-muted-foreground"
        >
          <span className="truncate">{initialData?.displayName}</span>
        </Button>
      )}
    </div>
  );
};

ProfTitle.Skeleton = function TitleSkeleton() {
  return <Skeleton className="h-6 w-16 rounded-md" />;
};

