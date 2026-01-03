import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom'; // Cần import hai hook này
import { Stack, TextField, InputAdornment, IconButton, Typography, Paper } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

// KHÔNG CẦN prop setFilterState nữa
const SearchInputSidebar = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams(); 
    
    // Lấy từ khóa hiện tại từ URL (tham số 'keyword')
    const currentUrlKeyword = searchParams.get('keyword') || ''; 
    
    // State cục bộ quản lý giá trị input, được khởi tạo từ URL
    const [localKeyword, setLocalKeyword] = useState(currentUrlKeyword); 

    // Đồng bộ TextField với URL: Nếu người dùng search từ Header, 
    // URL thay đổi, và input ở Sidebar cũng phải cập nhật theo
    useEffect(() => {
        setLocalKeyword(currentUrlKeyword);
    }, [currentUrlKeyword]); // Chạy khi URL keyword thay đổi

    // Hàm này sẽ cập nhật URL thay vì cập nhật filterState
    const handleSearch = () => {
        const keywordToSearch = localKeyword.trim();
        
        // Tạo một bản sao của tham số URL hiện tại
        const newSearchParams = new URLSearchParams(searchParams);

        if (keywordToSearch) {
            // Thêm hoặc cập nhật tham số keyword
            newSearchParams.set('keyword', keywordToSearch);
        } else {
            // Nếu rỗng, xóa tham số keyword khỏi URL
            newSearchParams.delete('keyword');
        }

        // Cập nhật URL. navigate(path?new_params)
        // Chúng ta chỉ cần thay đổi query string, giữ nguyên pathname hiện tại
        navigate({ search: newSearchParams.toString() }, { replace: true });
    };
    
    // Xử lý khi nhấn Enter
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSearch();
        }
    };

    return (
        <Paper 
            sx={{ 
                p: 3, 
                borderRadius: 3, 
                boxShadow: "0 8px 25px rgba(15,23,42,0.08)" 
            }}
        >
            <Stack spacing={2}>
                <Stack direction="row" alignItems="center" spacing={1}>
                    <SearchIcon sx={{ color: "#1976d2" }} />
                    <Typography variant="subtitle1" fontWeight={700}>
                        Tìm kiếm
                    </Typography>
                </Stack>
                
                <TextField
                    size="small"
                    placeholder="Nhập tên địa điểm"
                    value={localKeyword}
                    onChange={(e) => setLocalKeyword(e.target.value)}
                    onKeyPress={handleKeyPress}
                    fullWidth
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton 
                                    size="small" 
                                    edge="end" 
                                    onClick={handleSearch} 
                                    disabled={!localKeyword.trim()} 
                                >
                                    <SearchIcon />
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />
            </Stack>
        </Paper>
    );
};

export default SearchInputSidebar;
