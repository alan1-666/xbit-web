import ReactDOM from 'react-dom/client';
import App from './App';

export const mount = () => {
  const root = ReactDOM.createRoot(
    document.getElementById('futures-root')!
  );
  root.render(<App />);
};

// 独立运行支持
if (import.meta.env.DEV) {
  mount();
}
