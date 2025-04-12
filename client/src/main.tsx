import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';
import './css/style.css';
import 'jsvectormap/dist/css/jsvectormap.css';
import 'flatpickr/dist/flatpickr.min.css';
import 'react-toastify/dist/ReactToastify.css';
import './i18n';
import { Provider } from 'react-redux';
import store from './store';
import FallbackLoading from './components/FallbackLoading';
import { http, createConfig, WagmiProvider } from 'wagmi';
import { bsc } from 'wagmi/chains';
import { metaMask } from 'wagmi/connectors';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const config = createConfig({
  chains: [bsc],
  connectors: [metaMask()],
  transports: {
    [bsc.id]: http(),
  },
});
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <Provider store={store}>
    <Suspense fallback={<FallbackLoading />}>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <Router>
            <App />
          </Router>
        </QueryClientProvider>
      </WagmiProvider>
    </Suspense>
  </Provider>,
);
