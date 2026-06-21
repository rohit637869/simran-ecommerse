"use client";

import { useState, useRef } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ImageUploadProps {
  images: { url: string; publicId?: string }[];
  onChange: (images: { url: string; publicId?: string }[]) => void;
  maxImages?: number;
}

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!;

export default function ImageUpload({ images, onChange, maxImages = 10 }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadToCloudinary = async (file: File): Promise<{ url: string; publicId?: string }> => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("upload_preset", UPLOAD_PRESET);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      { method: "POST", body: fd }
    );

    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || "Upload failed");
    return { url: data.secure_url, publicId: data.public_id };
  };

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const remaining = maxImages - images.length;
    if (remaining <= 0) {
      toast.error(`Max ${maxImages} images allowed`);
      return;
    }

    const toUpload = files.slice(0, remaining);
    setUploading(true);

    const results: { url: string; publicId?: string }[] = [];
    for (const file of toUpload) {
      try {
        const result = await uploadToCloudinary(file);
        results.push(result);
      } catch (err: any) {
        toast.error(err.message || `Failed to upload ${file.name}`);
      }
    }

    onChange([...images, ...results]);
    setUploading(false);

    if (inputRef.current) inputRef.current.value = "";
  };

  const remove = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {images.map((img, i) => (
          <div key={i} className="relative group h-24 w-24 rounded overflow-hidden border">
            <img src={img.url} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => remove(i)}
              className="absolute top-1 right-1 hidden group-hover:flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground"
            >
              <X className="h-3 w-3" />
            </button>
            {i === 0 && (
              <span className="absolute bottom-1 left-1 rounded bg-primary/80 px-1.5 py-0.5 text-[10px] text-primary-foreground">
                Primary
              </span>
            )}
          </div>
        ))}
        {images.length < maxImages && (
          <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded border border-dashed text-muted-foreground hover:border-primary hover:text-primary transition-colors">
            {uploading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <Upload className="h-5 w-5 mb-1" />
                <span className="text-[10px]">Upload</span>
              </>
            )}
            <input
              ref={inputRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={handleFiles}
              disabled={uploading}
            />
          </label>
        )}
      </div>
      {images.length === 0 && !uploading && (
        <p className="text-xs text-muted-foreground">No images uploaded yet</p>
      )}
    </div>
  );
}
