import React, { useState } from 'react';
import { ImageOff, Eye, X } from 'lucide-react';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallbackTitle?: string;
  className?: string;
  containerClassName?: string;
  allowZoom?: boolean;
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  fallbackTitle,
  className = '',
  containerClassName = '',
  allowZoom = false,
  ...props
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isZoomed, setIsZoomed] = useState(false);

  return (
    <>
      <div className={`relative overflow-hidden bg-slate-100 flex items-center justify-center ${containerClassName}`}>
        {isLoading && !hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-100 animate-pulse">
            <span className="w-8 h-8 rounded-full border-2 border-[#005baa]/30 border-t-[#005baa] animate-spin" />
          </div>
        )}

        {hasError ? (
          <div className="flex flex-col items-center justify-center p-4 text-center text-slate-400 w-full h-full min-h-[140px] bg-gradient-to-br from-slate-50 to-slate-100">
            <ImageOff className="w-8 h-8 text-slate-400 mb-2 stroke-[1.5]" />
            <span className="text-xs font-medium text-slate-600 max-w-[200px] line-clamp-2">
              {fallbackTitle || alt || 'Hình ảnh minh họa'}
            </span>
            <span className="text-[10px] text-slate-400 mt-1">VietinBank Service</span>
          </div>
        ) : (
          <>
            <img
              src={src}
              alt={alt}
              referrerPolicy="no-referrer"
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setIsLoading(false);
                setHasError(true);
              }}
              className={`transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'} ${className}`}
              {...props}
            />
            {allowZoom && !isLoading && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsZoomed(true);
                }}
                title="Phóng to ảnh"
                className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white backdrop-blur-sm transition-transform active:scale-95"
              >
                <Eye className="w-4 h-4" />
              </button>
            )}
          </>
        )}
      </div>

      {isZoomed && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setIsZoomed(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh] bg-white rounded-2xl overflow-hidden shadow-2xl p-2" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100">
              <span className="text-sm font-semibold text-slate-800">{alt}</span>
              <button
                type="button"
                onClick={() => setIsZoomed(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-2 overflow-auto max-h-[75vh] flex items-center justify-center">
              <img
                src={src}
                alt={alt}
                referrerPolicy="no-referrer"
                className="max-h-[70vh] object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
