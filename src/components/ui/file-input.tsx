import * as React from "react";
import { cn } from "@/src/lib/utils";
import { Label } from "./label";

export interface FileInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  onFilesChange?: (files: File[]) => void;
}

const FileInput = React.forwardRef<HTMLInputElement, FileInputProps>(
  ({ className, label, onFilesChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (onFilesChange) {
        onFilesChange(files);
      }
      if (props.onChange) {
        props.onChange(e);
      }
    };

    return (
      <div className="space-y-2">
        {label && <Label htmlFor={props.id}>{label}</Label>}
        <input
          type="file"
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          ref={ref}
          {...props}
          onChange={handleChange}
        />
      </div>
    );
  }
);
FileInput.displayName = "FileInput";

export { FileInput };
