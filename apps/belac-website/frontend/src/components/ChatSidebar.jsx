import { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { MdAdd } from 'react-icons/md'
import './ChatSidebar.css'

export default function ChatSidebar({ onSelectChat, selectedChatId }) {
  const { publicKey } = useWallet()
  const [chats, setChats] = useState([])
  const [showNewForm, setShowNewForm] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchChats()
  }, [])

  const fetchChats = async () => {
    try {
      const res = await fetch('https://belac-fun-production.up.railway.app/api/conversations?limit=50')
      const data = await res.json()
      setChats(data.conversations || [])
    } catch (err) {
      console.error('Error fetching chats:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateChat = async (e) => {
    e.preventDefault()
    if (!newTitle.trim() || !publicKey) return

    try {
      const res = await fetch('https://belac-fun-production.up.railway.app/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet_address: publicKey.toBase58(),
          title: newTitle,
          description: 'Chat with builder'
        })
      })

      if (res.ok) {
        const data = await res.json()
        setChats([data.conversation, ...chats])
        setNewTitle('')
        setShowNewForm(false)
        onSelectChat(data.conversation.id)
      }
    } catch (err) {
      console.error('Error creating chat:', err)
    }
  }

  return (
    <div className="chat-sidebar-section">
      <div className="chat-sidebar-header">
        <h3>Chat</h3>
        {publicKey && (
          <button className="chat-new-btn" onClick={() => setShowNewForm(!showNewForm)} title="New Chat">
            <MdAdd size={18} />
          </button>
        )}
      </div>

      {showNewForm && publicKey && (
        <form onSubmit={handleCreateChat} className="chat-new-form">
          <input
            type="text"
            placeholder="Chat title..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            required
          />
          <textarea
            placeholder="Description (optional)"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            rows={2}
          />
          <div className="conv-form-btns">
            <button type="submit" className="conv-form-btn-create">Create</button>
            <button type="button" className="conv-form-btn-cancel" onClick={() => setShowNewForm(false)}>Cancel</button>
          </div>
        </form>
      )}

      <div className="conv-list-container">
        {loading ? (
          <div className="conv-loading-text">Loading...</div>
        ) : conversations.length > 0 ? (
          <div className="conv-list">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                className={`conv-list-item ${selectedConversationId === conv.id ? 'active' : ''}`}
                onClick={() => onSelectConversation(conv.id)}
              >
                <div className="conv-list-title">{conv.title}</div>
                <div className="conv-list-meta">{conv.message_count || 0} msgs</div>
              </button>
            ))}
          </div>
        ) : (
          <div className="conv-empty-text">No conversations yet</div>
        )}
      </div>

      {!publicKey && <div className="conv-connect-prompt">Connect wallet to chat</div>}
    </div>
  )
}
