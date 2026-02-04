import { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { MdAdd, MdClose } from 'react-icons/md'
import '../styles/Conversations.css'

export default function Conversations() {
  const { publicKey } = useWallet()
  const [conversations, setConversations] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [selectedDetail, setSelectedDetail] = useState(null)
  const [loading, setLoading] = useState(true)
  const [newMessage, setNewMessage] = useState('')
  const [showNewConv, setShowNewConv] = useState(false)
  const [newConvTitle, setNewConvTitle] = useState('')
  const [newConvDesc, setNewConvDesc] = useState('')

  // Load conversations
  useEffect(() => {
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

    fetchConversations()
  }, [])

  // Load conversation detail
  const handleSelectConversation = async (convId) => {
    setSelectedId(convId)
    try {
      const res = await fetch(`https://belac-fun-production.up.railway.app/api/conversations/${convId}`)
      const data = await res.json()
      setSelectedDetail(data)
    } catch (err) {
      console.error('Error fetching conversation detail:', err)
    }
  }

  // Post new message
  const handlePostMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !publicKey) return

    try {
      const res = await fetch(`https://belac-fun-production.up.railway.app/api/conversations/${selectedId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet_address: publicKey.toBase58(),
          message: newMessage.trim()
        })
      })

      if (res.ok) {
        setNewMessage('')
        // Reload conversation detail
        handleSelectConversation(selectedId)
      }
    } catch (err) {
      console.error('Error posting message:', err)
    }
  }

  // Create new conversation
  const handleCreateConversation = async (e) => {
    e.preventDefault()
    if (!newConvTitle.trim() || !publicKey) return

    try {
      const res = await fetch('https://belac-fun-production.up.railway.app/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet_address: publicKey.toBase58(),
          title: newConvTitle,
          description: newConvDesc
        })
      })

      if (res.ok) {
        const data = await res.json()
        setConversations([data.conversation, ...conversations])
        setNewConvTitle('')
        setNewConvDesc('')
        setShowNewConv(false)
        handleSelectConversation(data.conversation.id)
      }
    } catch (err) {
      console.error('Error creating conversation:', err)
    }
  }

  return (
    <div className="conversations-page">
      {/* SIDEBAR */}
      <div className="conv-sidebar">
        <div className="conv-sidebar-header">
          <h2>Conversations</h2>
          <button className="conv-new-btn" onClick={() => setShowNewConv(!showNewConv)} title="New Conversation">
            <MdAdd size={20} />
          </button>
        </div>

        {showNewConv && (
          <form onSubmit={handleCreateConversation} className="conv-new-form">
            <input
              type="text"
              placeholder="Title"
              value={newConvTitle}
              onChange={(e) => setNewConvTitle(e.target.value)}
              required
            />
            <textarea placeholder="Description (optional)" value={newConvDesc} onChange={(e) => setNewConvDesc(e.target.value)} rows={2} />
            <div className="conv-form-actions">
              <button type="submit" className="conv-form-btn conv-form-btn-submit">Create</button>
              <button type="button" className="conv-form-btn conv-form-btn-cancel" onClick={() => setShowNewConv(false)}>Cancel</button>
            </div>
          </form>
        )}

        <div className="conv-list">
          {loading ? (
            <div className="conv-loading">Loading...</div>
          ) : conversations.length > 0 ? (
            conversations.map((conv) => (
              <button
                key={conv.id}
                className={`conv-item ${selectedId === conv.id ? 'active' : ''}`}
                onClick={() => handleSelectConversation(conv.id)}
              >
                <div className="conv-item-title">{conv.title}</div>
                <div className="conv-item-meta">{conv.message_count || 0} replies</div>
              </button>
            ))
          ) : (
            <div className="conv-empty">No conversations yet</div>
          )}
        </div>
      </div>

      {/* MAIN CHAT AREA */}
      <div className="conv-main">
        {selectedDetail ? (
          <>
            <div className="conv-header">
              <div className="conv-header-content">
                <h1>{selectedDetail.conversation.title}</h1>
                <p>{selectedDetail.conversation.display_name || selectedDetail.conversation.wallet_address.slice(0, 8)}</p>
              </div>
            </div>

            <div className="conv-messages">
              {selectedDetail.conversation.description && (
                <div className="conv-description-box">
                  <p>{selectedDetail.conversation.description}</p>
                </div>
              )}

              <div className="conv-thread">
                {selectedDetail.messages.length > 0 ? (
                  selectedDetail.messages.map((msg) => (
                    <div key={msg.id} className="conv-message">
                      <div className="conv-message-author">
                        <strong>{msg.display_name || msg.wallet_address.slice(0, 8)}</strong>
                        <span className="conv-message-time">{new Date(msg.created_at).toLocaleString()}</span>
                      </div>
                      <p className="conv-message-text">{msg.message}</p>
                    </div>
                  ))
                ) : (
                  <div className="conv-no-messages">No replies yet. Be the first to comment!</div>
                )}
              </div>
            </div>

            {publicKey ? (
              <form onSubmit={handlePostMessage} className="conv-reply-form">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Add your reply..."
                  rows={3}
                />
                <button type="submit" className="conv-reply-btn" disabled={!newMessage.trim()}>
                  Reply
                </button>
              </form>
            ) : (
              <div className="conv-reply-prompt">Connect wallet to reply</div>
            )}
          </>
        ) : (
          <div className="conv-empty-state">
            <h2>Select a conversation</h2>
            <p>Choose from the list on the left to view and reply</p>
          </div>
        )}
      </div>
    </div>
  )
}
