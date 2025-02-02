export type TopicType = 'text' | 'image';

export interface Topic {
  id: string;
  title: string;
  type: TopicType;
  content?: string; // 用于存储图片URL
  isCompleted: boolean;
  children: Topic[];
  isExpanded: boolean; // 控制节点展开/折叠状态
  color?: string;
  position?: {
    x: number;
    y: number;
  };
}

export interface MindMap {
  id: string;
  rootTopic: Topic;
  createdAt: string;
  updatedAt: string;
  settings: {
    completedColor: string;
    incompletedColor: string;
    showNotifications: boolean;
    autoLayout: boolean;
  };
}