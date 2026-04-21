import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { 
    useAddReviewMutation, 
    useDeleteReviewMutation,
    useUpdateReviewMutation, 
    useGetAllReviewsQuery 
} from '../redux/api/users.js';
import { Trash2, Send, User, Edit3, X, Check } from 'lucide-react'; 
import { BASE_URL } from "../redux/constants"; 

const Comments = ({ movieId }) => {
    const [comment, setComment] = useState('');
    const [editId, setEditId] = useState(null); // Tracks which review is being edited
    const [editContent, setEditContent] = useState(''); // Holds temp edit text

    const { userInfo } = useSelector((state) => state.auth);
    const { data: allReviews, isLoading: isLoadingReviews, refetch } = useGetAllReviewsQuery(movieId);
    
    const [addReview, { isLoading: isPosting }] = useAddReviewMutation();
    const [deleteReview] = useDeleteReviewMutation();
    const [updateReview] = useUpdateReviewMutation();

    const defaultAvatar = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

    const getAvatarUrl = (reviewUser) => {
        if (!reviewUser?.image) return defaultAvatar;
        if (reviewUser.image.startsWith("http") || reviewUser.image.startsWith("data:")) return reviewUser.image;
        const imagePath = reviewUser.image.startsWith("/") ? reviewUser.image : `/${reviewUser.image}`;
        return `${BASE_URL}${imagePath}`;
    };

    const handlePostComment = async (e) => {
        e.preventDefault();
        if (!comment.trim()) return;
        try {
            await addReview({ comment, MovieID: movieId }).unwrap();
            setComment('');
            refetch(); 
        } catch (err) { console.error(err); }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Delete this review?")) {
            try {
                await deleteReview(id).unwrap();
                refetch(); 
            } catch (err) { console.error(err); }
        }
    };

    const handleUpdate = async (id) => {
        if (!editContent.trim()) return;
        try {
            // Matching your slice query: { reviewId, data: { comment } }
            await updateReview({ reviewId: id, data: { comment: editContent } }).unwrap();
            setEditId(null);
            refetch();
        } catch (err) { console.error(err); }
    };

    const startEditing = (rev) => {
        setEditId(rev._id);
        setEditContent(rev.comment);
    };

    return (
        <div className="space-y-8">
            {/* Post Section */}
            {userInfo ? (
                <form onSubmit={handlePostComment} className="relative">
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Write a public comment..."
                        className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-red-600 transition-colors resize-none h-24"
                    />
                    <button type="submit" disabled={isPosting || !comment.trim()} className="absolute bottom-4 right-4 bg-red-600 hover:bg-red-700 p-2 rounded-lg transition-colors">
                        <Send size={18} />
                    </button>
                </form>
            ) : (
                <div className="p-4 bg-white/5 border border-dashed border-white/20 rounded-xl text-center text-gray-400">Please log in to leave a review.</div>
            )}

            {/* List Section */}
            <div className="space-y-4">
                {isLoadingReviews ? (
                    <p className="text-gray-500 animate-pulse">Loading comments...</p>
                ) : allReviews?.map((rev) => (
                    <div key={rev._id} className="group flex justify-between items-start bg-white/5 p-4 rounded-xl border border-white/5 hover:border-white/20 transition-all">
                        <div className="flex gap-4 w-full">
                            <div className="flex-shrink-0">
                                <div className="w-10 h-10 rounded-full border-2 border-gray-800 overflow-hidden bg-gray-800">
                                    <img src={getAvatarUrl(rev.user)} alt="user" className="w-full h-full object-cover" />
                                </div>
                            </div>

                            <div className="flex-1 space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold text-gray-200">{rev.user?.username || 'Anonymous'}</span>
                                    <span className="text-[10px] text-gray-500">{new Date(rev.createdAt).toLocaleDateString()}</span>
                                </div>

                                {editId === rev._id ? (
                                    <div className="mt-2 flex flex-col gap-2">
                                        <textarea 
                                            value={editContent}
                                            onChange={(e) => setEditContent(e.target.value)}
                                            className="w-full bg-black/40 border border-red-600/30 rounded-lg p-2 text-sm text-white focus:outline-none"
                                        />
                                        <div className="flex gap-2">
                                            <button onClick={() => handleUpdate(rev._id)} className="flex items-center gap-1 text-xs text-green-500 hover:text-green-400">
                                                <Check size={14} /> Save
                                            </button>
                                            <button onClick={() => setEditId(null)} className="flex items-center gap-1 text-xs text-gray-400 hover:text-white">
                                                <X size={14} /> Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-gray-300 text-sm leading-relaxed">{rev.comment}</p>
                                )}
                            </div>
                        </div>
                        
                        {/* Actions: Restricted to Owner */}
                        {userInfo && rev.user?._id === userInfo._id && editId !== rev._id && (
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => startEditing(rev)} className="text-gray-500 hover:text-blue-400 p-1">
                                    <Edit3 size={16} />
                                </button>
                                <button onClick={() => handleDelete(rev._id)} className="text-gray-500 hover:text-red-500 p-1">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Comments;