"use client";

import { useState, useRef, ChangeEvent } from "react";
import { UploadCloud, Image as ImageIcon, X, Check, Camera, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ImageUploadProps {
  value?: string;
  onChange: (value: string) => void;
  label?: string;
  className?: string;
  aspectRatio?: "square" | "video" | "banner" | "portrait" | "landscape";
  maxSizeMB?: number;
}

export function ImageUpload({
  value,
  onChange,
  label = "Upload Image",
  className,
  aspectRatio = "video",
  maxSizeMB = 5,
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Invalid file format. Please select an image file (PNG, JPG, WEBP).");
      return;
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`Image size too large. Maximum allowed size is ${maxSizeMB}MB.`);
      return;
    }

    setLoading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      onChange(result);
      setLoading(false);
      toast.success("Image selected successfully!");
    };
    reader.onerror = () => {
      setLoading(false);
      toast.error("Failed to read image file.");
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const aspectClasses = {
    square: "aspect-square",
    video: "aspect-video",
    landscape: "aspect-video",
    banner: "aspect-[21/9]",
    portrait: "aspect-[3/4]",
  }[aspectRatio];

  return (
    <div className={cn("space-y-1.5", className)}>
      {label && <label className="text-xs font-bold text-foreground block">{label}</label>}

      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative overflow-hidden rounded-2xl border-2 border-dashed transition-all cursor-pointer group flex flex-col items-center justify-center p-3 text-center",
          value
            ? "border-emerald-500/50 bg-emerald-500/5 hover:border-emerald-500"
            : isDragging
            ? "border-seneca-crimson bg-seneca-crimson/10 scale-[0.99]"
            : "border-border/80 bg-muted/30 hover:border-seneca-crimson/50 hover:bg-muted/50"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp,image/avif"
          onChange={handleFileChange}
          className="hidden"
        />

        {value ? (
          <div className="relative w-full h-full min-h-[140px] flex items-center justify-center">
            <img
              src={value}
              alt="Uploaded Preview"
              className="max-h-48 w-full object-contain rounded-xl shadow-sm"
            />

            {/* Top right remove & change overlay */}
            <div className="absolute top-2 right-2 flex items-center gap-1.5">
              <span className="p-1 rounded-lg bg-emerald-600 text-white text-[10px] font-bold shadow-md flex items-center gap-1 px-2">
                <Check className="h-3 w-3" />
                <span>Selected</span>
              </span>
              <button
                type="button"
                onClick={handleRemove}
                className="p-1.5 rounded-lg bg-rose-600 text-white shadow-md hover:bg-rose-700 transition-colors"
                title="Remove image"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="absolute bottom-2 left-2 right-2 p-1.5 rounded-xl bg-black/60 backdrop-blur-md text-white text-[10px] font-bold text-center opacity-0 group-hover:opacity-100 transition-opacity">
              Click to replace image
            </div>
          </div>
        ) : (
          <div className="py-5 px-3 flex flex-col items-center justify-center space-y-2">
            <div className="h-10 w-10 rounded-2xl bg-seneca-crimson/10 text-seneca-crimson flex items-center justify-center group-hover:scale-110 transition-transform">
              <UploadCloud className="h-5 w-5" />
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-foreground">
                <span className="text-seneca-crimson">Click to upload</span> or drag and drop
              </p>
              <p className="text-[10px] text-muted-foreground">
                PNG, JPG, WEBP, or AVIF (Max {maxSizeMB}MB)
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
