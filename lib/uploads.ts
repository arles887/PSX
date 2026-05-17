// Minimal UploadThing / Cloudinary wrapper stub
export async function uploadToCloudinary(file: ArrayBuffer | Blob | Buffer, filename: string) {
  // If using Cloudinary, you'd POST to their upload endpoint with form data
  // This is a stub that expects CLOUDINARY_URL or similar env configuration.
  throw new Error('uploadToCloudinary not implemented. Configure Cloudinary or UploadThing and implement this helper.')
}

export async function generateSignedUploadUrl(filename: string, contentType = 'application/octet-stream') {
  // Optionally implement signed uploads for S3/UploadThing
  return { url: '', fields: {} }
}
