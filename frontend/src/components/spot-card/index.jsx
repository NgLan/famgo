import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Star, Banknote } from 'lucide-react';
import { getCookie } from '../../helpers/cookies.helper';
import { addFavoritePlace, removeFavoritePlace, checkFavoritePlace } from '../../services/favorite.services';

const SpotCard = ({ spot, isFavorite: isFavoriteProp, onToggleFavorite }) => {
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(
    typeof isFavoriteProp === 'boolean' ? isFavoriteProp : false
  );

  useEffect(() => {
    if (typeof isFavoriteProp === 'boolean') {
      setIsFavorite(isFavoriteProp);
      return;
    }
    let mounted = true;
    const userStr = getCookie('user');
    if (!userStr) return;
    try {
      const user = JSON.parse(userStr);
      (async () => {
        try {
          const res = await checkFavoritePlace(user._id, spot._id || spot.id);
          if (mounted && res?.data?.is_favorite !== undefined) {
            setIsFavorite(!!res.data.is_favorite);
          }
        } catch (err) {}
      })();
    } catch (e) {}
    return () => { mounted = false };
  }, [spot, isFavoriteProp]);

  const handleFavoriteClick = async (e) => {
    e.stopPropagation();
    const userStr = getCookie('user');
    if (!userStr) {
      navigate('/login');
      return;
    }
    const user = JSON.parse(userStr);
    try {
      if (isFavorite) {
        await removeFavoritePlace(user._id, spot._id || spot.id);
        setIsFavorite(false);
        if (onToggleFavorite) onToggleFavorite(false, spot);
      } else {
        await addFavoritePlace(user._id, spot._id || spot.id);
        setIsFavorite(true);
        if (onToggleFavorite) onToggleFavorite(true, spot);
      }
    } catch (err) {
      console.error('Favorite toggle error', err);
    }
  };

  const getImageUrl = () => {
    if (spot.thumbnail) return spot.thumbnail;
    if (spot.images && spot.images.length > 0) {
      const firstImage = spot.images[0];
      return typeof firstImage === 'string' ? firstImage : firstImage.url;
    }
    return 'https://via.placeholder.com/300x200?text=No+Image';
  };

  return (
    <div 
      onClick={() => navigate(`/places/${spot._id}`)}
      className="w-full h-[420px] bg-white border-2 border-black rounded-xl overflow-hidden shadow-[4px_4px_0_0_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_#000] transition-all cursor-pointer flex flex-col group"
    >
      {/* 1. Image Section */}
      <div className="h-48 w-full relative border-b-2 border-black overflow-hidden bg-gray-100">
        <img 
          src={getImageUrl()} 
          alt={spot.name} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <button
          onClick={handleFavoriteClick}
          className="absolute top-2 right-2 p-2 bg-white border-2 border-black rounded-full shadow-[2px_2px_0_0_#000] hover:bg-red-50 active:translate-y-[1px] active:shadow-none transition-all z-10"
        >
          <Heart 
            size={20} 
            className={isFavorite ? "fill-red-500 text-red-500" : "text-black"} 
          />
        </button>
        {spot.rating > 0 && (
          <div className="absolute bottom-2 left-2 bg-[#FDE24F] border-2 border-black px-2 py-0.5 rounded flex items-center gap-1 shadow-sm">
            <Star size={14} className="fill-black text-black" />
            <span className="text-xs font-black">{Number(spot.rating).toFixed(1)}</span>
          </div>
        )}
      </div>

      {/* 2. Content Section */}
      <div className="flex-1 p-4 flex flex-col">
        <h3 className="text-lg font-black leading-tight mb-1 line-clamp-2 min-h-[3rem]">
          {spot.name || '名称未設定'}
        </h3>

        <div className="flex items-center justify-between text-xs font-bold text-gray-500 mb-3">
          <span className="bg-green-100 px-2 py-1 rounded border border-green-300 text-black flex items-center gap-1 text-base">
            <Banknote size={16} className="text-green-700"/> 
            {spot.price_range || 'Contact'}
          </span>
          <span>{spot.total_reviews || 0} 評価</span>
        </div>

        <p className="text-sm text-gray-600 line-clamp-2 mb-4 flex-grow">
          {spot.description || 'No description available.'}
        </p>

        <button 
          className="w-full py-2 bg-[#FDE24F] border-2 border-black rounded-lg font-bold text-black shadow-[2px_2px_0_0_#000] hover:bg-[#FCE040] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all mt-auto"
        >
          詳細を見る
        </button>
      </div>
    </div>
  );
};

export default SpotCard;