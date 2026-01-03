import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const PaginationControl = ({ page, totalPages, onPageChange }) => {
  const [inputPage, setInputPage] = useState(page);

  // Đồng bộ state khi page thay đổi từ bên ngoài (ví dụ bấm nút Prev/Next)
  useEffect(() => {
    setInputPage(page);
  }, [page]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      const p = parseInt(inputPage);
      if (!isNaN(p) && p >= 1 && p <= totalPages) {
        onPageChange(p);
        // Blur input sau khi enter để ẩn bàn phím ảo (trên mobile) hoặc bỏ focus
        e.target.blur();
      } else {
        setInputPage(page); // Reset về trang hiện tại nếu nhập sai
      }
    }
  };

  const handleBlur = () => {
    // Khi click ra ngoài thì reset hiển thị về trang hiện tại
    // Hoặc có thể logic là submit luôn, ở đây tôi chọn reset để an toàn
    setInputPage(page);
  };

  const handleChange = (e) => {
    // Chỉ cho phép nhập số
    const val = e.target.value;
    if (val === '' || /^[0-9\b]+$/.test(val)) {
      setInputPage(val);
    }
  };

  if (totalPages <= 1) return null;

  // Style chung cho các nút (Viền đen, bóng cứng)
  const btnClass = "w-12 h-12 bg-white border-2 border-black rounded-lg flex items-center justify-center shadow-[4px_4px_0_0_#000] transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[5px_5px_0_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0";

  return (
    <div className="flex justify-center items-center mt-12 gap-4 font-sans">
      
      {/* Nút Prev */}
      <button 
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className={btnClass}
      >
        <ChevronLeft size={28} strokeWidth={2.5} />
      </button>

      {/* Khối hiển thị trang (Màu vàng, có input) */}
      <div className="h-12 px-6 bg-[#FDE24F] border-2 border-black rounded-lg shadow-[4px_4px_0_0_#000] flex items-center justify-center gap-1 min-w-[120px]">
        {/* Input nhập trang */}
        <input 
          type="text" 
          value={inputPage}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          className="w-4 bg-transparent text-center font-black text-xl text-black outline-none border-none p-0 m-0 focus:underline"
          inputMode="numeric"
        />
        
        {/* Phần tĩnh / Tổng số trang */}
        <span className="font-black text-xl text-black select-none">
          / {totalPages}
        </span>
      </div>

      {/* Nút Next */}
      <button 
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className={btnClass}
      >
        <ChevronRight size={28} strokeWidth={2.5} />
      </button>

    </div>
  );
};

export default PaginationControl;