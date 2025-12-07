'use client';

import { useState, useRef } from 'react';
import { uploadImage } from '@/app/actions/upload-image';
import { Upload, X, Loader2, Copy, Check } from 'lucide-react';
import Image from 'next/image';

interface ImageUploadProps {
  onUpload?: (url: string) => void;
  defaultImage?: string;
  className?: string;
}

export function ImageUpload({ onUpload, defaultImage, className = '' }: ImageUploadProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(defaultImage || null);
  const [isUploading, setIsUploading] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const blob = await uploadImage(formData);
      setImageUrl(blob.url);
      if (onUpload) {
        onUpload(blob.url);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    setImageUrl(null);
    if (onUpload) {
      onUpload('');
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const copyToClipboard = () => {
    if (imageUrl) {
      navigator.clipboard.writeText(imageUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={`w-full max-w-sm ${className}`}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {!imageUrl ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors h-48"
        >
          {isUploading ? (
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          ) : (
            <>
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-500 font-medium">Click to upload image</p>
              <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF up to 4MB</p>
            </>
          )}
        </div>
      ) : (
        <div className="relative rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
          <div className="aspect-video relative w-full">
            <Image
              src={imageUrl}
              alt="Uploaded image"
              fill
              className="object-cover"
            />
          </div>

          <div className="absolute top-2 right-2 flex gap-1">
            <button
              onClick={handleRemove}
              className="p-1.5 bg-white/90 rounded-full shadow-sm hover:bg-white text-red-500 transition-colors"
              title="Remove image"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-3 flex items-center gap-2 border-t border-gray-200 bg-white">
            <input
              type="text"
              value={imageUrl}
              readOnly
              className="flex-1 text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded px-2 py-1 truncate focus:outline-none"
            />
            <button
              onClick={copyToClipboard}
              className="p-1.5 text-gray-500 hover:text-blue-600 transition-colors"
              title="Copy URL"
            >
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
