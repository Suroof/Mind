import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addTopic, loadMindMap, createNewMindMap, saveMindMap, undoAction } from '../store/mindMapSlice';
import { RootState } from '../store';
import { MindMap } from '../types/MindMap';
import {
  getAllMindMaps,
  publishMindMap
} from '../utils/cloudStorage';

interface ToolbarProps {
  onNotification: (message: string, type?: 'success' | 'info') => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ onNotification }) => {
  const dispatch = useDispatch();
  const currentMap = useSelector((state: RootState) => state.mindMap.currentMap);
  const [showSavedMaps, setShowSavedMaps] = useState(false);
  const [savedMaps, setSavedMaps] = useState<MindMap[]>([]);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isPublic, setIsPublic] = useState(true);

  useEffect(() => {
    setSavedMaps(getAllMindMaps());
  }, []);

  const handleAddNode = () => {
    dispatch(addTopic({
      title: '新节点',
      parentId: null
    }));
  };

  const handleSave = () => {
    dispatch(saveMindMap());
    onNotification('保存成功', 'success');
  };

  const handleOpen = () => {
    setSavedMaps(getAllMindMaps());
    setShowSavedMaps(true);
  };

  const handleLoadMap = (map: MindMap) => {
    dispatch(loadMindMap(map));
    setShowSavedMaps(false);
  };

  const handleNew = () => {
    dispatch(createNewMindMap());
    onNotification('已创建新的思维导图', 'success');
  };

  const handleShare = async () => {
    if (!currentMap) return;

    // 这里应该从用户系统获取，这里模拟一个用户
    const userId = 'user123';
    const userName = '测试用户';

    const success = await publishMindMap(currentMap, userId, userName, isPublic);
    if (success) {
      alert('分享成功！');
      setShowShareModal(false);
    } else {
      alert('分享失败，请重试。');
    }
  };

  const handleUndo = () => {
    dispatch(undoAction());
  };

  return (
    <div className="toolbar-container">
      <div className="toolbar">
        <div className="toolbar-left">
          <button onClick={handleNew} className="toolbar-btn">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M14 2H2v12h12V2z" stroke="currentColor" strokeWidth="2"/>
              <path d="M8 4v8M4 8h8" stroke="currentColor" strokeWidth="2"/>
            </svg>
            新建
          </button>
          <button onClick={handleSave} className="toolbar-btn">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M13 13H3V3h8l2 2v8z" stroke="currentColor" strokeWidth="2"/>
            </svg>
            保存
          </button>
          <button onClick={handleOpen} className="toolbar-btn">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 14V2h10v12H3z" stroke="currentColor" strokeWidth="2"/>
              <path d="M6 8l2 2 2-2" stroke="currentColor" strokeWidth="2"/>
            </svg>
            打开
          </button>
          <button onClick={handleUndo} className="toolbar-btn">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M3 8l4-4M3 8l4 4" stroke="currentColor" strokeWidth="2"/>
            </svg>
            撤销
          </button>
          <button onClick={() => setShowShareModal(true)} className="toolbar-btn">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M12 4a2 2 0 100-4 2 2 0 000 4zM4 10a2 2 0 100-4 2 2 0 000 4zM12 16a2 2 0 100-4 2 2 0 000 4z" fill="currentColor"/>
              <path d="M6 9l4-2M6 7l4 2" stroke="currentColor" strokeWidth="2"/>
            </svg>
            分享
          </button>
        </div>
        <div className="toolbar-right">
          <button onClick={handleAddNode} className="toolbar-btn primary">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 1v14M1 8h14" stroke="currentColor" strokeWidth="2"/>
            </svg>
            添加节点
          </button>
        </div>
      </div>

      {showSavedMaps && (
        <div className="saved-maps-overlay">
          <div className="saved-maps-modal">
            <h3>已保存的思维导图</h3>
            {savedMaps.length === 0 ? (
              <p>暂无保存的思维导图</p>
            ) : (
              <ul className="saved-maps-list">
                {savedMaps.map(map => (
                  <li key={map.id} onClick={() => handleLoadMap(map)}>
                    <span>{map.rootTopic.title}</span>
                    <span className="map-date">
                      {new Date(map.updatedAt).toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <button
              className="close-modal-btn"
              onClick={() => setShowSavedMaps(false)}
            >
              关闭
            </button>
          </div>
        </div>
      )}

      {showShareModal && (
        <div className="share-modal-overlay">
          <div className="share-modal">
            <h3>分享思维导图</h3>
            <div className="share-options">
              <label>
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                />
                公开分享
              </label>
              <p className="share-tip">
                {isPublic ?
                  '所有人都可以查看您的思维导图' :
                  '仅自己可见'
                }
              </p>
            </div>
            <div className="share-buttons">
              <button onClick={handleShare} className="share-btn">
                确认分享
              </button>
              <button
                onClick={() => setShowShareModal(false)}
                className="cancel-btn"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Toolbar;