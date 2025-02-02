import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { loadMindMap } from '../store/mindMapSlice';
import { getAllMindMaps, likeMindMap, addComment } from '../utils/cloudStorage';
import { MindMap } from '../types/MindMap';

interface CloudMindMap extends MindMap {
  authorName?: string;
  likes?: number;
  comments?: Array<{
    id: string;
    authorId: string;
    authorName: string;
    content: string;
    createdAt: string;
  }>;
}

const CloudMindMaps: React.FC = () => {
  const [mindMaps, setMindMaps] = useState<CloudMindMap[]>(getAllMindMaps());
  const dispatch = useDispatch();

  const handleLike = (mapId: string) => {
    likeMindMap(mapId);
    setMindMaps(getAllMindMaps());
  };

  const handleComment = (mapId: string, content: string) => {
    addComment(mapId, 'user123', '测试用户', content);
    setMindMaps(getAllMindMaps());
  };

  return (
    <div className="cloud-mindmaps">
      <h2>分享的思维导图</h2>
      <div className="mindmap-list">
        {mindMaps.map(map => (
          <div key={map.id} className="mindmap-card">
            <div className="mindmap-header">
              <h3>{map.rootTopic.title}</h3>
              <span className="author">{map.authorName || '匿名'}</span>
            </div>
            <div className="mindmap-actions">
              <button onClick={() => dispatch(loadMindMap(map))}>打开</button>
              <button onClick={() => handleLike(map.id)}>
                点赞 ({map.likes || 0})
              </button>
            </div>
            <div className="comments-section">
              {map.comments?.map(comment => (
                <div key={comment.id} className="comment">
                  <span className="comment-author">{comment.authorName}</span>
                  <p>{comment.content}</p>
                </div>
              ))}
              <input
                type="text"
                placeholder="添加评论..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleComment(map.id, e.currentTarget.value);
                    e.currentTarget.value = '';
                  }
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CloudMindMaps;