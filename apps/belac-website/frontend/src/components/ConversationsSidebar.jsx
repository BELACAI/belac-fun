import { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { MdAdd } from 'react-icons/md'
import './ConversationsSidebar.css'

export default function ConversationsSidebar({ onSelectConversation, selectedConversationId }) {
  const { publicKey } = useWallet()
  const [conversations, setConversations] = useState([])
  const [showNewForm, setShowNewForm] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchConversations()
  }, [])

  const fetchConversations = async () => {
    try {
      const res = await fetch('https://belac-fun-production.up.railway.app/api/conversations?limit=50')
      const data = await res.json()
      setConversations(data.conversations || [])
    } catch (err) {
      console.error('Error fetching conversations:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateConversation = async (e) => {
    e.preventDefault()
    if (!newTitle.trim() || !publicKey) return

    try {
      const res = await fetch('https://belac-fun-production.up.railway.app/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet_address: publicKey.toBase58(),
          title: newTitle,
          description: newDesc
        })
      })

      if (res.ok) {
        const data = await res.json()
        setConversations([data.conversation, ...conversations])
        setNewTitle('')
        setNewDesc('')
        setShowNewForm(false)
        onSelectConversation(data.conversation.id)
      }
    } catch (err) {
      console.error('Error creating conversation:', err)
    }
  }

  return (
    <div className="conv-sidebar-section">
      <div className="conv-sidebar-header">
        <h3>Conversations</h3>
        {publicKey && (
          <button className="conv-new-chat-btn" onClick={() => setShowNewForm(!showNewForm)} title="New Conversation">
            <MdAdd size={18} />
          </button>
        )}
      </div>

      {showNewForm && publicKey && (
        <form onSubmit={handleCreateConversation} className="conv-new-chat-form">
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
