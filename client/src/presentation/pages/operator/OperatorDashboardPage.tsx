import { Navigate } from 'react-router-dom';
import { useOperatorDashboardController } from '../../controllers/useOperatorDashboardController';
import { OperatorTicketListItem } from '../../components/dashboard/OperatorTicketListItem';

import { OperatorHeader } from '../../components/operator/OperatorHeader';
import { PendingRequestsList } from '../../components/operator/PendingRequestsList';
import { ProtocolSearch } from '../../components/operator/ProtocolSearch';
import { ChatsFilter } from '../../components/operator/ChatsFilter';
import { RequestViewer } from '../../components/operator/RequestViewer';
import { ActiveChatViewer } from '../../components/operator/ActiveChatViewer';
import { MetricsDrawer } from '../../components/operator/MetricsDrawer';

export function OperatorDashboardPage() {
  const {
    currentUser,
    triageLogs,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    channelFilter,
    setChannelFilter,
    protocolId,
    setProtocolId,
    isSearching,
    protocolError,
    activeChatId,
    setActiveChatId,
    activeRequestId,
    setActiveRequestId,
    isDrawerOpen,
    setIsDrawerOpen,
    requestError,
    isAccepting,
    isRejecting,
    metrics,
    pendingRequests,
    filteredActiveChats,
    selectedChatTicket,
    selectedRequestTicket,
    handleProtocolSearch,
    handleAccept,
    handleReject,
    handleSendChat,
    handleResolve,
    handleLeave
  } = useOperatorDashboardController();

  // Route protection
  if (!currentUser || currentUser.role !== 'agent') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen h-screen bg-bg-base text-text-main flex flex-col font-sans overflow-hidden transition-colors duration-300">
      {/* Header */}
      <OperatorHeader
        currentUser={currentUser}
        onOpenDrawer={() => setIsDrawerOpen(true)}
        onLogout={handleLeave}
      />

      {/* Integrated Chat Workspace (Split Two-Column Layout) */}
      <main className="flex-1 flex min-h-0 relative overflow-hidden bg-bg-base">
        {/* LEFT SIDEBAR (Requests & Chats) */}
        <section className="w-[350px] md:w-[380px] bg-bg-base border-r border-border-subtle flex flex-col h-full shrink-0 overflow-hidden transition-colors">
          {/* 1. Pending Requests Subview */}
          <PendingRequestsList
            pendingRequests={pendingRequests}
            activeRequestId={activeRequestId}
            setActiveRequestId={setActiveRequestId}
            setActiveChatId={setActiveChatId}
          />

          {/* 2. Quick Security Access Protocol Search Input */}
          <ProtocolSearch
            protocolId={protocolId}
            setProtocolId={setProtocolId}
            isSearching={isSearching}
            protocolError={protocolError}
            handleProtocolSearch={handleProtocolSearch}
          />

          {/* 3. Filters and Active Chats List */}
          <div className="p-4 flex flex-col flex-1 overflow-hidden">
            <ChatsFilter
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              channelFilter={channelFilter}
              setChannelFilter={setChannelFilter}
            />

            <div className="flex-1 overflow-y-auto space-y-1 mt-4">
              {filteredActiveChats.length === 0 ? (
                <div className="text-center py-12 text-text-muted text-xs italic">Nenhum chat.</div>
              ) : (
                filteredActiveChats.map((ticket) => (
                  <OperatorTicketListItem
                    key={ticket.id}
                    ticket={ticket}
                    isSelected={activeChatId === ticket.id}
                    onSelect={(id) => {
                      setActiveChatId(id);
                      setActiveRequestId(null);
                    }}
                  />
                ))
              )}
            </div>
          </div>
        </section>

        {/* CENTRAL AREA (Chat Viewer or Pending Request Details Viewer) */}
        <section className="flex-1 flex flex-col bg-bg-panel h-full overflow-hidden relative">
          {selectedRequestTicket ? (
            /* Case A: Pending Request details Viewer */
            <RequestViewer
              ticket={selectedRequestTicket}
              requestError={requestError}
              isRejecting={isRejecting}
              isAccepting={isAccepting}
              onReject={handleReject}
              onAccept={handleAccept}
            />
          ) : selectedChatTicket ? (
            /* Case B: Active Chat Viewer */
            <ActiveChatViewer
              ticket={selectedChatTicket}
              currentUser={currentUser}
              onResolve={handleResolve}
              onSendChat={handleSendChat}
            />
          ) : (
            /* Case C: Empty/Initial State */
            <div className="flex-1 flex items-center justify-center text-text-muted text-xs">
              Selecione um item.
            </div>
          )}
        </section>
      </main>

      {/* METRICS & LOGS DRAWER SIDE PANEL */}
      <MetricsDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        metrics={metrics}
        activeChatsCount={filteredActiveChats.length}
        triageLogs={triageLogs}
      />
    </div>
  );
}
