import React, { useState } from 'react';
import { 
  Sparkles, 
  Gift, 
  Star, 
  ChevronLeft, 
  ChevronRight, 
  PhoneCall, 
  CheckCircle, 
  X, 
  Heart,
  Grid,
  Layers,
  ArrowRight
} from 'lucide-react';
import contentData from '../data/contentData.json';
import { ProductItem } from '../types';
import { ImageWithFallback } from './ImageWithFallback';

export const FeaturedProductsSection: React.FC = () => {
  const { featuredProducts, brand } = contentData;
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [carouselIndex, setCarouselIndex] = useState<number>(0);
  const [interestedProduct, setInterestedProduct] = useState<ProductItem | null>(null);
  const [viewMode, setViewMode] = useState<'carousel' | 'grid'>('carousel');

  // Filter items
  const filteredItems = featuredProducts.items.filter((item) => {
    if (selectedCategory === 'all') return true;
    return item.category === selectedCategory;
  }) as ProductItem[];

  const currentItem = filteredItems[carouselIndex] || filteredItems[0];

  const handleNext = () => {
    setCarouselIndex((prev) => (prev + 1) % filteredItems.length);
  };

  const handlePrev = () => {
    setCarouselIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Header with VietinBank subtle gradient and red accent */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 text-[#005baa] text-xs font-bold shadow-2xs">
          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
          <span>Nổi bật tại Chi nhánh VietinBank</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {featuredProducts.title}
        </h1>
        <p className="text-sm sm:text-base text-slate-600">
          {featuredProducts.description}
        </p>
      </div>

      {/* Filter Tabs / Chips at top (Section 2 of PDF) */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {featuredProducts.categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setCarouselIndex(0);
                }}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-[#005baa] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200'
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* View Mode Toggle */}
        <div className="hidden sm:flex items-center bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setViewMode('carousel')}
            className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
              viewMode === 'carousel' ? 'bg-white shadow-2xs text-[#005baa]' : 'text-slate-500 hover:text-slate-800'
            }`}
            title="Dạng Carousel"
          >
            <Layers className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
              viewMode === 'grid' ? 'bg-white shadow-2xs text-[#005baa]' : 'text-slate-500 hover:text-slate-800'
            }`}
            title="Dạng Lưới"
          >
            <Grid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content Rendering: Carousel Mode or Grid Mode */}
      {viewMode === 'carousel' && currentItem && (
        <div className="relative bg-gradient-to-br from-blue-50/70 via-white to-slate-50 rounded-3xl border-2 border-red-500/20 shadow-md overflow-hidden">
          {/* Subtle Top Red Hairline & Badge */}
          <div className="h-1 bg-gradient-to-r from-[#ed1b24] via-[#005baa] to-[#ed1b24]" />

          <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left: Info & Description */}
            <div className="lg:col-span-6 space-y-4">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-[#ed1b24] text-xs font-extrabold">
                  <Gift className="w-3.5 h-3.5" />
                  <span>{currentItem.badge}</span>
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  {currentItem.categoryName}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                {currentItem.name}
              </h2>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
                {currentItem.description}
              </p>

              {/* Action Button "Tôi quan tâm" */}
              <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={() => setInterestedProduct(currentItem)}
                  className="w-full sm:w-auto px-7 py-3.5 bg-[#005baa] hover:bg-[#004785] text-white font-extrabold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-900/15 transition-transform active:scale-95"
                >
                  <Heart className="w-4 h-4 fill-white" />
                  <span>Tôi quan tâm</span>
                </button>

                <div className="text-xs text-slate-500 flex items-center gap-1">
                  <span>Trang {carouselIndex + 1}/{filteredItems.length}</span>
                </div>
              </div>
            </div>

            {/* Right: Poster Image (Responsive Card with Zoom capability) */}
            <div className="lg:col-span-6 flex justify-center">
              <div className="relative w-full max-w-md rounded-2xl overflow-hidden border border-slate-200/80 shadow-md bg-white">
                <ImageWithFallback
                  src={currentItem.image}
                  alt={currentItem.name}
                  fallbackTitle={currentItem.name}
                  className="w-full h-auto max-h-[460px] object-contain mx-auto"
                  allowZoom={true}
                />
              </div>
            </div>
          </div>

          {/* Carousel Arrows */}
          {filteredItems.length > 1 && (
            <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={handlePrev}
                className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Trước</span>
              </button>

              <div className="flex items-center gap-1.5">
                {filteredItems.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCarouselIndex(idx)}
                    className={`h-2 rounded-full transition-all ${
                      carouselIndex === idx ? 'w-6 bg-[#005baa]' : 'w-2 bg-slate-300'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={handleNext}
                className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1 transition-all"
              >
                <span>Tiếp theo</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Content Rendering: Grid Mode */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-lg hover:border-blue-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="h-56 bg-slate-50 border-b border-slate-100 p-2 flex items-center justify-center">
                  <ImageWithFallback
                    src={item.image}
                    alt={item.name}
                    fallbackTitle={item.name}
                    className="max-h-52 w-auto object-contain"
                    allowZoom={true}
                  />
                </div>
                <div className="p-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-[#ed1b24] text-[11px] font-bold">
                      {item.badge}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {item.categoryName}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 line-clamp-1">
                    {item.name}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>

              <div className="p-5 pt-0">
                <button
                  onClick={() => setInterestedProduct(item)}
                  className="w-full py-2.5 bg-[#005baa] hover:bg-[#004785] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-transform active:scale-95 shadow-sm"
                >
                  <Heart className="w-3.5 h-3.5 fill-white" />
                  <span>Tôi quan tâm</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL: "TÔI QUAN TÂM" (Exact text from PDF Page 1) */}
      {interestedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-5 border border-slate-100 relative">
            <button
              onClick={() => setInterestedProduct(null)}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#005baa] flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle className="w-8 h-8 text-[#005baa]" />
            </div>

            <div className="text-center space-y-2">
              <span className="text-xs font-bold text-[#ed1b24] uppercase tracking-wider block">
                {interestedProduct.name}
              </span>
              <h3 className="text-lg font-bold text-slate-900">
                Cảm ơn Quý khách đã quan tâm
              </h3>
            </div>

            {/* Exactly formatted text requested in prompt */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-700 space-y-3 leading-relaxed">
              <p>
                Cảm ơn Quý khách đã quan tâm đến sản phẩm/dịch vụ này. Quý khách vui lòng liên hệ cán bộ VietinBank tại quầy để được tư vấn chi tiết.
              </p>
              <p className="font-semibold text-[#005baa] pt-1 border-t border-slate-200">
                Hoặc liên hệ Chuyên viên tư vấn Trần Hoàng Trung – 0973.874.232.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2.5">
              <a
                href={`tel:${brand.advisor.phoneClean}`}
                className="w-full py-3 bg-[#005baa] hover:bg-[#004785] text-white font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-md transition-transform active:scale-95"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Gọi Chuyên viên tư vấn</span>
              </a>
              <button
                onClick={() => setInterestedProduct(null)}
                className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm rounded-xl transition-colors"
              >
                Đã hiểu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
