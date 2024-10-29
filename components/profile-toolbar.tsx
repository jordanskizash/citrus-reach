"use client";

import { Doc } from "@/convex/_generated/dataModel";
import { ElementRef, useRef, useState } from "react";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import TextareaAutosize from "react-textarea-autosize";

interface ToolbarProps {
  initialData: Doc<"profiles">;
  preview?: boolean;
  editable?: boolean; // New prop
}

export const ProfToolbar = ({ initialData, preview, editable = true }: ToolbarProps) => {
  const inputRef = useRef<ElementRef<"textarea">>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialData.displayName);

  const update = useMutation(api.profiles.update);

  const enableInput = () => {
    if (preview || !editable) return; // Prevent editing if not editable

    setIsEditing(true);
    setTimeout(() => {
      setValue(initialData.displayName);
      inputRef.current?.focus();
    }, 0);
  };

  const disableInput = () => setIsEditing(false);

  const onInput = (value: string) => {
    setValue(value);
    update({
      id: initialData._id,
      displayName: value || "Name",
    });
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      disableInput();
    }
  };

  // Use greetingText from initialData if available
  const greetingText = initialData.greetingText || `Hey, ${initialData.displayName} - Check out this recording!`;

  return (
    <div className="pl-[54px] group relative">
      {isEditing && !preview && editable ? (
        <TextareaAutosize
          ref={inputRef}
          onBlur={disableInput}
          onKeyDown={onKeyDown}
          value={value}
          onChange={(e) => onInput(e.target.value)}
          className="text-5xl bg-transparent font-bold break-words outline-none text-[#3F3F3F] dark:text-[#CFCFCF] max-w-4xl resize-none"
        />
      ) : (
        <div
          onClick={editable ? enableInput : undefined}
          className={`pb-[11.5px] text-5xl font-bold break-words outline-none text-[#3F3F3F] dark:text-[#CFCFCF] relative group ${
            editable ? "cursor-text" : ""
          }`}
        >
          {greetingText}
        </div>
      )}
    </div>
  );
};
