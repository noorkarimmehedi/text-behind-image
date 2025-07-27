"use client";
import React from "react";
import { FileUpload } from "@/components/ui/file-upload";

interface FileUploadDemoProps {
  onImageSelect: (file: File) => void;
  canUpload: boolean;
}

export function FileUploadDemo({ onImageSelect, canUpload }: FileUploadDemoProps) {
  const handleFileUpload = (files: File[]) => {
    if (files.length > 0 && canUpload) {
      onImageSelect(files[0]);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto min-h-96 border-2 border-black dark:border-white bg-background rounded-lg">
      <FileUpload onChange={handleFileUpload} />
    </div>
  );
} 