import React from 'react';
import { ArrowRight } from 'lucide-react';

const CategoryCard = ({ variant = 'district', title, subtitle, image, color, icon, onClick }) => {

  // Style Gitingest: Viền đen, bóng cứng
  const baseClasses = `
    w-full border-2 border-black rounded-xl bg-white cursor-pointer transition-all duration-200 overflow-hidden
    shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
    hover:translate-x-[-2px] hover:translate-y-[-2px]
    hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
    active:translate-x-[2px] active:translate-y-[2px]
    active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
  `;

  // --- 1. Thẻ QUẬN (Có Ảnh nền) ---
  if (variant === 'district') {
    return (
      <div onClick={onClick} className={`${baseClasses} h-[250px] flex flex-col group relative`}>
        {/* Phần Ảnh Minh Họa */}
        <div className="h-[75%] w-full overflow-hidden border-b-2 border-black relative bg-gray-100">
          {/* Lớp phủ màu nhẹ */}
          <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-all" />
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/400x200?text=No+Image'; // Fallback nếu ảnh lỗi
            }}
          />
          {/* ĐÃ XÓA TAG HANOI Ở ĐÂY */}
        </div>

        {/* Phần Tên Quận */}
        <div className="h-[25%] flex flex-col items-center justify-center bg-white">
          <h3 className="text-xl font-black text-black uppercase tracking-tight">{title}</h3>
          <span className="text-xs font-medium text-gray-500 mt-1">{subtitle}</span>
        </div>
      </div>
    );
  }

  // --- 2. Thẻ TUỔI (Ngang) ---
  if (variant === 'age') {
    return (
      <div
        onClick={onClick}
        className={`${baseClasses} h-[180px] flex flex-row items-center justify-between px-6 relative`}
        style={{ backgroundColor: color }}
      >
        {/* Pattern trang trí mờ */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]"></div>

        <div className="flex flex-col items-start z-10">
          <h2 className="text-5xl font-black text-white drop-shadow-[2px_2px_0_rgba(0,0,0,1)] tracking-tighter">
            {title}
          </h2>
          <div className="mt-3 bg-white border-2 border-black px-4 py-1.5 font-bold text-black shadow-[3px_3px_0_rgba(0,0,0,1)] flex items-center gap-2">
            {subtitle}
            <ArrowRight size={16} strokeWidth={3} />
          </div>
        </div>

        {/* Icon to bên phải (Render component Lucide trực tiếp) */}
        <div className="text-white drop-shadow-[4px_4px_0_rgba(0,0,0,0.15)] transform rotate-6 transition-transform group-hover:rotate-12">
          {icon}
        </div>
      </div>
    );
  }

  return null;
};

export default CategoryCard;
