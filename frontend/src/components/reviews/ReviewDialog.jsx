import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Star, X } from 'lucide-react';
import axios from 'axios';
import { getCookie } from '../../helpers/cookies.helper';

const COLORS = {
    bg: '#FFFBF5',
    pink: '#FF90E8',
    blue: '#5BC0EB',
    yellow: '#FDE24F',
};

const FACILITY_LABELS = {
    parking: '駐車場',
    restroom: 'トイレ',
    diaper_changing: 'おむつ交換台',
    parent_rest_area: '保護者休憩エリア',
    dining_area: 'ダイニングエリア',
    stroller_support: 'ベビーカーサポート',
    medical_room: '医療室',
    air_conditioning: 'エアコン',
    wifi: 'Wi-Fi',
    disability_access: '障害者アクセス',
    locker: 'ロッカー',
    safe_zone: '安全ゾーン'
};

const FACILITY_KEYS = Object.keys(FACILITY_LABELS);

const ReviewDialog = ({ open, onClose, placeId, onReviewSuccess }) => {
    const [rating, setRating] = useState(0);
    const [facilities, setFacilities] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [existingReview, setExistingReview] = useState(null);

    // Initialize facilities
    useEffect(() => {
        const initialFacilities = {};
        FACILITY_KEYS.forEach(key => {
            initialFacilities[key] = '';
        });
        setFacilities(initialFacilities);
    }, []);

    // Load existing review if user already reviewed
    useEffect(() => {
        if (open && placeId) {
            loadMyReview();
        }
    }, [open, placeId]);

    const loadMyReview = async () => {
        try {
            const response = await axios.get(
                `http://localhost:3000/api/reviews/my-review/${placeId}`,
                { withCredentials: true }
            );
            
            if (response.data.data) {
                const existingData = response.data.data;
                setRating(existingData.rating || 0);
                setExistingReview(existingData);
                
                // Populate facilities
                if (existingData.facilities) {
                    setFacilities(existingData.facilities);
                }
            }
        } catch (err) {
            console.log('No existing review or error loading:', err.message);
        }
    };

    const handleFacilityChange = (facilityKey, value) => {
        setFacilities(prev => ({
            ...prev,
            [facilityKey]: value
        }));
    };

    const isFormValid = () => {
        // Chỉ cần rating > 0 thì gửi được, hoặc facilities chọn hết
        const hasRating = rating > 0;
        const allFacilitiesSelected = FACILITY_KEYS.every(key => facilities[key] !== '');
        return hasRating || allFacilitiesSelected;
    };

    const handleSubmit = async () => {
        if (!isFormValid()) {
            setError('星評価またはサービスレビューを入力してください');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            // Lọc chỉ giữ facilities đã được chọn (không rỗng)
            const filteredFacilities = {};
            FACILITY_KEYS.forEach(key => {
                if (facilities[key] !== '') {
                    filteredFacilities[key] = facilities[key];
                }
            });

            const payload = {
                place_id: placeId,
                rating: rating,
                facilities: filteredFacilities
            };

            let response;
            if (existingReview?._id) {
                // Update existing review
                response = await axios.put(
                    `http://localhost:3000/api/reviews/${existingReview._id}`,
                    payload,
                    { withCredentials: true }
                );
            } else {
                // Create new review
                response = await axios.post(
                    'http://localhost:3000/api/reviews',
                    payload,
                    { withCredentials: true }
                );
            }

            if (response.data.success) {
                toast.success(existingReview ? 'レビューが更新されました' : 'レビューが送信されました');
                if (onReviewSuccess) {
                    onReviewSuccess();
                }
                handleClose();
            }
        } catch (err) {
            console.error('Submit review error:', err);
            const errorMsg = err.response?.data?.message || 'レビューの送信に失敗しました';
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setRating(0);
        setFacilities({});
        setError(null);
        setExistingReview(null);
        FACILITY_KEYS.forEach(key => {
            setFacilities(prev => ({
                ...prev,
                [key]: ''
            }));
        });
        onClose();
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white border-4 border-black rounded-2xl shadow-[8px_8px_0_0_#000] max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col" style={{ backgroundColor: COLORS.bg }}>
                {/* Header */}
                <div className="border-b-4 border-black p-6">
                    <h2 className="text-2xl font-black text-center">
                        {existingReview ? 'レビューを編集' : 'レビューを送信'}
                    </h2>
                </div>

                {/* Content */}
                <div className="overflow-y-auto p-6 space-y-6">
                    {/* 星評価セクション */}
                    <div className="bg-white border-2 border-black rounded-lg p-4 shadow-[2px_2px_0_0_#000]">
                        <h3 className="text-lg font-black mb-3">星評価</h3>
                        <div className="flex items-center gap-4">
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        onClick={() => setRating(star)}
                                        className="transition-transform hover:scale-110"
                                    >
                                        <Star
                                            size={32}
                                            className={star <= rating ? "fill-yellow-400 text-yellow-400" : "fill-gray-300 text-gray-300"}
                                        />
                                    </button>
                                ))}
                            </div>
                            <span className="text-lg font-bold">
                                {rating > 0 ? `${rating}.0 / 5.0` : '評価を選択'}
                            </span>
                        </div>
                    </div>

                    {/* サービスレビュー テーブル */}
                    <div>
                        <h3 className="text-lg font-black mb-3">サービスレビュー</h3>
                        <div className="border-2 border-black rounded-lg overflow-hidden shadow-[2px_2px_0_0_#000]">
                            <table className="w-full bg-white">
                                <thead>
                                    <tr className="border-b-2 border-black" style={{ backgroundColor: COLORS.pink }}>
                                        <th className="px-4 py-3 text-left font-black text-sm border-r-2 border-black">
                                            サービス名
                                        </th>
                                        <th className="px-4 py-3 text-center font-black text-sm border-r-2 border-black">
                                            ある
                                        </th>
                                        <th className="px-4 py-3 text-center font-black text-sm border-r-2 border-black">
                                            ない
                                        </th>
                                        <th className="px-4 py-3 text-center font-black text-sm">
                                            気づかなかった
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {FACILITY_KEYS.map((facilityKey, index) => (
                                        <tr
                                            key={facilityKey}
                                            className="border-b border-black last:border-b-0 hover:bg-gray-50 transition-colors"
                                        >
                                            <td className="px-4 py-3 font-bold border-r-2 border-black">
                                                {FACILITY_LABELS[facilityKey]}
                                            </td>
                                            <td className="px-4 py-3 text-center border-r-2 border-black">
                                                <button
                                                    onClick={() => handleFacilityChange(facilityKey, 'yes')}
                                                    className={`w-6 h-6 rounded-full border-2 border-black transition-all ${
                                                        facilities[facilityKey] === 'yes'
                                                            ? 'bg-blue-500 shadow-[2px_2px_0_0_#000]'
                                                            : 'bg-white hover:bg-gray-100'
                                                    }`}
                                                />
                                            </td>
                                            <td className="px-4 py-3 text-center border-r-2 border-black">
                                                <button
                                                    onClick={() => handleFacilityChange(facilityKey, 'no')}
                                                    className={`w-6 h-6 rounded-full border-2 border-black transition-all ${
                                                        facilities[facilityKey] === 'no'
                                                            ? 'bg-blue-500 shadow-[2px_2px_0_0_#000]'
                                                            : 'bg-white hover:bg-gray-100'
                                                    }`}
                                                />
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <button
                                                    onClick={() => handleFacilityChange(facilityKey, 'unknown')}
                                                    className={`w-6 h-6 rounded-full border-2 border-black transition-all ${
                                                        facilities[facilityKey] === 'unknown'
                                                            ? 'bg-blue-500 shadow-[2px_2px_0_0_#000]'
                                                            : 'bg-white hover:bg-gray-100'
                                                    }`}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* エラーメッセージ */}
                    {error && (
                        <div className="bg-red-100 border-2 border-black rounded-lg p-4 font-bold text-red-800">
                            {error}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t-4 border-black p-6 flex gap-3">
                    <button
                        onClick={handleClose}
                        disabled={loading}
                        className="flex-1 px-6 py-3 bg-white border-2 border-black rounded-lg font-bold hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[4px_4px_0_0_#000] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        閉じる
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!isFormValid() || loading}
                        className="flex-1 px-6 py-3 border-2 border-black rounded-lg font-bold shadow-[2px_2px_0_0_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[4px_4px_0_0_#000] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ backgroundColor: COLORS.pink }}
                    >
                        {loading ? '送信中...' : 'レビューを送信'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReviewDialog;
