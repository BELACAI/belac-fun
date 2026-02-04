import { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import './ConversationView.css'

export default function ConversationView({ conversationId, onLoadComplete }) {
  const { publicKey } = useWallet()
  const { setVisible } = useWalletModal()
  const [conversation, setConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (conversationId) {
      loadConversation()
    } else {
      setConversation(null)
      setMessages([])
      setLoading(false)
    }
  }, [conversationId])

  const loadConversation = async () => {
    setLoading(true)
    try {
      const res = await fetch(`https://belac-fun-production.up.railway.app/api/conversations/${conversationId}`)
      const data = await res.json()
      setConversation(data.conversation)
      setMessages(data.messages || [])
      onLoadComplete?.(data.conversation)
    } catch (err) {
      console.error('Error loading conversation:', err)
    } finally {
      setLoading(false)
    }
  }

  const handlePostMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !publicKey) return

    setSending(true)
    try {
      const res = await fetch(`https://belac-fun-production.up.railway.app/api/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet_address: publicKey.toBase58(),
          message: newMessage.trim()
        })
      })

      if (res.ok) {
        setNewMessage('')
        loadConversation() // Reload to show new message
      }
    } catch (err) {
      console.error('Error posting message:', err)
    } finally {
      setSending(false)
    }
  }

  if (!conversationId) {
    return (
      <div className="conv-view-empty">
        <h2>Select a conversation</h2>
        <p>Choose a chat from the list on the left</p>
      </div>
    )
  }

  if (loading) {
    return <div className="conv-view-loading">Loading conversation...</div>
  }

  if (!conversation) {
    return (
      <div className="conv-view-empty">
        <h2>Conversation not found</h2>
      </div>
    )
  }

  return (
    <div className="conv-view">
      {/* Header */}
      <div className="conv-view-header">
        <h2>{conversation.title}</h2>
        {conversation.display_name && (
          <p className="conv-view-author">by {conversation.display_name}</p>
        )}
        {conversation.description && (
          <p className="conv-view-description">{conversation.description}</p>
        )}
      </div>

      {/* Messages */}
      <div className="conv-view-messages">
        {messages.length > 0 ? (
          <div className="conv-view-thread">
            {messages.map((msg) => (
              <div key={msg.id} className="conv-view-message">
                <div className="conv-msg-author">
                  <strong>{msg.display_name || msg.wallet_address.slice(0, 8)}</strong>
                  <span className="conv-msg-time">{new Date(msg.created_at).toLocaleString()}</span>
                </div>
                <p className="conv-msg-text">{msg.message}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="conv-view-no-messages">No replies yet. Be the first!</div>
        )}
      </div>

      {/* Reply Form */}
      {publicKey ? (
        <form onSubmit={handlePostMessage} className="conv-view-form">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Reply to this conversation..."
            rows={3}
          />
          <button type="submit" className="conv-view-submit" disabled={!newMessage.trim() || sending}>
            {sending ? 'Sending...' : 'Reply'}
          </button>
        </form>
      ) : (
        <div className="conv-view-connect">
          <p>Connect your wallet to reply</p>
          <button onClick={() => setVisible(true)}>Connect Wallet</button>
        </div>
      )}
    </div>
  )
}
