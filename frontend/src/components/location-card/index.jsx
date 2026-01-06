// import React, { useState } from "react";
// import {
//   Box,
//   Button,
//   Card,
//   CardContent,
//   CardMedia,
//   Chip,
//   IconButton,
//   Stack,
//   Typography,
// } from "@mui/material";
// import WarningAmberIcon from "@mui/icons-material/WarningAmber";
// import AccessTimeIcon from "@mui/icons-material/AccessTime";
// import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
// import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
// import ExpandLessIcon from "@mui/icons-material/ExpandLess";

// // Component con để xử lý văn bản dài/ngắn
// const ExpandableText = ({ text, limit = 150, color = "text.secondary", isWarning = false }) => {
//   const [isExpanded, setIsExpanded] = useState(false);

//   // Nếu không có nội dung
//   if (!text) return null;

//   // Nếu nội dung ngắn hơn giới hạn -> Hiện hết, không cần nút bấm
//   if (text.length <= limit) {
//     return (
//       <Typography 
//         variant="body2" 
//         color={color} 
//         sx={{ whiteSpace: "pre-line", mt: 1 }}
//       >
//         {text}
//       </Typography>
//     );
//   }

//   // Nếu nội dung dài -> Cắt dòng và hiện nút
//   return (
//     <Box>
//       <Typography
//         variant="body2"
//         color={color}
//         sx={{
//           mt: 1,
//           whiteSpace: "pre-line",
//           // Logic CSS để cắt dòng (Line Clamp)
//           display: isExpanded ? "block" : "-webkit-box",
//           overflow: "hidden",
//           WebkitBoxOrient: "vertical",
//           WebkitLineClamp: isExpanded ? "none" : 3, // Giới hạn 3 dòng khi chưa mở
//         }}
//       >
//         {text}
//       </Typography>
      
//       <Button
//         size="small"
//         onClick={() => setIsExpanded(!isExpanded)}
//         sx={{ 
//           textTransform: "none", 
//           p: 0, 
//           mt: 0.5, 
//           color: isWarning ? "warning.main" : "primary.main",
//           minWidth: "auto",
//           "&:hover": { bgcolor: "transparent", textDecoration: "underline" }
//         }}
//         endIcon={isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
//       >
//         {isExpanded ? "Thu gọn" : "Xem thêm"}
//       </Button>
//     </Box>
//   );
// };

// const TimelineCard = ({ 
//   location, 
//   navigate,
//   containerId 
// }) => {
  
//   const timeLabel = location.startTime
//     ? `${location.startTime}${location.endTime ? ` - ${location.endTime}` : ''}`
//     : location.time || "Giờ chưa cập nhật";

//   return (
//     <Card 
//       id={containerId} 
//       sx={{ 
//         mb: 2, 
//         boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
//         scrollMarginTop: "20px" 
//       }}
//     >
//       {/* Phần Ảnh bìa */}
//       <Box sx={{ position: "relative" }}>
//         <CardMedia
//           component="img"
//           height="220"
//           image={location.image}
//           alt={location.name}
//           sx={{ objectFit: "cover", width: "100%" }}
//         />
//         {location.hasWarning && (
//           <Chip
//             icon={<WarningAmberIcon />}
//             label="注意"
//             size="small"
//             color="warning"
//             sx={{ position: "absolute", top: 10, right: 10, bgcolor: "rgba(237, 108, 2, 0.9)" }}
//           />
//         )}
//       </Box>

//       <CardContent>
//         <Stack spacing={1.5}>
//           {/* Tên địa điểm */}
//           <Typography variant="h6" fontWeight={700} sx={{ fontSize: "1.1rem" }}>
//             {location.name}
//           </Typography>

//           {/* Chips thông tin */}
//           <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
//             <Chip
//               icon={<AccessTimeIcon fontSize="small" />}
//               label={timeLabel}
//               size="small"
//               variant="outlined"
//               sx={{ borderColor: "#ddd" }}
//             />
//             <Chip
//               icon={<AttachMoneyIcon fontSize="small" />}
//               label={location.estimatedCost}
//               size="small"
//               variant="outlined"
//               color="success"
//             />
//           </Stack>

//           {/* === PHẦN MÔ TẢ (DESCRIPTION) === */}
//           <Box sx={{ mt: 1 }}>
//             <Typography variant="subtitle2" fontWeight={700} color="text.primary">
//               説明
//             </Typography>
//             {/* Sử dụng component tự động co giãn */}
//             <ExpandableText 
//               text={location.description || "説明はありません"} 
//               limit={150} // Ngưỡng ký tự để hiện nút Xem thêm
//             />
//           </Box>

//           {/* === PHẦN LƯU Ý (NOTE) === */}
//           {location.note && (
//             <Box sx={{ 
//               mt: 1, 
//               p: 1.5, 
//               bgcolor: "#fff3e0", 
//               borderRadius: 2,
//               border: "1px dashed #ed6c02"
//             }}>
//               <Stack direction="row" alignItems="center" spacing={1}>
//                 <WarningAmberIcon fontSize="small" color="warning" />
//                 <Typography variant="subtitle2" fontWeight={700} color="warning.main">
//                   注意事項
//                 </Typography>
//               </Stack>
              
//               <ExpandableText 
//                 text={location.note} 
//                 limit={100} 
//                 color="warning.dark"
//                 isWarning={true}
//               />
//             </Box>
//           )}

//           {/* Nút xem chi tiết */}
//           <Button
//             variant="contained"
//             size="small"
//             sx={{ alignSelf: "flex-start", textTransform: "none", mt: 1 }}
//             onClick={() => location.placeId && navigate(`/places/${location.placeId}`)}
//           >
//             詳細を見る
//           </Button>
//         </Stack>
//       </CardContent>
//     </Card>
//   );
// };

// export default TimelineCard;
import React, { useState } from "react";
import {
  Collapse,
  IconButton,
} from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

// Bảng màu config
const COLORS = {
  bg: '#FFFBF5',
  blue: '#5BC0EB',
  pink: '#FF90E8',
  yellow: '#FDE24F',
};

// Component con để xử lý văn bản dài/ngắn
const ExpandableText = ({ text, limit = 150, color = "text-gray-600", isWarning = false }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!text) return null;

  if (text.length <= limit) {
    return (
      <p className={`text-sm mt-2 whitespace-pre-line ${color}`}>
        {text}
      </p>
    );
  }

  return (
    <div className="mt-2">
      <p
        className={`text-sm whitespace-pre-line ${color} ${isExpanded ? '' : 'line-clamp-3'}`}
      >
        {text}
      </p>
      
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`text-xs font-bold mt-1 flex items-center gap-1 hover:underline ${isWarning ? 'text-orange-600' : 'text-[#5BC0EB]'}`}
      >
        {isExpanded ? "Thu gọn" : "Xem thêm"}
        {isExpanded ? <ExpandLessIcon fontSize="small"/> : <ExpandMoreIcon fontSize="small"/>}
      </button>
    </div>
  );
};

const TimelineCard = ({ 
  location, 
  navigate,
  containerId 
}) => {
  
  const timeLabel = location.startTime
    ? `${location.startTime}${location.endTime ? ` - ${location.endTime}` : ''}`
    : location.time || "Giờ chưa cập nhật";

  return (
    <div 
      id={containerId} 
      className="mb-6 bg-white border-2 border-black rounded-xl shadow-[4px_4px_0_0_#000] overflow-hidden scroll-mt-24 transition-transform hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#000]"
    >
      {/* Phần Ảnh bìa */}
      <div className="relative border-b-2 border-black">
        <img
          src={location.image}
          alt={location.name}
          className="w-full h-[220px] object-cover"
        />
        {location.hasWarning && (
          <div className="absolute top-3 right-3 bg-[#FDE24F] border-2 border-black px-3 py-1 rounded-full flex items-center gap-1 shadow-sm z-10">
            <WarningAmberIcon sx={{ fontSize: 16 }} />
            <span className="text-xs font-bold">注意</span>
          </div>
        )}
      </div>

      <div className="p-5">
        <div className="flex flex-col gap-4">
          {/* Tên địa điểm */}
          <h3 className="text-xl font-black text-black leading-tight">
            {location.name}
          </h3>

          {/* Chips thông tin */}
          <div className="flex flex-wrap gap-2">
            <div className="inline-flex items-center gap-1 px-3 py-1 bg-white border-2 border-black rounded-lg text-sm font-bold shadow-[2px_2px_0_0_#ccc]">
              <AccessTimeIcon fontSize="small" className="text-gray-600" />
              <span>{timeLabel}</span>
            </div>
            <div className="inline-flex items-center gap-1 px-3 py-1 bg-[#E8F5E9] border-2 border-black rounded-lg text-sm font-bold shadow-[2px_2px_0_0_#ccc] text-green-700">
              <AttachMoneyIcon fontSize="small" />
              <span>{location.estimatedCost}</span>
            </div>
          </div>

          {/* === PHẦN MÔ TẢ (DESCRIPTION) === */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <span className="text-xs font-black uppercase text-gray-500">説明</span>
            <ExpandableText 
              text={location.description || "説明はありません"} 
              limit={150} 
            />
          </div>

          {/* === PHẦN LƯU Ý (NOTE) === */}
          {location.note && (
            <div className="bg-[#FFF3E0] border-2 border-dashed border-[#ED6C02] rounded-lg p-3 relative">
              <div className="flex items-center gap-1 text-[#E65100] mb-1">
                <WarningAmberIcon fontSize="small" />
                <span className="text-xs font-black uppercase">注意事項</span>
              </div>
              <ExpandableText 
                text={location.note} 
                limit={100} 
                color="text-[#E65100]"
                isWarning={true}
              />
            </div>
          )}

          {/* Nút xem chi tiết */}
          <button
            onClick={() => location.placeId && navigate(`/places/${location.placeId}`)}
            className="w-full mt-2 py-2.5 bg-[#5BC0EB] border-2 border-black rounded-lg font-bold text-black shadow-[2px_2px_0_0_#000] hover:bg-[#4EA8D0] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2"
          >
            詳細を見る
          </button>
        </div>
      </div>
    </div>
  );
};

export default TimelineCard;