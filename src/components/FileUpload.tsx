import { useDropzone } from "react-dropzone";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface FileUploadProps {
  className?: string;
  onFilesAccepted: (files: File[]) => void;
}

function FileUpload({ className, onFilesAccepted }: FileUploadProps) {
  const [previewFiles, setPreviewFiles] = useState<string[]>([]);

  const { acceptedFiles, fileRejections, getRootProps, getInputProps } =
    useDropzone({
      accept: {
        "image/jpeg": [],
        "image/png": [],
      },
      maxFiles: 1,
      onDrop: (acceptedFiles) => {
        const filePreviews = acceptedFiles.map((file) =>
          URL.createObjectURL(file)
        );
        setPreviewFiles(filePreviews);
        onFilesAccepted(acceptedFiles);
      },
    });

  useEffect(() => {
    if (fileRejections.length) {
      toast.error(fileRejections[0].errors[0].message);
    }
  }, [fileRejections]);

  useEffect(() => {
    // Clean up the object URLs to avoid memory leaks
    return () => {
      previewFiles.forEach((file) => URL.revokeObjectURL(file));
    };
  }, [previewFiles]);

  return (
    <div
      {...getRootProps({
        className: cn(
          "dropzone border p-12 flex flex-col justify-center items-center gap-2 rounded-lg box-border",
          className
        ),
      })}
    >
      {previewFiles.length == 0 ? (
        <>
          <input {...getInputProps()} />
          <span className="text-xl">Drag photo here</span>
          <span>— or —</span>
          <Button>Choose photo to upload</Button>
        </>
      ) : (
        previewFiles.map((e, i) => {
          return (
            <img
              src={e}
              key={`UploadImage${i}`}
              alt={`Preview ${i}`}
              className="h-full w-auto object-cover max-h-[300px]"
            />
          );
        })
      )}
    </div>
  );
}

export default FileUpload;
