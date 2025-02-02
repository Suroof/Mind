import { Topic } from '../types/MindMap';

export const findTopicById = (root: Topic | undefined | null, id: string): Topic | null => {
  if (!root) return null;
  if (root.id === id) return root;

  for (const child of root.children) {
    const found = findTopicById(child, id);
    if (found) return found;
  }

  return null;
};

export const countIncompleteTopics = (topic: Topic): number => {
  let count = topic.isCompleted ? 0 : 1;

  for (const child of topic.children) {
    count += countIncompleteTopics(child);
  }

  return count;
};

export const showNotification = (message: string) => {
  // 可以使用第三方通知库，这里用简单的 alert 演示
  alert(message);
};

// 新增：检查是否存在循环引用
export const isDescendant = (parent: Topic, child: Topic): boolean => {
  // 检查 child 是否是 parent 的后代
  if (parent.id === child.id) return true;

  for (const descendant of parent.children) {
    if (isDescendant(descendant, child)) return true;
  }

  return false;
};

// 修改：递归更新节点状态
export const updateTopicTreeStatus = (root: Topic) => {
  // 使用后序遍历，自底向上更新状态
  const stack: Topic[] = [root];
  const visited = new Set<string>();

  while (stack.length > 0) {
    const current = stack[stack.length - 1];

    let allChildrenVisited = true;
    for (const child of current.children) {
      if (!visited.has(child.id)) {
        stack.push(child);
        allChildrenVisited = false;
      }
    }

    if (allChildrenVisited) {
      stack.pop();
      visited.add(current.id);

      if (current.children.length > 0) {
        current.isCompleted = current.children.every(child => child.isCompleted);
      }
    }
  }
};

// 修改：强制设置节点及其所有子节点的状态
export const setTopicTreeComplete = (root: Topic, isCompleted: boolean) => {
  // 使用队列代替递归，避免调用栈溢出
  const queue: Topic[] = [root];

  while (queue.length > 0) {
    const current = queue.shift()!;
    current.isCompleted = isCompleted;
    queue.push(...current.children);
  }
};