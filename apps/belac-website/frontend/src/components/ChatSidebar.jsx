import { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { MdAdd } from 'react-icons/md'
import './ChatSidebar.css'

export default function ChatSidebar({ onSelectChat, selectedChatId, onChatCreated, onChatsLoaded }) {
  const { publicKey } = useWallet()
  const [chats, setChats] = useState([])
  const [showNewForm, setShowNewForm] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchChats()
  }, [])

  useEffect(() => {
    if (chats.length > 0 && onChatsLoaded) {
      onChatsLoaded(chats)
    }
  }, [chats])

  const fetchChats = async () => {
    try {
      const res = await fetch('https://belac-fun-production.up.railway.app/api/conversations?limit=50')
      const data = await res.json()
      const fetchedChats = data.conversations || []
      setChats(fetchedChats)
      
      // Auto-select first chat if none selected
      if (!selectedChatId && fetchedChats.length > 0 && onSelectChat) {
        onSelectChat(fetchedChats[0].id)
      }
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
        if (onChatCreated) {
          onChatCreated(data.conversation.id)
        }
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
          <div className="chat-form-btns">
            <button type="submit" className="chat-form-btn-create">Create</button>
            <button type="button" className="chat-form-btn-cancel" onClick={() => setShowNewForm(false)}>Cancel</button>
          </div>
        </form>
      )}

      <div className="chat-list-container">
        {loading ? (
          <div className="chat-loading-text">Loading...</div>
        ) : chats.length > 0 ? (
          <div className="chat-list">
            {chats.map((chat) => (
              <button
                key={chat.id}
                className={`chat-list-item ${selectedChatId === chat.id ? 'active' : ''}`}
                onClick={() => onSelectChat(chat.id)}
              >
                <div className="chat-list-title">{chat.title}</div>
                <div className="chat-list-meta">{chat.message_count || 0} msgs</div>
              </button>
            ))}
          </div>
        ) : (
          <div className="chat-empty-text">No chats yet</div>
        )}
      </div>

      {!publicKey && <div className="chat-connect-prompt">Connect wallet to chat</div>}
    </div>
  )
}
