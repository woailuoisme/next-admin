import dynamic from "next/dynamic";
import { memo } from "react";

const SharedImageLightboxModal = dynamic(
  () => import("@/components/data-table/cells/media/image/ImageLightboxModal").then((mod) => mod.ImageLightboxModal),
  { ssr: false },
);

export interface ImageLightboxModalProps {
  url?: string | null;
  previewUrl?: string | null;
  alt?: string;
  onClose: () => void;
}

export const ImageLightboxModal = memo(function ImageLightboxModal({
  url,
  previewUrl,
  alt = "Preview",
  onClose,
}: ImageLightboxModalProps) {
  const resolvedUrl = url ?? previewUrl;
  if (!resolvedUrl) return null;

  return <SharedImageLightboxModal previewUrl={resolvedUrl} alt={alt} onClose={onClose} />;
});
