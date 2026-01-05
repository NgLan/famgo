import { useState, useEffect, useRef } from 'react';
import './schedule.create.css';
import { toast } from 'react-toastify';
import {
  Calendar,
  Image as ImageIcon,
  Tag as TagIcon,
  Clock,
  MapPin,
  Trash2,
  GripVertical,
  Plus,
  Search,
  X,
  ChevronUp,
  ChevronDown,
  MoreVertical,
  Car,
  Bike,
  FootprintsIcon as Walk,
  Bus,
  Banknote
} from 'lucide-react';

const CLOUDINARY_UPLOAD_PRESET = 'itss1_upload'; // Thay bằng preset của bạn
const CLOUDINARY_CLOUD_NAME = 'dxudvl25z'; // Thay bằng cloud name của bạn

const ScheduleCreate = () => {
  const [formData, setFormData] = useState({
    title: '',
    note: '',
    date: '',
    coverImage: null,
    tags: [],
    items: []
  });

  const [currentTag, setCurrentTag] = useState('');
  const [activeMenu, setActiveMenu] = useState(null);
  const [draggedItem, setDraggedItem] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Place search states
  const [placeSearchResults, setPlaceSearchResults] = useState({});
  const [placeSearchLoading, setPlaceSearchLoading] = useState({});
  const [activePlaceDropdown, setActivePlaceDropdown] = useState(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.place-search-wrapper')) {
        setActivePlaceDropdown(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Upload image to Cloudinary
  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      throw error;
    }
  };

  // Search places by keyword
  const searchPlaces = async (keyword, itemId) => {
    if (!keyword.trim()) {
      setPlaceSearchResults(prev => ({ ...prev, [itemId]: [] }));
      return;
    }

    setPlaceSearchLoading(prev => ({ ...prev, [itemId]: true }));

    try {
      const response = await fetch(
        `http://localhost:3000/api/places/search?keyword=${encodeURIComponent(keyword)}`
      );

      if (!response.ok) {
        throw new Error('Failed to search places');
      }

      const result = await response.json();
      setPlaceSearchResults(prev => ({
        ...prev,
        [itemId]: result.data || []
      }));
    } catch (error) {
      console.error('Error searching places:', error);
      setPlaceSearchResults(prev => ({ ...prev, [itemId]: [] }));
    } finally {
      setPlaceSearchLoading(prev => ({ ...prev, [itemId]: false }));
    }
  };

  // Handle place search input change with debounce
  const handlePlaceSearchChange = (e, itemId) => {
    const value = e.target.value;
    updateTimelineItem(itemId, 'placeSearchKeyword', value);
    updateTimelineItem(itemId, 'selectedPlace', null);
    updateTimelineItem(itemId, 'placeId', null);
    setActivePlaceDropdown(itemId);

    // Debounce search
    clearTimeout(window.placeSearchTimeout);
    window.placeSearchTimeout = setTimeout(() => {
      searchPlaces(value, itemId);
    }, 300);
  };

  // Handle place selection
  const handlePlaceSelect = (itemId, place) => {
    updateTimelineItem(itemId, 'selectedPlace', place);
    updateTimelineItem(itemId, 'placeId', place._id);
    updateTimelineItem(itemId, 'placeSearchKeyword', place.name);
    setActivePlaceDropdown(null);
    setPlaceSearchResults(prev => ({ ...prev, [itemId]: [] }));
  };

  // Handle drag start
  const handleDragStart = (e, id) => {
    setDraggedItem(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  // Handle drag over
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  // Handle drop
  const handleDrop = (e, targetId) => {
    e.preventDefault();

    if (draggedItem === targetId) return;

    const draggedIndex = formData.items.findIndex(item => item.id === draggedItem);
    const targetIndex = formData.items.findIndex(item => item.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newItems = [...formData.items];
    const [removed] = newItems.splice(draggedIndex, 1);
    newItems.splice(targetIndex, 0, removed);

    setFormData({ ...formData, items: newItems });
    setDraggedItem(null);
  };

  // Handle drag end
  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  // Move timeline item up or down
  const moveTimelineItem = (id, direction) => {
    const index = formData.items.findIndex(item => item.id === id);
    if (index === -1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= formData.items.length) return;

    const newItems = [...formData.items];
    [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];
    setFormData({ ...formData, items: newItems });
  };

  // Add timeline item
  const addTimelineItem = () => {
    const newItem = {
      id: Date.now(),
      customPlaceName: '',
      placeSearchKeyword: '',
      selectedPlace: null,
      placeId: null,
      startTime: '',
      endTime: '',
      image: null,
      caution: '',
      note: '',
      transport: '車',
      priceMin: '',
      priceMax: ''
    };
    setFormData({ ...formData, items: [...formData.items, newItem] });
  };

  // Remove timeline item
  const removeTimelineItem = (id) => {
    setFormData({
      ...formData,
      items: formData.items.filter(item => item.id !== id)
    });
  };

  // Update timeline item
  const updateTimelineItem = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    }));
  };

  // Handle image upload
  const handleImageUpload = async (e, id = null) => {
    const file = e.target.files[0];
    if (file) {
      try {
        setUploading(true);

        // Upload to Cloudinary
        const imageUrl = await uploadToCloudinary(file);

        if (id) {
          updateTimelineItem(id, 'image', imageUrl);
        } else {
          setFormData({ ...formData, coverImage: imageUrl });
        }
      } catch (error) {
        toast.error('画像のアップロードに失敗しました！');
        console.error('Image upload error:', error);
      } finally {
        setUploading(false);
      }
    }
  };

  // Add tag
  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, currentTag.trim()] });
      setCurrentTag('');
    }
  };

  // Remove tag
  const removeTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  // Handle submit
  const handleSubmit = async () => {
    try {
      // Validate form
      if (!formData.title.trim()) {
        toast.error('タイトルを入力してください');
        return;
      }

      if (formData.items.length === 0) {
        toast.error('少なくとも1つの項目を追加してください');
        return;
      }

      // Validate timeline items
      for (let i = 0; i < formData.items.length; i++) {
        const item = formData.items[i];

        // Check if start time and end time are filled
        if (!item.startTime || !item.endTime) {
          toast.error(`項目 ${i + 1}: 開始時間と終了時間を入力してください`);
          return;
        }

        // Check if end time is after start time
        if (item.startTime >= item.endTime) {
          toast.error(`項目 ${i + 1}: 終了時間は開始時間より後でなければなりません`);
          return;
        }

        // Check if place is selected or custom name is provided
        if (!item.placeId && !item.customPlaceName.trim()) {
          toast.error(`項目 ${i + 1}: 場所を選択するか、カスタム名を入力してください`);
          return;
        }

        // Check if next item's start time is after current item's end time
        if (i < formData.items.length - 1) {
          const nextItem = formData.items[i + 1];
          if (nextItem.startTime && nextItem.startTime < item.endTime) {
            toast.error(`項目 ${i + 2}: 開始時間は前の項目の終了時間（${item.endTime}）以降でなければなりません`);
            return;
          }
        }
      }

      // Check if all items are within 24 hours (one day)
      if (formData.items.length > 0) {
        const firstStart = formData.items[0].startTime;
        const lastEnd = formData.items[formData.items.length - 1].endTime;

        if (firstStart && lastEnd) {
          const [firstHour, firstMin] = firstStart.split(':').map(Number);
          const [lastHour, lastMin] = lastEnd.split(':').map(Number);

          const firstMinutes = firstHour * 60 + firstMin;
          const lastMinutes = lastHour * 60 + lastMin;

          if (lastMinutes < firstMinutes || lastMinutes - firstMinutes > 24 * 60) {
            toast.error('一日プランは24時間以内でなければなりません');
            return;
          }
        }
      }

      setUploading(true);

      // Prepare data for API
      const dayPlanData = {
        title: formData.title,
        note: formData.note,
        date: formData.date ? new Date(formData.date).toISOString() : null,
        cover_image: formData.coverImage || '',
        tags: formData.tags,
        items: formData.items.map((item, index) => {
          return {
            place_id: item.placeId || null, // Lấy từ selectedPlace
            custom_place_name: item.customPlaceName,
            start_time: item.startTime,
            end_time: item.endTime,
            image: item.image || '',
            note: item.caution, // Miêu tả cho item
            caution: item.note, // Điểm chú ý cho item
            transport: item.transport,
            price_range: {
              min: parseInt(item.priceMin) || 0,
              max: parseInt(item.priceMax) || 0
            },
            sort_order: index + 1
          };
        })
      };

      console.log('Submitting:', dayPlanData);

      // Call API
      const response = await fetch('http://localhost:3000/api/day-plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // クッキーを送信
        body: JSON.stringify(dayPlanData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'エラーが発生しました');
      }

      toast.success('プラン作成成功！');
      console.log('Created day plan:', result.data);

      // Reset form
      setFormData({
        title: '',
        note: '',
        date: '',
        coverImage: null,
        tags: [],
        items: []
      });

    } catch (error) {
      console.error('Error:', error);
      toast.error(error.message || 'エラーが発生しました！');
    } finally {
      setUploading(false);
    }
  };

  // Handle save draft
  const handleSaveDraft = () => {
    console.log('Saving draft:', formData);
    toast.info('下書き保存しました！');
  };

  return (
    <div className="schedule-create-container">
      <div className="schedule-create-content">
        {/* Left Column */}
        <div className="left-column">
          {/* Title */}
          <h1 className="page-title">一日プラン作成</h1>

          {/* Title Input */}
          <div className="form-group">
            <label className="form-label">タイトル</label>
            <input
              type="text"
              className="form-input"
              placeholder="タイトルを入力"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">プランの注記</label>
            <textarea
              className="form-textarea"
              placeholder="注記を入力してください (オプション)"
              rows="4"
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
            />
          </div>

          {/* Timeline */}
          <div className="timeline-section">
            <div className="timeline-header">
              <label className="form-label">タイムライン</label>
              <p className="timeline-note">
                <Clock size={16} className="inline-icon" style={{ color: 'white' }} />
                各項目の時間は、その場所での滞在時間です（移動時間は含まれません）
              </p>
            </div>

            {formData.items.map((item, index) => (
              <div
                key={item.id}
                className={`timeline-item ${draggedItem === item.id ? 'dragging' : ''}`}
                draggable={true}
                onDragStart={(e) => handleDragStart(e, item.id)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, item.id)}
                onDragEnd={handleDragEnd}
              >
                <div className="timeline-item-header">
                  <div className="time-inputs">
                    <div className="time-input-group">
                      <Clock size={16} className="time-icon" />
                      <input
                        type="time"
                        className="time-input"
                        value={item.startTime}
                        onChange={(e) => updateTimelineItem(item.id, 'startTime', e.target.value)}
                        step="60"
                      />
                      {item.startTime && (
                        <span className="time-period">
                          {parseInt(item.startTime.split(':')[0]) >= 12 ? 'PM' : 'AM'}
                        </span>
                      )}
                    </div>
                    <span className="time-separator">-</span>
                    <div className="time-input-group">
                      <Clock size={16} className="time-icon" />
                      <input
                        type="time"
                        className="time-input"
                        value={item.endTime}
                        onChange={(e) => updateTimelineItem(item.id, 'endTime', e.target.value)}
                        step="60"
                      />
                      {item.endTime && (
                        <span className="time-period">
                          {parseInt(item.endTime.split(':')[0]) >= 12 ? 'PM' : 'AM'}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="timeline-actions">
                    <div className="menu-wrapper">
                      <button
                        className="btn-icon"
                        title="メニュー"
                        onClick={() => setActiveMenu(activeMenu === item.id ? null : item.id)}
                      >
                        <MoreVertical size={20} />
                      </button>
                      {activeMenu === item.id && (
                        <div className="dropdown-menu">
                          <button
                            className="menu-item"
                            onClick={() => { moveTimelineItem(item.id, 'up'); setActiveMenu(null); }}
                            disabled={index === 0}
                          >
                            <ChevronUp size={16} /> 上に移動
                          </button>
                          <button
                            className="menu-item"
                            onClick={() => { moveTimelineItem(item.id, 'down'); setActiveMenu(null); }}
                            disabled={index === formData.items.length - 1}
                          >
                            <ChevronDown size={16} /> 下に移動
                          </button>
                        </div>
                      )}
                    </div>
                    <button
                      className="btn-icon btn-delete"
                      onClick={() => removeTimelineItem(item.id)}
                      title="削除"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>                <div className="timeline-item-content">
                  {/* Place Link and Name Inputs */}
                  <div className="place-info-inputs">
                    <input
                      type="text"
                      className="place-name-input"
                      placeholder="カスタム名（オプション）"
                      value={item.customPlaceName}
                      onChange={(e) => updateTimelineItem(item.id, 'customPlaceName', e.target.value)}
                    />
                    <div className="place-search-wrapper">
                      <input
                        type="text"
                        className="place-search-input"
                        placeholder="場所を検索..."
                        value={item.placeSearchKeyword || ''}
                        onChange={(e) => handlePlaceSearchChange(e, item.id)}
                        onFocus={() => setActivePlaceDropdown(item.id)}
                      />
                      {item.selectedPlace && (
                        <span className="selected-place-badge">
                          ✓ {item.selectedPlace.name}
                          <button
                            type="button"
                            className="clear-place-btn"
                            onClick={() => {
                              updateTimelineItem(item.id, 'selectedPlace', null);
                              updateTimelineItem(item.id, 'placeId', null);
                              updateTimelineItem(item.id, 'placeSearchKeyword', '');
                            }}
                          >
                            <X size={14} />
                          </button>
                        </span>
                      )}
                      {activePlaceDropdown === item.id && (
                        <div className="place-search-dropdown">
                          {placeSearchLoading[item.id] ? (
                            <div className="dropdown-loading">検索中...</div>
                          ) : placeSearchResults[item.id]?.length > 0 ? (
                            placeSearchResults[item.id].map((place) => (
                              <div
                                key={place._id}
                                className="place-search-item"
                                onClick={() => handlePlaceSelect(item.id, place)}
                              >
                                <div className="place-item-info">
                                  <span className="place-item-name">{place.name}</span>
                                  {place.address && (
                                    <span className="place-item-address">{place.address}</span>
                                  )}
                                </div>
                                {place.thumbnail && (
                                  <img
                                    src={place.thumbnail}
                                    alt={place.name}
                                    className="place-item-thumb"
                                  />
                                )}
                              </div>
                            ))
                          ) : item.placeSearchKeyword?.trim() ? (
                            <div className="dropdown-empty">結果が見つかりません</div>
                          ) : null}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="timeline-item-body">
                    {/* Image Upload */}
                    <div className="image-upload-box">
                      {item.image ? (
                        <img src={item.image} alt="Preview" className="preview-image" />
                      ) : (
                        <div className="image-placeholder">
                          <ImageIcon size={40} className="placeholder-icon" />
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, item.id)}
                        className="file-input"
                        id={`file-${item.id}`}
                      />
                      <label htmlFor={`file-${item.id}`} className="file-label">
                        <ImageIcon size={16} className="inline-icon-btn" />
                        画像を選択
                      </label>
                    </div>

                    {/* Description */}
                    <textarea
                      className="item-description"
                      placeholder="場所についての説明..."
                      rows="6"
                      value={item.caution}
                      onChange={(e) => updateTimelineItem(item.id, 'caution', e.target.value)}
                    />
                  </div>

                  {/* Bottom Info */}
                  <div className="timeline-item-footer">
                    {/* Transport */}
                    <div className="footer-item">
                      <label className="footer-label">
                        <Car size={16} className="inline-icon" style={{ color: '#5BC0EB' }} />
                        移動手段
                      </label>
                      <div className="select-with-icon">
                        {item.transport === '車' && <Car size={18} className="select-icon" style={{ color: '#5BC0EB' }} />}
                        {item.transport === 'バイク' && <Bike size={18} className="select-icon" style={{ color: '#FF90E8' }} />}
                        {item.transport === '徒歩' && <Walk size={18} className="select-icon" style={{ color: '#FDE24F' }} />}
                        {item.transport === 'バス' && <Bus size={18} className="select-icon" style={{ color: '#9B59B6' }} />}
                        <select
                          className="footer-select with-icon-select"
                          value={item.transport}
                          onChange={(e) => updateTimelineItem(item.id, 'transport', e.target.value)}
                        >
                          <option value="車">🚗 車（自動車）</option>
                          <option value="バイク">🏍️ バイク</option>
                          <option value="徒歩">🚶 徒歩</option>
                          <option value="バス">🚌 バス</option>
                        </select>
                      </div>
                    </div>

                    {/* Price Range */}
                    <div className="footer-item footer-item-price">
                      <label className="footer-label">
                        <Banknote size={16} className="inline-icon" style={{ color: '#27ae60' }} />
                        金額
                      </label>
                      <div className="price-range-inputs">
                        <input
                          type="number"
                          className="footer-input price-input"
                          placeholder="最小"
                          value={item.priceMin}
                          onChange={(e) => updateTimelineItem(item.id, 'priceMin', e.target.value)}
                        />
                        <span className="price-separator">~</span>
                        <input
                          type="number"
                          className="footer-input price-input"
                          placeholder="最大"
                          value={item.priceMax}
                          onChange={(e) => updateTimelineItem(item.id, 'priceMax', e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Note/Caution Point */}
                    <div className="footer-item">
                      <label className="footer-label">注意点</label>
                      <input
                        type="text"
                        className="footer-input"
                        placeholder="注意点を入力"
                        value={item.note}
                        onChange={(e) => updateTimelineItem(item.id, 'note', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Add Timeline Button */}
            <button className="btn-add-timeline" onClick={addTimelineItem}>
              <Plus size={20} className="inline-icon-btn" />
              タイムライン項目を追加
            </button>
          </div>
        </div>

        {/* Right Column */}
        <div className="right-column">
          {/* Action Buttons */}
          <div className="action-buttons">
            <button
              className="btn-secondary"
              onClick={handleSaveDraft}
              disabled={uploading}
            >
              {uploading ? '処理中...' : '下書き保存'}
            </button>
            <button
              className="btn-primary"
              onClick={handleSubmit}
              disabled={uploading}
            >
              {uploading ? '処理中...' : '公開'}
            </button>
          </div>

          {/* Date Picker */}
          <div className="form-group">
            <label className="form-label">
              <Calendar size={16} className="inline-icon" style={{ color: '#FF90E8' }} />
              実施日
            </label>
            <input
              type="date"
              className="form-input"
              value={formData.date}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => {
                const selectedDate = new Date(e.target.value);
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                if (selectedDate < today) {
                  toast.warning('過去の日付は選択できません');
                  return;
                }
                setFormData({ ...formData, date: e.target.value });
              }}
            />
          </div>

          {/* Cover Image */}
          <div className="form-group">
            <label className="form-label">
              <ImageIcon size={16} className="inline-icon" style={{ color: '#5BC0EB' }} />
              カバー画像
            </label>
            <div className="cover-image-upload">
              {formData.coverImage ? (
                <img src={formData.coverImage} alt="Cover" className="cover-preview" />
              ) : (
                <div className="cover-placeholder">
                  <ImageIcon size={48} className="placeholder-icon" />
                  <span className="placeholder-text">画像をアップロード</span>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e)}
                className="file-input"
                id="cover-file"
              />
              <label htmlFor="cover-file" className="file-label-cover">
                <ImageIcon size={16} className="inline-icon-btn" />
                画像を選択
              </label>
            </div>
          </div>

          {/* Tags */}
          <div className="form-group">
            <label className="form-label">
              <TagIcon size={16} className="inline-icon" style={{ color: '#FDE24F' }} />
              タグ
            </label>
            <div className="tags-input-wrapper">
              <input
                type="text"
                className="tags-input"
                placeholder="タグを追加 (例: 観光、食事...)"
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <button className="btn-add-tag" onClick={addTag}>
                <Plus size={16} className="inline-icon-btn" />
                追加
              </button>
            </div>
            <div className="tags-list">
              {formData.tags.map((tag, index) => (
                <span key={index} className="tag">
                  <TagIcon size={12} className="inline-icon" style={{ color: 'white' }} />
                  {tag}
                  <button className="tag-remove" onClick={() => removeTag(tag)}>
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleCreate;
