import { useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";

import {
  deleteProductImage,
  reorderProductImages,
  setPrimaryImage,
  uploadProductImage
} from "../../api/seller";
import { Button, IconButton } from "../../components/ui/Button";
import { Section } from "../../components/ui/Section";
import { useToast } from "../../components/ui/toast";
import { cn } from "../../lib/cn";
import type { ProductImageRow } from "../../types/database";

const MAX_IMAGES = 8;

export function ProductImagesPanel({
  productId,
  images
}: {
  productId: number;
  images: ProductImageRow[];
}) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [draggingId, setDraggingId] = useState<number | null>(null);

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["seller"] });

  const upload = async (files: FileList | File[]) => {
    const remaining = MAX_IMAGES - images.length;
    const selected = Array.from(files).slice(0, Math.max(remaining, 0));

    if (!selected.length) {
      toast.error(`You can upload at most ${MAX_IMAGES} images.`);
      return;
    }

    setBusy(true);
    try {
      for (const [index, file] of selected.entries()) {
        await uploadProductImage(
          productId,
          file,
          images.length + index,
          images.length === 0 && index === 0
        );
      }
      await refresh();
      toast.success(selected.length > 1 ? `${selected.length} images uploaded` : "Image uploaded");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (image: ProductImageRow) => {
    setBusy(true);
    try {
      await deleteProductImage(image);
      await refresh();
      toast.success("Image removed");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not remove the image");
    } finally {
      setBusy(false);
    }
  };

  const makePrimary = async (imageId: number) => {
    setBusy(true);
    try {
      await setPrimaryImage(productId, imageId);
      await refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not set the primary image");
    } finally {
      setBusy(false);
    }
  };

  const dropOnto = async (targetId: number) => {
    if (draggingId == null || draggingId === targetId) return;

    const ids = images.map((image) => image.id);
    const from = ids.indexOf(draggingId);
    const to = ids.indexOf(targetId);
    ids.splice(to, 0, ids.splice(from, 1)[0]);

    setDraggingId(null);
    setBusy(true);
    try {
      await reorderProductImages(productId, ids);
      await refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not reorder images");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Section
      title="Product images"
      description="The primary image is what customers see in listings."
      aside={
        <span className="rounded-pill bg-ceramic px-2.5 py-1 text-[12px] font-semibold text-text-muted tabular-nums">
          {images.length}/{MAX_IMAGES}
        </span>
      }
    >
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragOver(false);
          if (event.dataTransfer.files.length) void upload(event.dataTransfer.files);
        }}
        className={cn(
          "rounded-card border-2 border-dashed p-6 text-center transition-colors",
          dragOver ? "border-action bg-mint/30" : "border-hairline"
        )}
      >
        <p className="text-[14px] text-text-muted">
          Drag images here, or choose files. JPG, PNG, WebP or AVIF up to 5MB.
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple
          hidden
          onChange={(event) => {
            if (event.target.files?.length) void upload(event.target.files);
            event.target.value = "";
          }}
        />
        <Button
          type="button"
          variant="secondary"
          className="mt-3"
          disabled={busy || images.length >= MAX_IMAGES}
          onClick={() => inputRef.current?.click()}
        >
          {busy ? "Working..." : "Choose files"}
        </Button>
      </div>

      {images.length > 0 && (
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {images.map((image) => (
            <li
              key={image.id}
              draggable
              onDragStart={() => setDraggingId(image.id)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => void dropOnto(image.id)}
              className={cn(
                "group relative overflow-hidden rounded-card border-2 bg-ceramic",
                image.primary_image ? "border-action" : "border-transparent",
                draggingId === image.id && "opacity-50"
              )}
            >
              <img src={image.image_url} alt="" className="aspect-square w-full object-cover" />

              {image.primary_image && (
                <span className="absolute top-1.5 left-1.5 rounded-pill bg-action px-2 py-0.5 text-[11px] font-semibold text-white">
                  Primary
                </span>
              )}

              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/55 px-1 py-0.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                <button
                  type="button"
                  disabled={busy || image.primary_image}
                  onClick={() => void makePrimary(image.id)}
                  className="px-2 py-1 text-[12px] font-semibold text-white disabled:opacity-40"
                >
                  Set primary
                </button>
                <IconButton
                  aria-label="Remove image"
                  disabled={busy}
                  onClick={() => void remove(image)}
                  className="size-8 text-white hover:bg-white/20"
                >
                  <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </IconButton>
              </div>
            </li>
          ))}
        </ul>
      )}

      {images.length > 1 && (
        <p className="mt-3 text-[13px] text-text-muted">Drag a thumbnail onto another to reorder.</p>
      )}
    </Section>
  );
}
