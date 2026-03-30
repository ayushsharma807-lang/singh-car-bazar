"use client";

import { Camera, FileText, Images, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type UploadSourceOption = {
  key: string;
  label: string;
  hint: string;
  accept: string;
  capture?: "environment" | "user";
  multiple?: boolean;
};

type UploadSourceButtonProps = {
  buttonLabel: string;
  sheetTitle?: string;
  desktopSourceKey?: string;
  disabled?: boolean;
  className?: string;
  options: UploadSourceOption[];
  onFilesSelected: (sourceKey: string, files: FileList | null) => void;
};

function getOptionIcon(key: string) {
  if (key === "camera") {
    return Camera;
  }

  if (key === "gallery") {
    return Images;
  }

  return FileText;
}

export function UploadSourceButton({
  buttonLabel,
  sheetTitle,
  desktopSourceKey,
  disabled = false,
  className = "admin-btn h-12 px-4 text-sm",
  options,
  onFilesSelected,
}: UploadSourceButtonProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const media = window.matchMedia("(max-width: 768px), (pointer: coarse)");
    const updateIsMobile = () => setIsMobile(media.matches);
    updateIsMobile();

    media.addEventListener?.("change", updateIsMobile);

    return () => {
      media.removeEventListener?.("change", updateIsMobile);
    };
  }, []);

  const desktopKey = desktopSourceKey || options.find((option) => option.key === "files")?.key || options[0]?.key;

  function openSource(optionKey: string) {
    setIsSheetOpen(false);
    inputRefs.current[optionKey]?.click();
  }

  return (
    <>
      {options.map((option) => (
        <input
          key={option.key}
          ref={(node) => {
            inputRefs.current[option.key] = node;
          }}
          type="file"
          accept={option.accept}
          multiple={option.multiple}
          capture={option.capture}
          className="hidden"
          onChange={(event) => {
            onFilesSelected(option.key, event.currentTarget.files);
            event.currentTarget.value = "";
          }}
        />
      ))}

      <button
        type="button"
        className={className}
        disabled={disabled}
        onClick={() => {
          if (isMobile) {
            setIsSheetOpen(true);
            return;
          }

          if (desktopKey) {
            openSource(desktopKey);
          }
        }}
      >
        {buttonLabel}
      </button>

      {isMobile && isSheetOpen ? (
        <div className="fixed inset-0 z-[60] md:hidden">
          <button
            type="button"
            aria-label="Close upload options"
            className="absolute inset-0 bg-black/35"
            onClick={() => setIsSheetOpen(false)}
          />

          <div className="absolute inset-x-0 bottom-0 rounded-t-3xl bg-white p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-2xl">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-base font-semibold text-black">
                  {sheetTitle || buttonLabel}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Choose where to pick the file from.
                </p>
              </div>
              <button
                type="button"
                className="rounded-full border border-gray-200 p-2 text-gray-500"
                onClick={() => setIsSheetOpen(false)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid gap-3">
              {options.map((option) => {
                const Icon = getOptionIcon(option.key);

                return (
                  <button
                    key={option.key}
                    type="button"
                    className="flex min-h-14 items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-left shadow-sm transition active:scale-[0.99]"
                    onClick={() => openSource(option.key)}
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-700">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="grid gap-0.5">
                      <span className="text-sm font-semibold text-black">{option.label}</span>
                      <span className="text-xs text-gray-500">{option.hint}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
