import { useRef, useState } from "react";
import { Loader2, Upload } from "lucide-react";
import { uploadMedia } from "../api/media";
import { ALLOWED_IMAGE_ACCEPT, validateImageFile } from "../constants/media";

export default function ImageUploadControl({
  onUploaded,
  disabled = false,
  label = "Upload image",
  className = "",
}) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    const validationError = validateImageFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    setUploading(true);

    try {
      const result = await uploadMedia(file);
      onUploaded(result.url);
    } catch (uploadError) {
      setError(uploadError.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_IMAGE_ACCEPT}
        className="sr-only"
        onChange={handleFileChange}
        disabled={disabled || uploading}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={disabled || uploading}
        className="inline-flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-2 font-heading text-sm font-semibold text-primary transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {uploading ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <Upload className="h-4 w-4" aria-hidden="true" />
        )}
        {uploading ? "Uploading..." : label}
      </button>
      {error ? (
        <p className="mt-1 font-body text-xs text-danger">{error}</p>
      ) : null}
    </div>
  );
}
