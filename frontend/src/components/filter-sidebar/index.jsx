import React, { useState } from 'react';
import { 
    Paper, Stack, Button, TextField, FormControl, FormControlLabel, FormLabel, 
    Radio, RadioGroup, InputAdornment, MenuItem, Divider, Typography, IconButton 
} from '@mui/material';
import FilterAltIcon from '@mui/icons-material/FilterAlt';

// Component: FilterSidebar
const FilterSidebar = ({ filterState, setFilterState }) => {
    // Sử dụng giá trị từ filterState nếu có, hoặc mặc định là 'all'
    const [price, setPrice] = useState(filterState.price || 'all');
    const [age, setAge] = useState(filterState.age || 'all');
    
    // Hàm áp dụng tất cả các bộ lọc Radio
    const handleFilter = () => {
        setFilterState(prevFilterState => ({ 
            ...prevFilterState,
            price: price, 
            age: age, 
            // Giữ lại các filter khác (keyword, province...) đã được set
        }));
    };
    
    // Hàm Đặt lại các bộ lọc Radio
    const handleReset = () => {
        setPrice('all');
        setAge('all');
        setFilterState(prevFilterState => {
            const newState = { ...prevFilterState };
            delete newState.price;
            delete newState.age;
            return newState;
        });
    };

    return (
        <Paper
            sx={{
                display: "flex",
                flexDirection: "column",
                p: 3,
                borderRadius: 3,
                boxShadow: "0 8px 25px rgba(15,23,42,0.08)",
            }}
        >
            <Stack spacing={2} sx={{ flex: 1 }}>
                
                <Typography variant="subtitle1" fontWeight={700}>
                    Bộ lọc chi tiết
                </Typography>
                
                <Divider sx={{ borderColor: "#e5e7eb" }} />

                {/* Khoảng giá */}
                <FormControl component="fieldset">
                    <FormLabel component="legend" sx={{ fontSize: "0.875rem", fontWeight: 600, color: "#374151", mb: 1 }}>
                        Khoảng giá
                    </FormLabel>
                    <RadioGroup value={price} onChange={(e) => setPrice(e.target.value)}>
                        <FormControlLabel value="all" control={<Radio size="small" />} label="Tất cả" sx={{ "& .MuiFormControlLabel-label": { fontSize: "0.875rem" } }} />
                        <FormControlLabel value="free" control={<Radio size="small" />} label="Miễn phí" sx={{ "& .MuiFormControlLabel-label": { fontSize: "0.875rem" } }} />
                        <FormControlLabel value="0-200k" control={<Radio size="small" />} label="0đ - 200.000đ" sx={{ "& .MuiFormControlLabel-label": { fontSize: "0.875rem" } }} />
                        <FormControlLabel value="200k-500k" control={<Radio size="small" />} label="200.000đ - 500.000đ" sx={{ "& .MuiFormControlLabel-label": { fontSize: "0.875rem" } }} />
                        <FormControlLabel value="500k-1m" control={<Radio size="small" />} label="500.000đ - 1.000.000đ" sx={{ "& .MuiFormControlLabel-label": { fontSize: "0.875rem" } }} />
                        <FormControlLabel value="1m+" control={<Radio size="small" />} label="Trên 1.000.000đ" sx={{ "& .MuiFormControlLabel-label": { fontSize: "0.875rem" } }} />
                    </RadioGroup>
                </FormControl>

                {/* Độ tuổi */}
                <FormControl component="fieldset">
                    <FormLabel component="legend" sx={{ fontSize: "0.875rem", fontWeight: 600, color: "#374151", mb: 1 }}>
                        Độ tuổi
                    </FormLabel>
                    <RadioGroup value={age} onChange={(e) => setAge(e.target.value)}>
                        <FormControlLabel value="all" control={<Radio size="small" />} label="Tất cả" sx={{ "& .MuiFormControlLabel-label": { fontSize: "0.875rem" } }} />
                        <FormControlLabel value="0-5" control={<Radio size="small" />} label="0 - 5 tuổi" sx={{ "& .MuiFormControlLabel-label": { fontSize: "0.875rem" } }} />
                        <FormControlLabel value="5-12" control={<Radio size="small" />} label="5 - 12 tuổi" sx={{ "& .MuiFormControlLabel-label": { fontSize: "0.875rem" } }} />
                        <FormControlLabel value="12-18" control={<Radio size="small" />} label="12 - 18 tuổi" sx={{ "& .MuiFormControlLabel-label": { fontSize: "0.875rem" } }} />
                        <FormControlLabel value="18+" control={<Radio size="small" />} label="Trên 18 tuổi" sx={{ "& .MuiFormControlLabel-label": { fontSize: "0.875rem" } }} />
                    </RadioGroup>
                </FormControl>

                {/* Nút Lọc và Đặt lại */}
                <Stack direction="row" spacing={2} justifyContent="space-between" sx={{ pt: 1 }}>
                    <Button
                        variant="contained"
                        startIcon={<FilterAltIcon />}
                        onClick={handleFilter}
                        sx={{ textTransform: "none", borderRadius: 2 }}
                    >
                        Lọc
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={handleReset}
                        sx={{ textTransform: "none", color: "#6b4c00" }}
                    >
                        Đặt lại
                    </Button>
                </Stack>
            </Stack>
        </Paper>
    );
};

export default FilterSidebar;
