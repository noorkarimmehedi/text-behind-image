"use client";
import React from "react";
import { FileUpload } from "@/components/ui/file-upload";
import { ShineBorder } from "@/components/ui/shine-border";

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
    <div className="w-full max-w-4xl mx-auto min-h-96">
      <ShineBorder
        borderWidth={2}
        borderRadius={16}
        duration={8}
        className="bg-white/5 backdrop-blur-md dark:bg-black/5"
        color={["#FF007F", "#39FF14", "#00FFFF"]}
      >
        <FileUpload onChange={handleFileUpload} />
      </ShineBorder>
    </div>
  );
} 