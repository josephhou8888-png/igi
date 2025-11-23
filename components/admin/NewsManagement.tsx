import React, { useState } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { useLocalization } from '../../hooks/useLocalization';
import { NewsPost } from '../../types';
import EditNewsModal from './EditNewsModal';

const NewsManagement: React.FC = () => {
    const { news, addNewsPost, deleteNewsPost, currentUser } = useAppContext();
    const { t } = useLocalization();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [editingPost, setEditingPost] = useState<NewsPost | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !content || !currentUser) return;
        
        const newPost: Omit<NewsPost, 'id'> = {
            title,
            content,
            author: currentUser.name,
            date: new Date().toISOString().split('T')[0],
        };

        addNewsPost(newPost);
        setTitle('');
        setContent('');
    };

    return (
        <>
            <div className="space-y-6">
                <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">{t('admin.news.createTitle')}</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300">{t('admin.news.form.title')}</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full bg-gray-700 text-white rounded-md mt-1 px-3 py-2"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300">{t('admin.news.form.content')}</label>
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                rows={4}
                                className="w-full bg-gray-700 text-white rounded-md mt-1 px-3 py-2"
                                required
                            />
                        </div>
                        <div className="text-right">
                            <button type="submit" className="px-6 py-2 rounded-md bg-brand-primary text-white font-semibold hover:bg-brand-primary/90">
                                {t('admin.news.publish')}
                            </button>
                        </div>
                    </form>
                </div>

                <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">{t('admin.news.publishedTitle')}</h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {news.map(post => (
                            <div key={post.id} className="bg-gray-700 p-4 rounded-md flex justify-between items-start">
                            <div>
                                <h4 className="font-bold text-white">{post.title}</h4>
                                <p className="text-sm text-gray-300 mt-1">{post.content}</p>
                                <p className="text-xs text-gray-500 mt-2">{t('admin.news.postMeta', { author: post.author, date: post.date })}</p>
                            </div>
                            <div className="flex space-x-3 flex-shrink-0 ml-4">
                                <button onClick={() => setEditingPost(post)} className="text-cyan-400 hover:text-cyan-300 text-xs font-semibold">
                                    {t('common.edit').toUpperCase()}
                                </button>
                                <button onClick={() => deleteNewsPost(post.id)} className="text-red-400 hover:text-red-300 text-xs font-semibold">
                                    {t('common.delete').toUpperCase()}
                                </button>
                            </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            {editingPost && <EditNewsModal post={editingPost} onClose={() => setEditingPost(null)} />}
        </>
    );
};

export default NewsManagement;