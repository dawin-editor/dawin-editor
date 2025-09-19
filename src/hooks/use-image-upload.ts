import { useCallback, useEffect, useRef, useState } from "react";
import { handleImageUpload } from "../lib/tiptap-utils";

interface UseImageUploadProps {
  onUpload?: (url: string) => void;
}

export function useImageUpload({ onUpload }: UseImageUploadProps = {}) {
  const previewRef = useRef<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create an abort controller for the upload
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleProgress = useCallback((event: { progress: number }) => {
    // You can use this to show upload progress if needed
    console.log(`Upload progress: ${event.progress}%`);
  }, []);

  const handleThumbnailClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        setFileName(file.name);
        const localUrl = URL.createObjectURL(file);
        setPreviewUrl(localUrl);
        previewRef.current = localUrl;

        try {
          // Create a new AbortController for this upload
          abortControllerRef.current = new AbortController();
          setUploading(true);
          setError(null);
          
          try {
            const uploadedUrl = await handleImageUpload(
              file,
              handleProgress,
              abortControllerRef.current.signal
            );
            onUpload?.(uploadedUrl);
          } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Upload failed";
            setError(errorMessage);
            throw err;
          } finally {
            setUploading(false);
            abortControllerRef.current = null;
          }
        } catch (err) {
          URL.revokeObjectURL(localUrl);
          setPreviewUrl(null);
          setFileName(null);
          return console.error(err);
        }
      }
    },
    [onUpload, handleProgress]
  );

  const handleRemove = useCallback(() => {
    // Abort any ongoing upload
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setFileName(null);
    previewRef.current = null;
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setError(null);
  }, [previewUrl]);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (previewRef.current) {
        URL.revokeObjectURL(previewRef.current);
      }
    };
  }, []);

  return {
    previewUrl,
    fileName,
    fileInputRef,
    handleThumbnailClick,
    handleFileChange,
    handleRemove,
    uploading,
    error,
  };
}
