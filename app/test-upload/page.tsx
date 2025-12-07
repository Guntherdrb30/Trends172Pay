'use client';

import { ImageUpload } from '@/components/ImageUpload';
import { useState } from 'react';

export default function TestUploadPage() {
    const [uploadedUrl, setUploadedUrl] = useState<string>('');

    return (
        <div className="p-10 max-w-2xl mx-auto space-y-8">
            <div>
                <h1 className="text-2xl font-bold mb-2">Prueba de Subida de Imágenes</h1>
                <p className="text-gray-600">
                    Usa el componente de abajo para subir una imagen a tu nueva tienda Vercel Blob.
                </p>
            </div>

            <div className="border p-6 rounded-xl bg-white shadow-sm">
                <h2 className="font-semibold mb-4">Componente ImageUpload</h2>
                <ImageUpload
                    onUpload={(url) => {
                        console.log('Imagen subida:', url);
                        setUploadedUrl(url);
                    }}
                />
            </div>

            {uploadedUrl && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 break-all">
                    <strong>¡Éxito! URL generada:</strong>
                    <br />
                    <a href={uploadedUrl} target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">
                        {uploadedUrl}
                    </a>
                </div>
            )}
        </div>
    );
}
