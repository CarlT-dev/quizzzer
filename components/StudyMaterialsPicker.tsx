"use client";

import { useEffect, useRef, useState } from "react";

export const MAX_TOTAL_FILE_SIZE = 20 * 1024 * 1024;

export const DOCUMENT_EXTENSIONS = [
  ".pdf",
  ".docx",
  ".pptx",
  ".txt",
];

export const IMAGE_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".heic",
  ".heif",
  ".gif",
];

export function isDocumentFile(file: File) {
  const fileName = file.name.toLowerCase();

  return DOCUMENT_EXTENSIONS.some((extension) =>
    fileName.endsWith(extension)
  );
}

export function isImageFile(file: File) {
  if (file.type.startsWith("image/")) {
    return true;
  }

  const fileName = file.name.toLowerCase();

  return IMAGE_EXTENSIONS.some((extension) =>
    fileName.endsWith(extension)
  );
}

function formatFileSize(size: number) {
  return `${(size / 1024 / 1024).toFixed(2)} MB`;
}

function SelectedMaterial({
  file,
  onRemove,
}: {
  file: File;
  onRemove: () => void;
}) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    null
  );

  const showPreview = isImageFile(file);

  useEffect(() => {
    if (!showPreview) {
      return;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file, showPreview]);

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3">
      <div className="flex min-w-0 items-center gap-3">
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt=""
            className="h-12 w-12 shrink-0 rounded-lg object-cover"
          />
        ) : (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white text-xl">
            📄
          </div>
        )}

        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-gray-800">
            {file.name}
          </p>

          <p className="text-xs text-gray-500">
            {formatFileSize(file.size)}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onRemove}
        className="shrink-0 text-sm font-medium text-red-500 hover:text-red-700"
      >
        Remove
      </button>
    </div>
  );
}

type StudyMaterialsPickerProps = {
  files: File[];
  onError: (message: string) => void;
  onFilesChange: (files: File[]) => void;
  label?: string;
};

export function StudyMaterialsPicker({
  files,
  onError,
  onFilesChange,
  label = "Study materials",
}: StudyMaterialsPickerProps) {
  const totalFileSize = files.reduce(
    (total, file) => total + file.size,
    0
  );

  const selectedMaterialsRef =
    useRef<HTMLDivElement>(null);

  const previousFileCountRef = useRef(files.length);

  useEffect(() => {
    const previousFileCount =
      previousFileCountRef.current;

    const filesWereAdded =
      files.length > previousFileCount;

    if (filesWereAdded) {
      selectedMaterialsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }

    previousFileCountRef.current = files.length;
  }, [files]);

  function addFiles(
    selectedFiles: File[],
    kind: "document" | "image"
  ) {
    onError("");

    if (selectedFiles.length === 0) {
      return;
    }

    const invalidFile = selectedFiles.find((file) =>
      kind === "document"
        ? !isDocumentFile(file)
        : !isImageFile(file)
    );

    if (invalidFile) {
      onError(
        kind === "document"
          ? `"${invalidFile.name}" is not supported. Please use PDF, DOCX, PPTX, or TXT files.`
          : `"${invalidFile.name}" is not a supported photo. Please use JPG, PNG, WEBP, HEIC, or GIF.`
      );

      return;
    }

    const newFilesSize = selectedFiles.reduce(
      (total, file) => total + file.size,
      0
    );

    if (
      totalFileSize + newFilesSize >
      MAX_TOTAL_FILE_SIZE
    ) {
      onError(
        "The total size of your files and photos cannot exceed 20 MB."
      );

      return;
    }

    onFilesChange([...files, ...selectedFiles]);
  }

  function removeFile(index: number) {
    onFilesChange(
      files.filter((_, fileIndex) => fileIndex !== index)
    );

    onError("");
  }

  return (
    <div>
      <label className="text-sm font-medium text-gray-700">
        {label}
      </label>

      <div className="mt-2 grid gap-3 sm:grid-cols-2">
        {/* Add Files */}
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-5 py-8 text-center transition hover:border-gray-500 hover:bg-gray-100">
          <div className="text-3xl">📄</div>

          <p className="mt-3 font-medium text-gray-700">
            Add files
          </p>

          <p className="mt-1 text-sm text-gray-500">
            PDF, DOCX, PPTX, or TXT
          </p>

          <input
            type="file"
            multiple
            accept=".pdf,.docx,.pptx,.txt"
            onChange={(event) => {
              addFiles(
                Array.from(event.target.files ?? []),
                "document"
              );

              event.target.value = "";
            }}
            className="hidden"
          />
        </label>

        {/* Add Photos */}
        <div className="flex flex-col rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-5 py-8 text-center">
          <div className="text-3xl">📷</div>

          <p className="mt-3 font-medium text-gray-700">
            Add photos from your phone
          </p>

          <p className="mt-1 text-sm text-gray-500">
            Take a photo of notes or choose from your gallery
          </p>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-center">
            {/* Take Photo */}
            <label className="cursor-pointer rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800">
              Take photo

              <input
                type="file"
                accept="image/*,.jpg,.jpeg,.png,.webp,.heic,.heif,.gif"
                capture="environment"
                onChange={(event) => {
                  addFiles(
                    Array.from(event.target.files ?? []),
                    "image"
                  );

                  event.target.value = "";
                }}
                className="hidden"
              />
            </label>

            {/* Choose Photos */}
            <label className="cursor-pointer rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 transition hover:bg-gray-50">
              Choose photos

              <input
                type="file"
                multiple
                accept="image/*,.jpg,.jpeg,.png,.webp,.heic,.heif,.gif"
                onChange={(event) => {
                  addFiles(
                    Array.from(event.target.files ?? []),
                    "image"
                  );

                  event.target.value = "";
                }}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      <p className="mt-2 text-xs text-gray-400">
        Maximum total size: 20 MB
      </p>

      {/* Selected Materials */}
      {files.length > 0 && (
        <div
          ref={selectedMaterialsRef}
          className="mt-4 scroll-mt-24 space-y-2"
        >
          {files.map((file, index) => (
            <SelectedMaterial
              key={`${file.name}-${file.size}-${index}`}
              file={file}
              onRemove={() => removeFile(index)}
            />
          ))}

          <p className="text-right text-xs text-gray-500">
            {formatFileSize(totalFileSize)} / 20 MB
          </p>
        </div>
      )}
    </div>
  );
}