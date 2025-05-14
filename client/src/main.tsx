import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';
import './css/style.css';
import 'jsvectormap/dist/css/jsvectormap.css';
import 'flatpickr/dist/flatpickr.min.css';
import 'react-toastify/dist/ReactToastify.css';
import './i18n';
import 'react-datepicker/dist/react-datepicker.css';
import { Provider } from 'react-redux';
import store from './store';
import FallbackLoading from './components/FallbackLoading';
import { http, createConfig, WagmiProvider } from 'wagmi';
import { bsc } from 'wagmi/chains';
import { metaMask, walletConnect, safe } from 'wagmi/connectors';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const projectId = '4e33da07c03760a57c04483a79dccc0b';

const config = createConfig({
  chains: [bsc],
  connectors: [metaMask(), safe(), walletConnect({ projectId })],
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
