import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import { store } from './store';
import { router } from './routes';

export default function FuturesApp() {
  return (
    <Provider store={store}>
      <RouterProvider 
        router={router}
        fallbackElement={<div>Loading...</div>}
      />
    </Provider>
  );
}

