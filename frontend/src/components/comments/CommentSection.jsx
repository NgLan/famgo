import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { MoreVertical, Send, User, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { getCookie } from '../../helpers/cookies.helper';

const API_URL = import.meta.env.VITE_API_URL; 

const COLORS = {
    pink: '#FF90E8',
    blue: '#5BC0EB',
    yellow: '#FDE24F',
};

const CommentSection = ({ placeId, placeName }) => {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [newComment, setNewComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedComment, setSelectedComment] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [editContent, setEditContent] = useState('');
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [deleteCommentId, setDeleteCommentId] = useState(null);

    const LIMIT = 5;

    // Lấy user hiện tại từ cookie
    useEffect(() => {
        try {
            const userStr = getCookie('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                setCurrentUser(user);
            }
        } catch (e) {
            console.warn('Failed to get user from cookie', e);
        }
    }, []);

    // Lấy danh sách comments
    useEffect(() => {
        if (!placeId) return;
        fetchComments(1);
    }, [placeId]);

    const fetchComments = async (pageNum = 1) => {
        try {
            setLoading(true);
            setError(null);
            const response = await axios.get(
                `${API_URL}/api/comments/${placeId}?page=${pageNum}&limit=${LIMIT}`,
                {
                    withCredentials: true
                }
            );

            if (response.data && response.data.success) {
                setComments(response.data.data || []);
                setPage(pageNum);
                setTotalPages(response.data.pagination?.totalPages || 1);
            } else {
                throw new Error(response.data?.message || 'Lỗi không xác định');
            }
        } catch (err) {
            console.error('Fetch comments error:', err);
            // Kiểm tra nếu là lỗi 404 (place không tồn tại) thì show thông báo khác
            if (err.response?.status === 404) {
                setError('Địa điểm không tồn tại.');
            } else {
                setError('Không thể tải comments. Vui lòng thử lại.');
            }
            setComments([]);
        } finally {
            setLoading(false);
        }
    };

    // Tạo comment mới
    const handleCreateComment = async () => {
        if (!newComment.trim()) {
            toast.error('コメント内容を入力してください。');
            return;
        }

        if (!currentUser) {
            toast.error('コメントするにはログインしてください');
            return;
        }

        try {
            setSubmitting(true);

            const response = await axios.post(
                `${API_URL}/api/comments`,
                {
                    place_id: placeId,
                    content: newComment.trim()
                },
                {
                    withCredentials: true
                }
            );

            if (response.data && response.data.success) {
                setNewComment('');

                // Thêm comment mới trực tiếp vào danh sách (nếu đang ở trang 1)
                if (page === 1 && response.data.data) {
                    setComments(prevComments => [response.data.data, ...prevComments]);
                } else {
                    // Nếu ở trang khác, reload lại trang 1
                    await fetchComments(1);
                }

                //alert('Bình luận thành công!');
            } else {
                throw new Error(response.data?.message || 'Lỗi không xác định');
            }
        } catch (err) {
            console.error('Create comment error:', err);
            const errorMsg = err.response?.data?.message || err.message || 'Lỗi khi tạo bình luận';
            toast.error(errorMsg);
        } finally {
            setSubmitting(false);
        }
    };

    // Mở menu (3 chấm)
    const handleMenuOpen = (event, comment) => {
        setAnchorEl(event.currentTarget);
        setSelectedComment(comment);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedComment(null);
    };

    // Bắt đầu chỉnh sửa
    const handleEditStart = () => {
        if (selectedComment) {
            setEditingId(selectedComment._id);
            setEditContent(selectedComment.content);
            handleMenuClose();
        }
    };

    // Lưu chỉnh sửa
    const handleEditSave = async () => {
        if (!editContent.trim()) {
            toast.error('内容を空欄にすることはできません');
            return;
        }

        try {
            setSubmitting(true);

            const response = await axios.put(
                `${API_URL}/api/comments/${editingId}`,
                { content: editContent.trim() },
                {
                    withCredentials: true
                }
            );

            if (response.data && response.data.success) {
                // Cập nhật comment trực tiếp trong state
                if (response.data.data) {
                    setComments(prevComments =>
                        prevComments.map(comment =>
                            comment._id === editingId
                                ? response.data.data
                                : comment
                        )
                    );
                } else {
                    // Nếu không có data, reload từ server
                    await fetchComments(page);
                }

                setEditingId(null);
                setEditContent('');
                toast.success('コメントが正常に更新されました！');
            } else {
                throw new Error(response.data?.message || '不明なエラー');
            }
        } catch (err) {
            console.error('Update comment error:', err);
            const errorMsg = err.response?.data?.message || err.message || 'コメントの更新に失敗しました';
            toast.error(errorMsg);
        } finally {
            setSubmitting(false);
        }
    };

    // Hủy chỉnh sửa
    const handleEditCancel = () => {
        setEditingId(null);
        setEditContent('');
    };

    // Mở dialog xác nhận xóa
    const handleDeleteStart = () => {
        if (selectedComment) {
            setDeleteCommentId(selectedComment._id);
            setOpenDeleteDialog(true);
            handleMenuClose();
        }
    };

    // Xóa comment
    const handleDeleteConfirm = async () => {
        try {
            setSubmitting(true);

            const response = await axios.delete(
                `${API_URL}/api/comments/${deleteCommentId}`,
                {
                    withCredentials: true
                }
            );

            if (response.data && response.data.success) {
                // Xóa comment trực tiếp từ state
                setComments(prevComments =>
                    prevComments.filter(comment => comment._id !== deleteCommentId)
                );

                setOpenDeleteDialog(false);
                setDeleteCommentId(null);
                toast.success('コメントが正常に削除されました！');
            } else {
                throw new Error(response.data?.message || '不明なエラー');
            }
        } catch (err) {
            console.error('Delete comment error:', err);
            const errorMsg = err.response?.data?.message || err.message || 'コメントの削除に失敗しました';
            toast.error(errorMsg);
        } finally {
            setSubmitting(false);
        }
    };

    // Kiểm tra user có quyền sửa/xóa không
    const isOwner = (commentUserId) => {
        return currentUser && currentUser._id === commentUserId;
    };

    if (loading && comments.length === 0) {
        return (
            <div className="flex justify-center p-6">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-black border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="mt-6">
            {/* Tiêu đề */}
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-black">コメント ({comments.length})</h3>
            </div>

            {/* Form tạo comment mới */}
            {currentUser ? (
                <div className="bg-white border-2 border-black rounded-xl p-5 mb-6 shadow-[3px_3px_0_0_#000]" style={{ backgroundColor: '#FFF9F0' }}>
                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full border-2 border-black overflow-hidden flex-shrink-0" style={{ backgroundColor: COLORS.blue }}>
                                {currentUser.avatar ? (
                                    <img src={currentUser.avatar} alt={currentUser.fullName} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <User size={20} />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1">
                                <div className="font-bold text-sm">{currentUser.fullName}</div>
                            </div>
                        </div>

                        <textarea
                            className="w-full p-3 border-2 border-black rounded-lg font-sans resize-none focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-50"
                            rows="3"
                            placeholder="このスポットについてあなたの意見を共有してください..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            disabled={submitting}
                        />

                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setNewComment('')}
                                disabled={submitting}
                                className="px-4 py-2 border-2 border-black rounded-lg font-bold hover:bg-gray-100 disabled:opacity-50 transition-colors"
                            >
                                キャンセル
                            </button>
                            <button
                                onClick={handleCreateComment}
                                disabled={submitting || !newComment.trim()}
                                className="flex items-center gap-2 px-4 py-2 border-2 border-black rounded-lg font-bold shadow-[2px_2px_0_0_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0_0_#000] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                style={{ backgroundColor: COLORS.yellow }}
                            >
                                <Send size={18} />
                                {submitting ? '送信中...' : 'コメントを送信'}
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-blue-50 border-2 border-black rounded-xl p-4 mb-6 flex items-center gap-3">
                    <AlertCircle size={24} className="flex-shrink-0" />
                    <div>
                        コメントするには<strong>ログイン</strong>してください
                    </div>
                </div>
            )}

            {/* Thông báo lỗi */}
            {error && (
                <div className="bg-red-50 border-2 border-black rounded-xl p-4 mb-6 flex items-center gap-3">
                    <AlertCircle size={24} className="flex-shrink-0 text-red-600" />
                    <div className="text-red-600 font-bold">{error}</div>
                </div>
            )}

            {/* Danh sách comments */}
            <div className="space-y-4">
                {comments.length > 0 ? (
                    comments.map((comment) => (
                        <div key={comment._id}>
                            {editingId === comment._id ? (
                                // Form chỉnh sửa
                                <div className="bg-white border-2 border-black rounded-xl p-5 shadow-[3px_3px_0_0_#000]" style={{ backgroundColor: '#F0F9FF' }}>
                                    <div className="space-y-4">
                                        <div className="flex items-start gap-3">
                                            <div className="w-10 h-10 rounded-full border-2 border-black overflow-hidden flex-shrink-0" style={{ backgroundColor: COLORS.pink }}>
                                                {comment.user_id?.avatar ? (
                                                    <img src={comment.user_id.avatar} alt={comment.user_id.fullName} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <User size={20} />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-bold text-sm">{comment.user_id?.fullName}</div>
                                                <div className="text-xs text-gray-600">
                                                    {new Date(comment.created_at).toLocaleString('ja-JP')}
                                                </div>
                                            </div>
                                        </div>

                                        <textarea
                                            className="w-full p-3 border-2 border-black rounded-lg font-sans resize-none focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-50"
                                            rows="3"
                                            value={editContent}
                                            onChange={(e) => setEditContent(e.target.value)}
                                            disabled={submitting}
                                        />

                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={handleEditCancel}
                                                disabled={submitting}
                                                className="px-4 py-2 border-2 border-black rounded-lg font-bold hover:bg-gray-100 disabled:opacity-50 transition-colors"
                                            >
                                                キャンセル
                                            </button>
                                            <button
                                                onClick={handleEditSave}
                                                disabled={submitting}
                                                className="px-4 py-2 border-2 border-black rounded-lg font-bold shadow-[2px_2px_0_0_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0_0_#000] disabled:opacity-50 transition-all"
                                                style={{ backgroundColor: COLORS.blue }}
                                            >
                                                {submitting ? '保存中...' : '保存'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                // Hiển thị comment
                                <div className="bg-white border-2 border-black rounded-xl p-5 shadow-[3px_3px_0_0_#000] hover:shadow-[4px_4px_0_0_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all">
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-full border-2 border-black overflow-hidden flex-shrink-0" style={{ backgroundColor: COLORS.pink }}>
                                            {comment.user_id?.avatar ? (
                                                <img src={comment.user_id.avatar} alt={comment.user_id.fullName} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <User size={20} />
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <div className="font-bold text-sm">{comment.user_id?.fullName}</div>
                                                    <div className="text-xs text-gray-600">
                                                        {new Date(comment.created_at).toLocaleString('ja-JP', {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </div>
                                                </div>

                                                {/* Nút 3 chấm - chỉ hiển thị cho chủ comment */}
                                                {isOwner(comment.user_id?._id) && (
                                                    <button
                                                        onClick={(e) => handleMenuOpen(e, comment)}
                                                        className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                                                    >
                                                        <MoreVertical size={18} />
                                                    </button>
                                                )}
                                            </div>

                                            <p className="text-sm whitespace-pre-wrap leading-relaxed">
                                                {comment.content}
                                            </p>

                                            {comment.review_id && (
                                                <div className="mt-2 inline-block px-3 py-1 bg-yellow-100 border-2 border-black rounded-lg text-xs font-bold">
                                                    ⭐ Review: {comment.review_id.rating || comment.review_id}/5
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12 text-gray-500">
                        まだコメントがありません。最初のコメントを書きましょう!
                    </div>
                )}
            </div>

            {/* Phân trang */}
            {totalPages > 1 && (
                <div className="flex justify-center mt-6 gap-2">
                    {[...Array(totalPages)].map((_, index) => {
                        const pageNum = index + 1;
                        const isCurrentPage = page === pageNum;
                        const isEvenPage = pageNum % 2 === 0;
                        const bgColor = isCurrentPage
                            ? (isEvenPage ? COLORS.pink : COLORS.blue)
                            : 'white';

                        return (
                            <button
                                key={pageNum}
                                onClick={() => fetchComments(pageNum)}
                                disabled={isCurrentPage}
                                className={`px-4 py-2 border-2 border-black rounded-lg font-bold transition-all ${isCurrentPage
                                    ? 'shadow-[2px_2px_0_0_#000] translate-x-[-1px] translate-y-[-1px] cursor-default'
                                    : 'hover:shadow-[2px_2px_0_0_#000] hover:translate-x-[-1px] hover:translate-y-[-1px]'
                                    }`}
                                style={{ backgroundColor: bgColor }}
                            >
                                {pageNum}
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Menu (3 chấm) */}
            {anchorEl && (
                <div className="fixed inset-0 z-50" onClick={handleMenuClose}>
                    <div
                        className="absolute bg-white border-2 border-black rounded-lg shadow-[4px_4px_0_0_#000] overflow-hidden"
                        style={{
                            top: anchorEl.getBoundingClientRect().bottom + 5,
                            left: anchorEl.getBoundingClientRect().left - 100,
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={handleEditStart}
                            className="w-full px-4 py-2 text-left font-bold hover:bg-gray-100 transition-colors border-b-2 border-black"
                        >
                            編集
                        </button>
                        <button
                            onClick={handleDeleteStart}
                            className="w-full px-4 py-2 text-left font-bold text-red-600 hover:bg-red-50 transition-colors"
                        >
                            削除
                        </button>
                    </div>
                </div>
            )}

            {/* Dialog xác nhận xóa */}
            {openDeleteDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white border-4 border-black rounded-2xl shadow-[8px_8px_0_0_#000] max-w-md w-full">
                        <div className="border-b-2 border-black p-6">
                            <h3 className="text-xl font-black">削除の確認</h3>
                        </div>
                        <div className="p-6">
                            <p className="text-gray-700">
                                このコメントを削除してもよろしいですか?このアクションは元に戻せません。
                            </p>
                        </div>
                        <div className="border-t-2 border-black p-6 flex gap-3">
                            <button
                                onClick={() => setOpenDeleteDialog(false)}
                                className="flex-1 px-4 py-2 border-2 border-black rounded-lg font-bold hover:bg-gray-100 transition-colors"
                            >
                                キャンセル
                            </button>
                            <button
                                onClick={handleDeleteConfirm}
                                disabled={submitting}
                                className="flex-1 px-4 py-2 bg-red-500 text-white border-2 border-black rounded-lg font-bold shadow-[2px_2px_0_0_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0_0_#000] disabled:opacity-50 transition-all"
                            >
                                {submitting ? '削除中...' : '削除'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CommentSection;
