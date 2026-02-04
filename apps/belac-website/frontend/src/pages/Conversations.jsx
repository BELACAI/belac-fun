import { useState } from 'react'
import ConversationsSidebar from '../components/ConversationsSidebar'
import ConversationView from '../components/ConversationView'
import '../styles/Conversations.css'

export default function Conversations() {
  const [selectedConversationId, setSelectedConversationId] = useState(null)

  return (
    <div className="conversations-page">
      <div className="conversations-layout">
        {/* Sidebar with conversation list */}
        <aside className="conversations-sidebar-area">
          <ConversationsSidebar onSelectConversation={setSelectedConversationId} selectedConversationId={selectedConversationId} />
        </aside>

        {/* Main conversation view */}
        <main className="conversations-main-area">
          <ConversationView conversationId={selectedConversationId} />
        </main>
      </div>
    </div>
  )
}
