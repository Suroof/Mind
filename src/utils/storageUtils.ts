import { MindMap } from '../types/MindMap';

export const saveMindMap = (mindMap: MindMap) => {
  try {
    const savedMaps = JSON.parse(localStorage.getItem('mindMaps') || '[]');
    const existingIndex = savedMaps.findIndex((map: MindMap) => map.id === mindMap.id);

    if (existingIndex >= 0) {
      savedMaps[existingIndex] = mindMap;
    } else {
      savedMaps.push(mindMap);
    }

    localStorage.setItem('mindMaps', JSON.stringify(savedMaps));
    return true;
  } catch (error) {
    console.error('保存失败:', error);
    return false;
  }
};

export const loadMindMaps = (): MindMap[] => {
  try {
    return JSON.parse(localStorage.getItem('mindMaps') || '[]');
  } catch (error) {
    console.error('加载失败:', error);
    return [];
  }
};

export const deleteMindMap = (id: string): boolean => {
  try {
    const savedMaps = JSON.parse(localStorage.getItem('mindMaps') || '[]');
    const filteredMaps = savedMaps.filter((map: MindMap) => map.id !== id);
    localStorage.setItem('mindMaps', JSON.stringify(filteredMaps));
    return true;
  } catch (error) {
    console.error('删除失败:', error);
    return false;
  }
};