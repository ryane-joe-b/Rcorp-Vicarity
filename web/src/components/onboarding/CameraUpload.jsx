import React, { useState, useRef } from 'react';

/**
 * Camera Upload Component
 *
 * Profile photo upload with options:
 * - Webcam capture (mobile/desktop)
 * - File upload (drag & drop / click)
 * - Preview with edit/remove
 * - Circular crop preview
 *
 * Features:
 * - Mobile-optimized with native camera
 * - Image preview before upload
 * - File validation (size, type)
 * - Touch-friendly interface
 */

const CameraUpload = ({ currentPhoto, onPhotoChange }) => {
  const [preview, setPreview] = useState(currentPhoto || '');
  const [showCamera, setShowCamera] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Validate file
  const validateFile = (file) => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
      alert('Please upload a JPEG, PNG, or WebP image');
      return false;
    }

    if (file.size > maxSize) {
      alert('Image size must be less than 5MB');
      return false;
    }

    return true;
  };

  // Handle file selection
  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !validateFile(file)) return;

    setUploading(true);

    try {
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        onPhotoChange(reader.result);
        setUploading(false);
      };
      reader.readAsDataURL(file);

      // TODO: Upload to backend/Cloudinary
      // const formData = new FormData();
      // formData.append('photo', file);
      // const response = await api.post('/upload/profile-photo', formData);
      // onPhotoChange(response.data.url);
    } catch (err) {
      console.error('Upload failed:', err);
      setUploading(false);
    }
  };

  // Start camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }

      setShowCamera(true);
    } catch (err) {
      console.error('Camera access failed:', err);
      alert('Unable to access camera. Please use file upload instead.');
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  // Capture photo from camera
  const capturePhoto = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, 640, 480);

    const photoDataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setPreview(photoDataUrl);
    onPhotoChange(photoDataUrl);
    stopCamera();

    // TODO: Upload to backend
  };

  // Remove photo
  const removePhoto = () => {
    setPreview('');
    onPhotoChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {/* Preview Area */}
      {preview ? (
        <div className="flex flex-col items-center">
          <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-sage-500 shadow-lg">
            <img
              src={preview}
              alt="Profile preview"
              className="w-full h-full object-cover"
            />
          </div>
          <button
            type="button"
            onClick={removePhoto}
            className="mt-4 text-sm text-red-600 hover:text-red-700 font-medium"
          >
            Remove Photo
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <p className="mt-2 text-sm text-gray-500">No photo yet</p>
        </div>
      )}

      {/* Upload Options */}
      {!showCamera && (
        <div className="grid grid-cols-2 gap-3">
          {/* File Upload Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="min-h-[44px] px-4 py-3 bg-sage-50 hover:bg-sage-100 border border-sage-200
                     text-sage-700 font-medium rounded-lg transition-all
                     disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Upload</span>
              </>
            )}
          </button>

          {/* Camera Button */}
          <button
            type="button"
            onClick={startCamera}
            className="min-h-[44px] px-4 py-3 bg-ocean-50 hover:bg-ocean-100 border border-ocean-200
                     text-ocean-700 font-medium rounded-lg transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Camera</span>
          </button>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      )}

      {/* Camera View */}
      {showCamera && (
        <div className="space-y-4 animate-fadeIn">
          <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {/* Circular overlay guide */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-48 h-48 rounded-full border-4 border-white/50"></div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={stopCamera}
              className="min-h-[44px] px-4 py-3 bg-gray-100 hover:bg-gray-200
                       text-gray-700 font-medium rounded-lg transition-all"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={capturePhoto}
              className="min-h-[44px] px-4 py-3 bg-ocean-500 hover:bg-ocean-600
                       text-white font-semibold rounded-lg shadow-lg transition-all
                       hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Capture
            </button>
          </div>
        </div>
      )}

      {/* Info */}
      <p className="text-xs text-gray-500 text-center">
        Max 5MB • JPEG, PNG, or WebP
      </p>
    </div>
  );
};

export default CameraUpload;
