import { useState, useEffect } from 'react'
import ChatSidebar from '../components/ChatSidebar'
import ChatView from '../components/ChatView'
import '../styles/Chat.css'

export default function Chat() {
  const [selectedChatId, setSelectedChatId] = useState(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleChatCreated = (newChatId) => {
    setSelectedChatId(newChatId)
    // Trigger refresh of sidebar
    setRefreshTrigger(prev => prev + 1)
  }
  
  const handleChatsLoaded = (chats) => {
    // Auto-select first chat if none selected
    if (!selectedChatId && chats && chats.length > 0) {
      setSelectedChatId(chats[0].id)
    }
  }

  return (
    <div className="chat-page">
      <div className="chat-layout">
        {/* Sidebar with chat list */}
        <aside className="chat-sidebar-area">
          <ChatSidebar 
            key={refreshTrigger}
            onSelectChat={setSelectedChatId} 
            selectedChatId={selectedChatId}
            onChatCreated={handleChatCreated}
            onChatsLoaded={handleChatsLoaded}
          />
        </aside>

        {/* Main chat view */}
        <main className="chat-main-area">
          <ChatView chatId={selectedChatId} />
        </main>
      </div>
    </div>
  )
}
