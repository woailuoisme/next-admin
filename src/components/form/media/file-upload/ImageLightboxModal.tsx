import { X } from "lucide-react";
import { memo } from "react";

interface ImageLightboxModalProps {
  url: string | null;
  onClose: () => void;
}

export const ImageLightboxModal = memo(function ImageLightboxModal({
  url,
  onClose,
}: ImageLightboxModalProps) {
  if (!url) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-card relative max-h-[85vh] max-w-2xl overflow-hidden rounded-xl p-2 shadow-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 z-10 flex size-8 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/90"
          aria-label="关闭预览"
        >
          <X className="size-4" />
        </button>
        <img src={url} alt="Preview" className="max-h-[80vh] w-auto rounded-lg object-contain" />
      </div>
    </div>
  );
});
