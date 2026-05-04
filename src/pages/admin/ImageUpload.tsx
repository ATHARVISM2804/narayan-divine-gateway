import { useState, useRef, useCallback } from "react";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Props {
  value: string | null;
  onChange: (url: string | null) => void;
}

const ImageUpload = ({ value, onChange }: Props) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5 MB");
      return;
    }
    setError("");
    setUploading(true);

    const ext = file.name.split(".").pop() || "jpg";
    const name = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error: upErr } = await supabase.storage
      .from("product-images")
      .upload(name, file, { cacheControl: "3600", upsert: false });

    if (upErr) {
      setError(upErr.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("product-images").getPublicUrl(name);
    onChange(data.publicUrl);
    setUploading(false);
  }, [onChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) upload(file);
  }, [upload]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) upload(file);
    e.target.value = "";
  };

  if (value) {
    return (
      <div className="relative overflow-hidden rounded-xl border border-gold/40">
        <img src={value} alt="Product" className="h-48 w-full object-cover" />
        <button
          type="button"
          onClick={() => onChange(null)}
          className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-maroon-deep/80 text-white shadow-md hover:bg-red-600 transition-colors"
        >
          <X size={14} />
        </button>
      </div>
    );
  }

  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 transition-all ${
          dragOver
            ? "border-saffron bg-saffron/10"
            : "border-gold/40 bg-cream hover:border-saffron/60 hover:bg-saffron/5"
        }`}
      >
        {uploading ? (
          <Loader2 size={28} className="animate-spin text-saffron" />
        ) : (
          <div className="grid h-12 w-12 place-items-center rounded-full bg-gold/20 text-saffron">
            {dragOver ? <ImageIcon size={22} /> : <Upload size={22} />}
          </div>
        )}
        <div className="text-center">
          <p className="text-sm font-medium text-maroon">
            {uploading ? "Uploading…" : dragOver ? "Drop image here" : "Click or drag image"}
          </p>
          <p className="mt-1 text-xs text-brown/50">PNG, JPG up to 5 MB</p>
        </div>
      </div>
      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
    </div>
  );
};

export default ImageUpload;
