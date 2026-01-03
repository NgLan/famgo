import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MapPin } from 'lucide-react';
import { getCookie } from '../../helpers/cookies.helper';
import { unlikeDayPlan } from '../../services/favorite.services';

const PlanCard = ({ plan, onUnlike }) => {
  const navigate = useNavigate();
  
  const handleUnlike = async (e) => {
    e.stopPropagation();
    const userStr = getCookie('user');
    if (!userStr) return;
    const user = JSON.parse(userStr);

    try {
      await unlikeDayPlan(user._id, plan.id);
      // Gọi callback để cha (Profile) reload list
      if (onUnlike) onUnlike(plan.id);
    } catch (err) {
      console.error('Unlike plan error', err);
    }
  };

  return (
    <div 
      onClick={() => navigate(`/schedule/${plan.id}`)}
      className="w-full bg-white border-2 border-black rounded-xl overflow-hidden shadow-[4px_4px_0_0_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_#000] transition-all cursor-pointer flex flex-col h-full group"
    >
      {/* 1. Header Image + Heart Button */}
      <div className="h-40 bg-gray-200 border-b-2 border-black relative overflow-hidden">
         <img 
            src={plan.image || 'https://via.placeholder.com/300x200'} 
            alt={plan.name} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
         />
         
         {/* Nút Tim để Bỏ Thích */}
         <button
            onClick={handleUnlike}
            className="absolute top-2 right-2 p-1.5 bg-white border-2 border-black rounded-full shadow-[2px_2px_0_0_#000] hover:bg-red-50 active:translate-y-[1px] active:shadow-none transition-all z-10 flex items-center gap-1"
            title="Hủy thích"
         >
            <Heart size={20} className="fill-red-500 text-red-500" />
            <span className="text-xs font-bold">{plan.total_likes}</span>
         </button>
      </div>

      {/* 2. Content */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-black text-lg mb-1 line-clamp-1 min-h-[1.75rem]">
            {plan.name}
        </h3>
        
        <div className="text-base font-bold text-gray-500 mb-2 flex items-center gap-1">
           <MapPin size={14}/> {plan.places.length} 箇所
        </div>
        
        <p className="text-sm text-gray-600 line-clamp-3 flex-1 mb-4">
            {plan.description || "説明はありません"}
        </p>
        
        <div className="mt-auto flex gap-2">
           <button className="flex-[2] py-2 bg-[#FDE24F] border-2 border-black rounded-lg font-bold text-base hover:bg-[#FCE040] shadow-[2px_2px_0_0_#000] active:translate-y-[1px] active:shadow-none transition-all">
             詳細を見る
           </button>
        </div>
      </div>
    </div>
  );
};

export default PlanCard;