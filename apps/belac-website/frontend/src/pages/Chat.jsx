import { useState } from 'react'
import ChatSidebar from '../components/ChatSidebar'
import ChatView from '../components/ChatView'
import '../styles/Chat.css'

export default function Chat() {
  const [selectedChatId, setSelectedChatId] = useState(null)

  return (
    <div className="chat-page">
      <div className="chat-layout">
        {/* Sidebar with chat list */}
        <aside className="chat-sidebar-area">
          <ChatSidebar onSelectChat={setSelectedChatId} selectedChatId={selectedChatId} />
        </aside>

        {/* Main chat view */}
        <main className="chat-main-area">
          <ChatView chatId={selectedChatId} />
        </main>
      </div>
    </div>
  )
}
