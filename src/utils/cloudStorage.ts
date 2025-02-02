import { MindMap } from '../types/MindMap';

interface CloudMindMap extends MindMap {
  authorId?: string;
  authorName?: string;
  publishedAt?: string;
  likes?: number;
  comments?: Comment[];
  isPublic?: boolean;
}

interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
}

const MINDMAPS_KEY = 'mindmaps';
const SHARED_MAPS_KEY = 'shared-mindmaps';

// 保存思维导图
export const saveMindMap = async (mindMap: MindMap): Promise<boolean> => {
  try {
    const maps = getAllMindMaps();
    const index = maps.findIndex(m => m.id === mindMap.id);

    if (index >= 0) {
      maps[index] = {
        ...mindMap,
        updatedAt: new Date().toISOString()
      };
    } else {
      maps.push({
        ...mindMap,
        updatedAt: new Date().toISOString()
      });
    }

    localStorage.setItem(MINDMAPS_KEY, JSON.stringify(maps));
    return true;
  } catch (error) {
    console.error('保存失败:', error);
    return false;
  }
};

// 获取所有思维导图
export const getAllMindMaps = (): MindMap[] => {
  try {
    return JSON.parse(localStorage.getItem(MINDMAPS_KEY) || '[]');
  } catch (error) {
    console.error('获取思维导图失败:', error);
    return [];
  }
};

// 发布/分享思维导图
export const publishMindMap = async (
  mindMap: MindMap,
  authorId: string,
  authorName: string,
  isPublic: boolean = true
): Promise<boolean> => {
  try {
    const sharedMaps = getAllSharedMindMaps();
    const cloudMap: CloudMindMap = {
      ...mindMap,
      authorId,
      authorName,
      publishedAt: new Date().toISOString(),
      likes: 0,
      comments: [],
      isPublic
    };

    const index = sharedMaps.findIndex(m => m.id === mindMap.id);
    if (index >= 0) {
      sharedMaps[index] = cloudMap;
    } else {
      sharedMaps.push(cloudMap);
    }

    localStorage.setItem(SHARED_MAPS_KEY, JSON.stringify(sharedMaps));
    return true;
  } catch (error) {
    console.error('发布失败:', error);
    return false;
  }
};

// 获取所有分享的思维导图
export const getAllSharedMindMaps = (): CloudMindMap[] => {
  try {
    return JSON.parse(localStorage.getItem(SHARED_MAPS_KEY) || '[]');
  } catch (error) {
    console.error('获取分享思维导图失败:', error);
    return [];
  }
};

// 获取用户的思维导图
export const getUserMindMaps = (userId: string): CloudMindMap[] => {
  const allMaps = getAllSharedMindMaps();
  return allMaps.filter(map => map.authorId === userId);
};

// 点赞
export const likeMindMap = async (mapId: string): Promise<boolean> => {
  try {
    const maps = getAllSharedMindMaps();
    const index = maps.findIndex(map => map.id === mapId);
    if (index >= 0) {
      maps[index].likes = (maps[index].likes || 0) + 1;
      localStorage.setItem(SHARED_MAPS_KEY, JSON.stringify(maps));
      return true;
    }
    return false;
  } catch (error) {
    console.error('点赞失败:', error);
    return false;
  }
};

// 添加评论
export const addComment = async (
  mapId: string,
  authorId: string,
  authorName: string,
  content: string
): Promise<boolean> => {
  try {
    const maps = getAllSharedMindMaps();
    const index = maps.findIndex(map => map.id === mapId);
    if (index >= 0) {
      const comment = {
        id: Date.now().toString(),
        authorId,
        authorName,
        content,
        createdAt: new Date().toISOString()
      };

      if (!maps[index].comments) {
        maps[index].comments = [];
      }

      maps[index].comments?.push(comment);
      localStorage.setItem(SHARED_MAPS_KEY, JSON.stringify(maps));
      return true;
    }
    return false;
  } catch (error) {
    console.error('添加评论失败:', error);
    return false;
  }
};