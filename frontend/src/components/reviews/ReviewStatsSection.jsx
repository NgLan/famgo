import React, { useState, useEffect } from 'react';
import { Star, TrendingUp } from 'lucide-react';
import axios from 'axios';

const COLORS = {
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

const ReviewStatsSection = ({ placeId, refreshTrigger }) => {
    const [stats, setStats] = useState(null);
    const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (placeId) {
            fetchStats();
        }
    }, [placeId, refreshTrigger]);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const response = await axios.get(
                `http://localhost:3000/api/reviews/stats/${placeId}`,
                { withCredentials: true }
            );
            setStats(response.data.data);
        } catch (err) {
            console.error('Error loading review stats:', err);
        } finally {
            setLoading(false);
        }
    };

    if (!stats && !loading) {
        return null;
    }

    const avgRating = stats?.avgRating || 0;
    const totalReviews = stats?.totalReviews || 0;
    const ratingDistribution = stats?.ratingDistribution || {};
    const facilitiesStats = stats?.facilitiesStats || {};

    const getRatingPercentage = (ratingValue) => {
        if (totalReviews === 0) return 0;
        return ((ratingDistribution[ratingValue] || 0) / totalReviews) * 100;
    };

    // Get top facilities (sorted by "yes" count)
    const getTopFacilities = () => {
        const entries = Object.entries(facilitiesStats);
        return entries
            .sort((a, b) => (b[1].yes || 0) - (a[1].yes || 0))
            .slice(0, 4);
    };

    const topFacilities = getTopFacilities();

    return (
        <div className="bg-white border-2 border-black rounded-xl p-6 shadow-[4px_4px_0_0_#000]">
            <div className="flex flex-col md:flex-row gap-6">
                {/* Left: Rating */}
                <div className="text-center px-6 py-4 bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-black rounded-lg">
                    <div className="text-5xl font-black">{avgRating.toFixed(1)}</div>
                    <div className="text-sm text-gray-600 font-bold mt-1">/ 5.0</div>
                    <div className="flex items-center justify-center gap-1 mt-2">
                        {[...Array(5)].map((_, index) => (
                            <Star
                                key={index}
                                size={16}
                                className={index < Math.round(avgRating) ? "fill-yellow-400 text-yellow-400" : "fill-gray-300 text-gray-300"}
                            />
                        ))}
                    </div>
                    <div className="text-xs text-gray-600 font-bold mt-1">({totalReviews} 件)</div>
                </div>

                {/* Right: Top Facilities */}
                <div className="flex-1">
                    <h3 className="text-lg font-black mb-3">サービス評価</h3>

                    {topFacilities.length > 0 ? (
                        <div className="space-y-2 mb-4">
                            {topFacilities.map(([facility, stats]) => {
                                const total = (stats.yes || 0) + (stats.no || 0) + (stats.unknown || 0);
                                const yesPercentage = total > 0 ? ((stats.yes || 0) / total) * 100 : 0;

                                return (
                                    <div key={facility} className="flex items-center gap-3">
                                        <span className="font-bold text-sm w-32 flex-shrink-0">
                                            {FACILITY_LABELS[facility] || facility}
                                        </span>
                                        <div className="flex-1 h-6 bg-gray-200 border-2 border-black rounded-lg overflow-hidden">
                                            <div
                                                className="h-full transition-all"
                                                style={{
                                                    width: `${yesPercentage}%`,
                                                    backgroundColor: COLORS.blue
                                                }}
                                            />
                                        </div>
                                        <span className="font-bold text-sm w-16 text-right">
                                            {stats.yes || 0} / {total}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-sm mb-4">まだサービス評価がありません</p>
                    )}

                    <button
                        onClick={() => setOpenDetailsDialog(true)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-black rounded-lg font-bold shadow-[2px_2px_0_0_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[4px_4px_0_0_#000] transition-all"
                        style={{ backgroundColor: COLORS.yellow }}
                    >
                        <TrendingUp size={18} />
                        <span>もっと見る</span>
                    </button>
                </div>
            </div>


            {/* 詳細ダイアログ */}
            {openDetailsDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white border-4 border-black rounded-2xl shadow-[8px_8px_0_0_#000] max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Header */}
                        <div className="sticky top-0 bg-white border-b-2 border-black p-6 z-10">
                            <h2 className="text-2xl font-black text-center">レビューの詳細</h2>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            {/* 評価分布 */}
                            <div className="mb-6">
                                <h3 className="text-lg font-black mb-4">評価分布</h3>
                                <div className="space-y-3">
                                    {[5, 4, 3, 2, 1].map((rating) => (
                                        <div key={rating} className="flex items-center gap-3">
                                            <span className="font-bold text-sm w-10">{rating}★</span>
                                            <div className="flex-1 h-6 bg-gray-200 border-2 border-black rounded-lg overflow-hidden">
                                                <div
                                                    className="h-full transition-all"
                                                    style={{
                                                        width: `${getRatingPercentage(rating)}%`,
                                                        backgroundColor: rating >= 4 ? COLORS.yellow : rating >= 3 ? COLORS.blue : COLORS.pink
                                                    }}
                                                />
                                            </div>
                                            <span className="font-bold text-sm w-24 text-right">
                                                {ratingDistribution[rating] || 0} ({getRatingPercentage(rating).toFixed(0)}%)
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* サービス統計テーブル */}
                            <div>
                                <h3 className="text-lg font-black mb-4">サービス統計</h3>
                                <div className="border-2 border-black rounded-lg overflow-hidden">
                                    <table className="w-full">
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
                                        <tbody className="bg-white">
                                            {Object.entries(facilitiesStats).map(([facility, stats], index) => (
                                                <tr
                                                    key={facility}
                                                    className={`border-b border-black last:border-b-0 hover:bg-gray-50 transition-colors`}
                                                >
                                                    <td className="px-4 py-3 font-bold border-r-2 border-black">
                                                        {FACILITY_LABELS[facility] || facility}
                                                    </td>
                                                    <td className="px-4 py-3 text-center font-bold border-r-2 border-black">
                                                        {stats.yes || 0}
                                                    </td>
                                                    <td className="px-4 py-3 text-center font-bold border-r-2 border-black">
                                                        {stats.no || 0}
                                                    </td>
                                                    <td className="px-4 py-3 text-center font-bold">
                                                        {stats.unknown || 0}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="sticky bottom-0 bg-white border-t-2 border-black p-6">
                            <button
                                onClick={() => setOpenDetailsDialog(false)}
                                className="w-full px-6 py-3 border-2 border-black rounded-lg font-bold shadow-[2px_2px_0_0_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[4px_4px_0_0_#000] transition-all"
                                style={{ backgroundColor: COLORS.yellow }}
                            >
                                閉じる
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReviewStatsSection;
