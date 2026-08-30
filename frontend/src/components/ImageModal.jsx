import React from 'react';
import { X } from 'lucide-react';

export default function ImageModal({ isOpen, onClose, imageSrc }) {
  if (!isOpen || !imageSrc) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div 
        className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/80 text-white rounded-full transition-colors z-10"
        >
          <X size={24} />
        </button>
        <img 
          src={imageSrc} 
          alt="Full screen view" 
          className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" 
        />
      </div>
    </div>
  );
}
