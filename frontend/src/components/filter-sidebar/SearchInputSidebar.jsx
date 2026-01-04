import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';

const SearchInputSidebar = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams(); 
    
    const currentUrlKeyword = searchParams.get('keyword') || ''; 
    const [localKeyword, setLocalKeyword] = useState(currentUrlKeyword); 

    useEffect(() => {
        setLocalKeyword(currentUrlKeyword);
    }, [currentUrlKeyword]);

    const handleSearch = () => {
        const keywordToSearch = localKeyword.trim();
        const newSearchParams = new URLSearchParams(searchParams);

        if (keywordToSearch) {
            newSearchParams.set('keyword', keywordToSearch);
        } else {
            newSearchParams.delete('keyword');
        }

        navigate({ search: newSearchParams.toString() }, { replace: true });
    };
    
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSearch();
        }
    };

    return (
        <div className="bg-white border-2 border-black rounded-2xl shadow-[6px_6px_0_0_#000] p-4">
            <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-[#FDE24F] border-2 border-black rounded-lg flex items-center justify-center">
                    <Search size={18} strokeWidth={2.5} />
                </div>
                <h2 className="text-xl font-black">検索</h2>
            </div>
            
            <div className="relative">
                <input
                    type="text"
                    placeholder="スポット名を入力"
                    value={localKeyword}
                    onChange={(e) => setLocalKeyword(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full px-4 py-2.5 border-2 border-black rounded-lg font-bold bg-white shadow-[2px_2px_0_0_#000] focus:outline-none focus:shadow-[4px_4px_0_0_#000] transition-all pr-12"
                />
                <button
                    onClick={handleSearch}
                    disabled={!localKeyword.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-[#5BC0EB] border-2 border-black rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#4AB0DB] transition-colors"
                >
                    <Search size={18} className="text-white" strokeWidth={2.5} />
                </button>
            </div>
        </div>
    );
};

export default React.memo(SearchInputSidebar);
