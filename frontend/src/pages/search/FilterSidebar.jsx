import React, { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import axios from 'axios';

const FilterSidebar = ({ tempFilterState, setTempFilterState, onApply, onReset }) => {
  const [categories, setCategories] = useState([]);
  const [amenities, setAmenities] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:3000/api/places/filters')
      .then(res => {
        setCategories(res.data.data.categories || []);
        setAmenities(res.data.data.amenities || []);
      });
  }, []);

  const handleChange = (key, value) => {
    setTempFilterState(prev => ({ ...prev, [key]: value }));
  };

  const RadioOption = ({ value, currentValue, onChange, label }) => (
    <label className="flex items-center gap-2 cursor-pointer group">
      <div className="relative">
        <input
          type="radio"
          checked={currentValue === value}
          onChange={() => onChange(value)}
          className="peer sr-only"
        />
        <div className="w-5 h-5 border-2 border-black rounded-full peer-checked:bg-[#5BC0EB] peer-checked:border-[#5BC0EB] transition-all"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full opacity-0 peer-checked:opacity-100"></div>
      </div>
      <span className="font-bold text-sm group-hover:text-[#5BC0EB] transition-colors">{label}</span>
    </label>
  );

  return (
    <div className="bg-white border-2 border-black rounded-2xl shadow-[6px_6px_0_0_#000] flex flex-col h-full">
      <div className="p-6 pb-4 border-b-2 border-black flex-shrink-0">
        <h2 className="text-2xl font-black flex items-center gap-2">
          <span className="bg-[#FF90E8] w-2 h-6 rounded-full"></span>
          詳細フィルター
        </h2>
      </div>

      {/* Scrollable Filter Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="space-y-6">

      {/* 対象年齢 */}
      <div className="mb-6">
        <h3 className="font-black mb-3 text-base">対象年齢</h3>
        <div className="space-y-2">
          <RadioOption value="all" currentValue={tempFilterState.age_ranges || 'all'} onChange={(v) => handleChange('age_ranges', v)} label="すべて" />
          <RadioOption value="1-5" currentValue={tempFilterState.age_ranges || 'all'} onChange={(v) => handleChange('age_ranges', v)} label="1 - 5歳" />
          <RadioOption value="6-12" currentValue={tempFilterState.age_ranges || 'all'} onChange={(v) => handleChange('age_ranges', v)} label="6 - 12歳" />
        </div>
      </div>

      {/* アクティビティタイプ */}
      <div className="mb-6">
        <h3 className="font-black mb-3 text-base">アクティビティタイプ</h3>
        <div className="relative">
          <select
            value={tempFilterState.category_ids || 'all'}
            onChange={(e) => handleChange('category_ids', e.target.value)}
            className="w-full px-4 py-2 border-2 border-black rounded-lg font-bold bg-white shadow-[2px_2px_0_0_#000] appearance-none cursor-pointer focus:outline-none focus:shadow-[3px_3px_0_0_#000] transition-all"
          >
            <option value="all">すべて</option>
            {categories.map(c => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" size={20} />
        </div>
      </div>

      <div className="border-t-2 border-dashed border-gray-300 my-6"></div>

      {/* エリア */}
      <div className="mb-6">
        <h3 className="font-black mb-3 text-base">エリア</h3>
        <div className="relative">
          <select
            value={tempFilterState.districts || 'all'}
            onChange={(e) => handleChange('districts', e.target.value)}
            className="w-full px-4 py-2 border-2 border-black rounded-lg font-bold bg-white shadow-[2px_2px_0_0_#000] appearance-none cursor-pointer focus:outline-none focus:shadow-[3px_3px_0_0_#000] transition-all"
          >
            <option value="all">すべて</option>
            {[
              "Hoàn Kiếm", "Hai Bà Trưng", "Ba Đình", "Cầu Giấy", "Tây Hồ", "Hoàng Mai", "Hà Đông",
              "Nam Từ Liêm", "Bắc Từ Liêm", "Long Biên", "Gia Lâm", "Đông Anh", "Khu vực khác"
            ].map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" size={20} />
        </div>
      </div>

      <div className="border-t-2 border-dashed border-gray-300 my-6"></div>

      {/* 料金範囲 */}
      <div className="mb-6">
        <h3 className="font-black mb-3 text-base">料金範囲</h3>
        <div className="space-y-2">
          <RadioOption value="all" currentValue={tempFilterState.price_filter || 'all'} onChange={(v) => handleChange('price_filter', v)} label="すべて" />
          <RadioOption value="free" currentValue={tempFilterState.price_filter || 'all'} onChange={(v) => handleChange('price_filter', v)} label="無料" />
          <RadioOption value="under_100k" currentValue={tempFilterState.price_filter || 'all'} onChange={(v) => handleChange('price_filter', v)} label="10万VND未満" />
          <RadioOption value="100k_300k" currentValue={tempFilterState.price_filter || 'all'} onChange={(v) => handleChange('price_filter', v)} label="10万 – 30万VND" />
          <RadioOption value="over_300k" currentValue={tempFilterState.price_filter || 'all'} onChange={(v) => handleChange('price_filter', v)} label="30万VND以上" />
        </div>
      </div>

      <div className="border-t-2 border-dashed border-gray-300 my-6"></div>

      {/* 営業時間帯 */}
      <div className="mb-6">
        <h3 className="font-black mb-3 text-base">営業時間帯</h3>
        <div className="relative">
          <select
            value={tempFilterState.open_time || 'all'}
            onChange={(e) => handleChange('open_time', e.target.value)}
            className="w-full px-4 py-2 border-2 border-black rounded-lg font-bold bg-white shadow-[2px_2px_0_0_#000] appearance-none cursor-pointer focus:outline-none focus:shadow-[3px_3px_0_0_#000] transition-all"
          >
            <option value="all">すべて</option>
            <option value="morning">午前営業</option>
            <option value="afternoon">午後営業</option>
            <option value="evening">夜営業</option>
            <option value="all_day">終日営業</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" size={20} />
        </div>
      </div>

      <div className="border-t-2 border-dashed border-gray-300 my-6"></div>

      {/* 混雑度 */}
      <div className="mb-6">
        <h3 className="font-black mb-3 text-base">混雑度</h3>
        <div className="space-y-2">
          <RadioOption value="all" currentValue={tempFilterState.crowd_level || 'all'} onChange={(v) => handleChange('crowd_level', v)} label="すべて" />
          <RadioOption value="low" currentValue={tempFilterState.crowd_level || 'all'} onChange={(v) => handleChange('crowd_level', v)} label="空いている" />
          <RadioOption value="medium" currentValue={tempFilterState.crowd_level || 'all'} onChange={(v) => handleChange('crowd_level', v)} label="普通" />
          <RadioOption value="high" currentValue={tempFilterState.crowd_level || 'all'} onChange={(v) => handleChange('crowd_level', v)} label="混雑" />
        </div>
      </div>

      <div className="border-t-2 border-dashed border-gray-300 my-6"></div>

      {/* 設備・アメニティ */}
      <div className="mb-6">
        <h3 className="font-black mb-3 text-base">設備・アメニティ</h3>
        <div className="space-y-2 max-h-[200px] overflow-y-auto p-3 border-2 border-black rounded-lg bg-white shadow-[2px_2px_0_0_#000]">
          {amenities.map(a => {
            const isChecked = (tempFilterState.amenity_ids || []).includes(a._id);
            return (
              <label key={a._id} className="flex items-center gap-2 cursor-pointer group hover:bg-gray-50 p-2 rounded transition-colors">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => {
                      const currentIds = tempFilterState.amenity_ids || [];
                      const newIds = e.target.checked
                        ? [...currentIds, a._id]
                        : currentIds.filter(id => id !== a._id);
                      handleChange('amenity_ids', newIds);
                    }}
                    className="peer sr-only"
                  />
                  <div className="w-5 h-5 border-2 border-black rounded peer-checked:bg-[#5BC0EB] peer-checked:border-[#5BC0EB] transition-all flex items-center justify-center">
                    {isChecked && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    )}
                  </div>
                </div>
                <span className="font-bold text-sm group-hover:text-[#5BC0EB] transition-colors">{a.name}</span>
              </label>
            );
          })}
        </div>
        <p className="text-xs text-gray-500 mt-2 font-medium">複数選択可</p>
      </div>

      <div className="border-t-2 border-dashed border-gray-300 my-6"></div>

      {/* 評価 */}
      <div className="mb-6">
        <h3 className="font-black mb-3 text-base">評価</h3>
        <div className="space-y-2">
          <RadioOption value="all" currentValue={tempFilterState.min_rating || 'all'} onChange={(v) => handleChange('min_rating', v)} label="すべて" />
          <RadioOption value="5" currentValue={tempFilterState.min_rating || 'all'} onChange={(v) => handleChange('min_rating', v)} label="5★" />
          <RadioOption value="4.5" currentValue={tempFilterState.min_rating || 'all'} onChange={(v) => handleChange('min_rating', v)} label="4.5★ 以上" />
          <RadioOption value="4" currentValue={tempFilterState.min_rating || 'all'} onChange={(v) => handleChange('min_rating', v)} label="4★ 以上" />
        </div>
      </div>

      <div className="border-t-2 border-dashed border-gray-300 my-6"></div>

      {/* 距離 */}
      <div className="mb-6">
        <h3 className="font-black mb-3 text-base">距離</h3>
        <div className="space-y-2">
          <RadioOption value="all" currentValue={tempFilterState.radius || 'all'} onChange={(v) => handleChange('radius', v)} label="すべて" />
          <RadioOption value="2" currentValue={tempFilterState.radius || 'all'} onChange={(v) => handleChange('radius', v)} label="2km未満" />
          <RadioOption value="5" currentValue={tempFilterState.radius || 'all'} onChange={(v) => handleChange('radius', v)} label="5km未満" />
          <RadioOption value="10" currentValue={tempFilterState.radius || 'all'} onChange={(v) => handleChange('radius', v)} label="10km未満" />
          <RadioOption value="over_10km" currentValue={tempFilterState.radius || 'all'} onChange={(v) => handleChange('radius', v)} label="10km超" />
        </div>
      </div>
        </div>
      </div>

      {/* Fixed Action Buttons */}
      <div className="flex gap-3 p-6 pt-4 border-t-2 border-black flex-shrink-0 bg-white">
        <button
          onClick={onApply}
          className="flex-1 py-3 bg-[#5BC0EB] border-2 border-black rounded-lg font-black text-black shadow-[4px_4px_0_0_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_#000] active:translate-x-[0px] active:translate-y-[0px] active:shadow-[2px_2px_0_0_#000] transition-all"
        >
          絞り込む
        </button>
        <button
          onClick={onReset}
          className="flex-1 py-3 bg-white border-2 border-black rounded-lg font-black text-black shadow-[4px_4px_0_0_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_#000] active:translate-x-[0px] active:translate-y-[0px] active:shadow-[2px_2px_0_0_#000] transition-all"
        >
          リセット
        </button>
      </div>
    </div>
  );
};

export default React.memo(FilterSidebar);
