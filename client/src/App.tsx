import { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ticketRepository } from './data/repositories/ticketRepository';
import { LoginPage } from './presentation/pages/LoginPage';
import { ClientDashboardPage } from './presentation/pages/client/ClientDashboardPage';
import { ClientCreatePage } from './presentation/pages/client/ClientCreatePage';
import { ClientChatPage } from './presentation/pages/client/ClientChatPage';
import { OperatorDashboardPage } from './presentation/pages/operator/OperatorDashboardPage';
import { OperatorChatPage } from './presentation/pages/operator/OperatorChatPage';

export default function App() {
  // Bootstrap the WS connection once when the application starts
  useEffect(() => {
    ticketRepository.connect();
  }, []);

  return (
    <HashRouter>
      <Routes>
        {/* Route 1: Login and Identification */}
        <Route path="/" element={<LoginPage />} />

        {/* Route 2: Client Portal / Dashboard */}
        <Route path="/client/dashboard" element={<ClientDashboardPage />} />

        {/* Route 3: Client Ticket Creation Questionnaire */}
        <Route path="/client/create" element={<ClientCreatePage />} />

        {/* Route 4: Client Real-Time Chat */}
        <Route path="/client/chat/:ticketId" element={<ClientChatPage />} />

        {/* Route 5: Operator Portal / Dashboard */}
        <Route path="/operator/dashboard" element={<OperatorDashboardPage />} />

        {/* Route 6: Operator Real-Time Chat */}
        <Route path="/operator/chat/:ticketId" element={<OperatorChatPage />} />

        {/* Fallback to Login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
