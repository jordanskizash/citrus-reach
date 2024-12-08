"use client";

import { Doc } from "@/convex/_generated/dataModel";
import { ElementRef, useRef, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import TextareaAutosize from "react-textarea-autosize";

interface ToolbarProps {
    initialData: Doc<"documents">;
    preview?: boolean;
};

export const Toolbar = ({
    initialData,
    preview
}: ToolbarProps) => {
    const inputRef = useRef<ElementRef<"textarea">>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState(initialData.title);

    const update = useMutation(api.documents.update);

    const enableInput = () => {
        if (preview) return;

        setIsEditing(true);
        setTimeout(() => {
            setValue(initialData.title);
            inputRef.current?.focus();
        }, 0);
    };

    const disableInput = () => setIsEditing(false);

    const onInput = (value: string) => {
        setValue(value);
        update({
            id: initialData._id,
            title: value || "Untitled"
        });
    };

    const onKeyDown = (
        event: React.KeyboardEvent<HTMLTextAreaElement>
    ) => {
        if (event.key === "Enter") {
            event.preventDefault();
            disableInput();
        }
    };


    return (
        <div className="px-4 sm:pl-[54px] group relative w-full">
            {isEditing && !preview ? (
                <TextareaAutosize 
                    ref={inputRef}
                    onBlur={disableInput}
                    onKeyDown={onKeyDown}
                    value={value}
                    onChange={(e) => onInput(e.target.value)}
                    className="text-5xl bg-transparent font-bold break-words outline-none text-[#3F3F3F] dark:text-[#CFCFCF] resize-none w-full"
                />
            ) : (
                <h1
                    onClick={enableInput}
                    className="pb-[11.5px] text-4xl sm:text-3xl md:text-4xl lg:text-5xl font-bold break-words outline-none text-[#3F3F3F] dark:text-[#CFCFCF] w-full"
                    style={{
                        padding: 0,
                        marginLeft: 0
                    }}
                >
                    {initialData.title}
                </h1>
            )}
        </div>
    )
}