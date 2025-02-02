import React, { useState, useCallback, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { Topic as TopicInterface } from '../types/MindMap';
import {
  toggleTopicComplete,
  connectTopics,
  addTopic,
  updateTopicTitle,
  toggleTopicExpand,
  updateTopicType,
  deleteTopic
} from '../store/mindMapSlice';
import { countIncompleteTopics, showNotification } from '../utils/topicUtils';

interface TopicProps {
  topic: TopicInterface;
  level?: number;
}

const Topic: React.FC<TopicProps> = ({ topic, level = 0 }) => {
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(topic.title);
  const topicRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleComplete = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    dispatch(toggleTopicComplete({
      id: topic.id,
      isCompleted: e.target.checked
    }));

    // 只在取消完成状态时，且有未完成的子任务时显示提示
    if (!e.target.checked && topic.children.length > 0) {
      const incompleteCount = countIncompleteTopics(topic);
      if (incompleteCount > 0) {
        showNotification(`还有${incompleteCount}个子主题未完成`);
      }
    }
  }, [dispatch, topic]);

  const handleAddSubTopic = () => {
    dispatch(addTopic({
      title: '新节点',
      parentId: topic.id
    }));
  };

  const handleTitleClick = () => {
    setIsEditing(true);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditTitle(e.target.value);
  };

  const handleTitleBlur = () => {
    if (editTitle.trim() !== '') {
      dispatch(updateTopicTitle({
        id: topic.id,
        title: editTitle.trim()
      }));
    } else {
      setEditTitle(topic.title);
    }
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleBlur();
    }
  };

  const handleDragStart = useCallback((e: React.DragEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    e.dataTransfer.setData('text/plain', topic.id);
    e.dataTransfer.effectAllowed = 'move';

    if (topicRef.current) {
      const rect = topicRef.current.getBoundingClientRect();
      e.dataTransfer.setDragImage(topicRef.current, e.clientX - rect.left, e.clientY - rect.top);
    }
  }, [topic.id]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.types.includes('text/plain')) {
      e.currentTarget.classList.add('drag-over');
      e.dataTransfer.dropEffect = 'move';
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('drag-over');
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('drag-over');

    const sourceId = e.dataTransfer.getData('text/plain');
    if (sourceId !== topic.id) {
      dispatch(connectTopics({
        sourceId,
        targetId: topic.id
      }));
    }
  }, [dispatch, topic.id]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleToggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(toggleTopicExpand(topic.id));
  };

  const handleImageDelete = () => {
    dispatch(updateTopicType({
      id: topic.id,
      type: 'image',
      content: undefined
    }));
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(deleteTopic(topic.id));  // 直接删除，不显示任何确认框
  };

  const handlePaste = async (e: React.ClipboardEvent<HTMLInputElement>) => {
    const items = e.clipboardData.items;
    const imageItem = Array.from(items).find(item => item.type.startsWith('image'));

    if (imageItem) {
      e.preventDefault();
      const blob = imageItem.getAsFile();
      if (!blob) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setIsEditing(false); // 立即退出编辑模式
          dispatch(updateTopicType({
            id: topic.id,
            type: 'image',
            content: event.target.result as string
          }));
        }
      };
      reader.readAsDataURL(blob);
    }
  };

  const handleImageDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          dispatch(updateTopicType({
            id: topic.id,
            type: 'image',
            content: event.target.result as string
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div
      ref={topicRef}
      className={`topic ${topic.isCompleted ? 'completed' : 'incomplete'} ${isDragging ? 'dragging' : ''}`}
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={(e) => {
        if (e.dataTransfer.files.length > 0) {
          handleImageDrop(e);
        } else {
          handleDrop(e);
        }
      }}
      onDragEnd={handleDragEnd}
      style={{ marginLeft: `${level * 20}px` }}
    >
      <div className="topic-header">
        <div className="topic-controls">
          <input
            type="checkbox"
            checked={topic.isCompleted}
            onChange={handleComplete}
          />
          {topic.children.length > 0 && (
            <button
              className="expand-btn"
              onClick={handleToggleExpand}
              title={topic.isExpanded ? '折叠' : '展开'}
            >
              {topic.isExpanded ? '−' : '+'}
            </button>
          )}
        </div>
        {isEditing ? (
          <input
            type="text"
            value={editTitle}
            onChange={handleTitleChange}
            onBlur={handleTitleBlur}
            onKeyPress={handleKeyPress}
            onPaste={handlePaste}
            autoFocus
            className="topic-title-input"
            placeholder="输入文字或粘贴图片"
          />
        ) : (
          <div className="topic-content">
            <span className="topic-title" onClick={handleTitleClick}>
              {topic.title}
            </span>
            {topic.content && (
              <div className="topic-image">
                <img src={topic.content} alt={topic.title} />
                <button className="delete-image" onClick={handleImageDelete}>
                  ×
                </button>
              </div>
            )}
          </div>
        )}
        <div className="topic-tools">
          <button
            className="add-subtopic-btn"
            onClick={handleAddSubTopic}
            title="添加子节点"
          >
            <span className="icon">+</span>
          </button>
          <button
            className="delete-btn"
            onClick={handleDelete}
            title="删除节点"
          >
            <span className="icon">×</span>
          </button>
        </div>
      </div>

      {topic.isExpanded && topic.children.length > 0 && (
        <div className="topic-children">
          {topic.children.map(child => (
            <Topic key={child.id} topic={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export default React.memo(Topic);
