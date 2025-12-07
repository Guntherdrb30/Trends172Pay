'use server';

import { put } from '@vercel/blob';

export async function uploadImage(formData: FormData) {
  const imageFile = formData.get('image') as File;

  if (!imageFile) {
    throw new Error('No image file provided');
  }

  // Se sube con access 'public' como en el ejemplo que pasaste
  const blob = await put(imageFile.name, imageFile, {
    access: 'public',
  });

  return blob;
}
