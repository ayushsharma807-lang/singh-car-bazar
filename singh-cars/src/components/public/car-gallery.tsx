"use client";

import { useMemo, useState } from "react";

type GalleryImage = {
  id: string;
  imageUrl: string;
};

export function CarGallery({
  images,
  coverImageUrl,
  title,
}: {
  images: GalleryImage[];
  coverImageUrl?: string | null;
  title: string;
}) {
  const validImages = useMemo(() => {
    const filtered = images.filter((image) => image.imageUrl);

    if (!filtered.length && coverImageUrl) {
      return [{ id: "cover-image", imageUrl: coverImageUrl }];
    }

    if (coverImageUrl && !filtered.some((image) => image.imageUrl === coverImageUrl)) {
      return [{ id: "cover-image", imageUrl: coverImageUrl }, ...filtered];
    }

    return filtered;
  }, [coverImageUrl, images]);
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
      <div className="flex h-[420px] w-full items-center justify-center overflow-hidden rounded-[32px] border border-slate-200 bg-gradient-to-b from-slate-100 to-white p-3 shadow-sm sm:h-[520px] sm:p-5 lg:h-[620px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={activeImage.imageUrl}
          alt={title}
          className="h-full w-full object-contain object-center"
        />
      </div>

      {validImages.length > 1 ? (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5">
          {validImages.map((image, index) => {
            const isActive = image.id === activeImage.id;

            return (
              <button
                key={image.id}
                type="button"
                onClick={() => setActiveImageId(image.id)}
                className={`overflow-hidden rounded-[18px] border bg-white p-1.5 transition ${
                  isActive
                    ? "border-[#2252e8] shadow-sm ring-2 ring-[#2252e8]/15"
                    : "border-slate-200 hover:border-slate-300"
                }`}
                aria-label={`Show photo ${index + 1}`}
              >
                <div className="flex h-24 items-center justify-center overflow-hidden rounded-[14px] bg-gradient-to-b from-slate-100 to-white sm:h-28">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image.imageUrl}
                    alt={`${title} ${index + 1}`}
                    className="h-full w-full object-contain object-center"
                  />
                </div>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
