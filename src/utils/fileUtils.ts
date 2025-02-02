import { MindMap } from '../types/MindMap';

export const saveToFile = (mindMap: MindMap) => {
  const jsonString = JSON.stringify(mindMap, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `${mindMap.rootTopic.title || 'mindmap'}_${new Date().toISOString().slice(0,10)}.json`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const loadFromFile = (): Promise<MindMap> => {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (!file) {
        reject('未选择文件');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          resolve(data);
        } catch (error) {
          reject('文件格式无效');
        }
      };
      reader.readAsText(file);
    };

    input.click();
  });
};