import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { MindMap, Topic, TopicType } from '../types/MindMap';
import { findTopicById, isDescendant, updateTopicTreeStatus, setTopicTreeComplete } from '../utils/topicUtils';

interface MindMapState {
  currentMap: MindMap | null;
  selectedTopic: string | null;
  history: MindMap[];  // 添加历史记录
  historyIndex: number;  // 添加历史索引
}

// 创建初始状态
const initialState: MindMapState = {
  currentMap: {
    id: '1',
    rootTopic: {
      id: '1',
      title: '项目计划',
      type: 'text',
      isCompleted: false,
      isExpanded: true,
      children: []
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    settings: {
      completedColor: '#4CAF50',
      incompletedColor: '#FF5252',
      showNotifications: true,
      autoLayout: true
    }
  },
  selectedTopic: null,
  history: [],  // 初始化历史记录
  historyIndex: -1,  // 初始化历史索引
};

const mindMapSlice = createSlice({
  name: 'mindMap',
  initialState,
  reducers: {
    toggleTopicComplete(state, action: PayloadAction<{id: string; isCompleted: boolean}>) {
      if (!state.currentMap) return;
      const topic = findTopicById(state.currentMap.rootTopic, action.payload.id);
      if (topic) {
        setTopicTreeComplete(topic, action.payload.isCompleted);
        updateTopicTreeStatus(state.currentMap.rootTopic);
      }
    },

    updateTopicTitle(state, action: PayloadAction<{id: string; title: string}>) {
      if (!state.currentMap) return;
      const topic = findTopicById(state.currentMap.rootTopic, action.payload.id);
      if (topic) {
        topic.title = action.payload.title;
      }
    },

    updateTopicColor(state, action: PayloadAction<{id: string; color: string}>) {
      const topic = findTopicById(state.currentMap?.rootTopic, action.payload.id);
      if (topic) {
        topic.color = action.payload.color;
      }
    },

    addTopic(state, action: PayloadAction<{title: string; parentId: string | null}>) {
      if (!state.currentMap) return;

      const newTopic: Topic = {
        id: Date.now().toString(),
        title: action.payload.title,
        type: 'text',
        isCompleted: false,
        isExpanded: true,
        children: []
      };

      if (action.payload.parentId) {
        const parentTopic = findTopicById(state.currentMap.rootTopic, action.payload.parentId);
        if (parentTopic) {
          parentTopic.children.push(newTopic);
        }
      } else {
        state.currentMap.rootTopic.children.push(newTopic);
      }

      if (state.currentMap) {
        state.history = [...state.history.slice(0, state.historyIndex + 1), JSON.parse(JSON.stringify(state.currentMap))];
        state.historyIndex++;
      }
    },

    connectTopics(state, action: PayloadAction<{sourceId: string; targetId: string}>) {
      if (!state.currentMap) return;

      const sourceTopic = findTopicById(state.currentMap.rootTopic, action.payload.sourceId);
      const targetTopic = findTopicById(state.currentMap.rootTopic, action.payload.targetId);

      if (sourceTopic && targetTopic) {
        // 防止循环引用
        if (isDescendant(targetTopic, sourceTopic)) return;

        // 从原位置移除
        removeTopicFromParent(state.currentMap.rootTopic, sourceTopic.id);

        // 添加到新位置
        targetTopic.children.push(sourceTopic);
      }
    },

    saveMindMap(state) {
      if (state.currentMap) {
        state.currentMap.updatedAt = new Date().toISOString();
      }
    },

    loadMindMap(state, action: PayloadAction<MindMap>) {
      state.currentMap = action.payload;
    },

    createNewMindMap(state) {
      const now = new Date().toISOString();
      state.currentMap = {
        id: Date.now().toString(),
        rootTopic: {
          id: 'root',
          title: '新思维导图',
          type: 'text',
          isCompleted: false,
          isExpanded: true,
          children: []
        },
        createdAt: now,
        updatedAt: now,
        settings: {
          completedColor: '#4CAF50',
          incompletedColor: '#FF5252',
          showNotifications: true,
          autoLayout: true
        }
      };
    },

    toggleTopicExpand(state, action: PayloadAction<string>) {
      if (!state.currentMap) return;
      const topic = findTopicById(state.currentMap.rootTopic, action.payload);
      if (topic) {
        topic.isExpanded = !topic.isExpanded;
      }
    },

    updateTopicType(state, action: PayloadAction<{
      id: string;
      type: TopicType;
      content?: string;
    }>) {
      if (!state.currentMap) return;
      const topic = findTopicById(state.currentMap.rootTopic, action.payload.id);
      if (topic) {
        topic.type = action.payload.type;
        topic.content = action.payload.content;
      }
    },

    deleteTopic(state, action: PayloadAction<string>) {
      if (!state.currentMap) return;
      removeTopicFromParent(state.currentMap.rootTopic, action.payload);
      if (state.currentMap) {
        state.history = [...state.history.slice(0, state.historyIndex + 1), JSON.parse(JSON.stringify(state.currentMap))];
        state.historyIndex++;
      }
    },

    // 添加撤销动作
    undoAction(state) {
      if (state.historyIndex > 0) {
        state.historyIndex--;
        state.currentMap = JSON.parse(JSON.stringify(state.history[state.historyIndex]));
      }
    },
  }
});

// 辅助函数：从父节点中移除主题
const removeTopicFromParent = (root: Topic, topicId: string): boolean => {
  const index = root.children.findIndex(child => child.id === topicId);
  if (index !== -1) {
    root.children.splice(index, 1);
    return true;
  }

  for (const child of root.children) {
    if (removeTopicFromParent(child, topicId)) {
      return true;
    }
  }

  return false;
};

export const {
  toggleTopicComplete,
  updateTopicTitle,
  updateTopicColor,
  addTopic,
  connectTopics,
  saveMindMap,
  loadMindMap,
  createNewMindMap,
  toggleTopicExpand,
  updateTopicType,
  deleteTopic,
  undoAction
} = mindMapSlice.actions;
export default mindMapSlice;