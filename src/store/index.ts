import { configureStore } from '@reduxjs/toolkit';
import mindMapSlice from './mindMapSlice';

export const store = configureStore({
  reducer: {
    mindMap: mindMapSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // 忽略特定 action 的序列化检查
        ignoredActions: ['mindMap/loadMindMap'],
        // 忽略特定路径的序列化检查
        ignoredPaths: ['mindMap.currentMap.createdAt', 'mindMap.currentMap.updatedAt'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;