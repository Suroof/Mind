import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { addTopic, loadMindMap, createNewMindMap, saveMindMap, undoAction } from '../store/mindMapSlice';
import { MindMap } from '../types/MindMap';
import { getAllMindMaps } from '../utils/cloudStorage';
import '../styles/donate.css';

interface ToolbarProps {
  onNotification: (message: string, type?: 'success' | 'info') => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ onNotification }) => {
  const dispatch = useDispatch();
  const [showSavedMaps, setShowSavedMaps] = useState(false);
  const [savedMaps, setSavedMaps] = useState<MindMap[]>([]);
  const [showDonateModal, setShowDonateModal] = useState(false);

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
          <button onClick={() => setShowDonateModal(true)} className="toolbar-btn donate-btn">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 2l2 4h4l-3 3 1 4-4-2-4 2 1-4-3-3h4l2-4z" stroke="currentColor" strokeWidth="2"/>
            </svg>
            赞赏
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

      {showDonateModal && (
        <div className="donate-modal-overlay" onClick={() => setShowDonateModal(false)}>
          <div className="donate-modal" onClick={e => e.stopPropagation()}>
            <h3>赞赏作者</h3>
            <p className="donate-text">创作不易，您的每一份支持都是我前进的动力 ❤️</p>
            <div className="donate-image">
              <img src="/Gift.jpg" alt="赞赏码" />
            </div>
            <button className="close-modal-btn" onClick={() => setShowDonateModal(false)}>
              关闭
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Toolbar;
