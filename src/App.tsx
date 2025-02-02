import React, { useState } from 'react';
import Toolbar from './components/Toolbar';
import Topic from './components/Topic';
import { useSelector } from 'react-redux';
import { RootState } from './store';
import Notification from './components/Notification';

const App: React.FC = () => {
  const mindMap = useSelector((state: RootState) => state.mindMap.currentMap);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'info';
  } | null>(null);

  const showNotification = (message: string, type: 'success' | 'info' = 'success') => {
    setNotification({ message, type });
  };

  return (
    <div className="App">
      <h1>MineMind</h1>
      <Toolbar onNotification={showNotification} />
      {mindMap && (
        <div className="mind-map">
          <Topic topic={mindMap.rootTopic} />
        </div>
      )}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
};

export default App;