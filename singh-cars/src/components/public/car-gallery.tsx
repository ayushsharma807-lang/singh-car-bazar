"use client";

import { useMemo, useState } from "react";

type GalleryImage = {
  id: string;
  imageUrl: string;
};

export function CarGallery({
  images,
  title,
}: {
  images: GalleryImage[];
  title: string;
}) {
  const validImages = useMemo(
    () => images.filter((image) => image.imageUrl),
    [images],
  );
  const [activeImageId, setActiveImageId] = useState(validImages[0]?.id ?? "");
  const activeImage =
    validImages.find((image) => image.id === activeImageId) ?? validImages[0];

  if (!validImages.length) {
    return (
      <div className="flex min-h-[320px] items-center justify-center rounded-[32px] border border-dashed border-slate-300 bg-white px-6 text-center shadow-sm">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
            No Photos Yet
          </p>
          <p className="mt-3 text-base leading-7 text-slate-600">
            Contact Singh Car Bazar for more pictures of this {title}.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={activeImage.imageUrl}
        alt={title}
        className="h-[380px] w-full rounded-[32px] object-cover shadow-sm sm:h-[440px]"
      />

      {validImages.length > 1 ? (
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
          {validImages.map((image, index) => {
            const isActive = image.id === activeImage.id;

            return (
              <button
                key={image.id}
                type="button"
                onClick={() => setActiveImageId(image.id)}
                className={`overflow-hidden rounded-[18px] border transition ${
                  isActive
                    ? "border-[#2252e8] shadow-sm"
                    : "border-slate-200 hover:border-slate-300"
                }`}
                aria-label={`Show photo ${index + 1}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.imageUrl}
                  alt={`${title} ${index + 1}`}
                  className="h-20 w-full object-cover"
                />
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
