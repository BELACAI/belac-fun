import { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import './ChatView.css'

export default function ChatView({ chatId, onLoadComplete }) {
  const { publicKey } = useWallet()
  const { setVisible } = useWalletModal()
  const [conversation, setConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (chatId) {
      loadChat()
    } else {
      setConversation(null)
      setMessages([])
      setLoading(false)
    }
  }, [chatId])

  const loadChat = async () => {
    setLoading(true)
    try {
      const res = await fetch(`https://belac-fun-production.up.railway.app/api/conversations/${chatId}`)
      const data = await res.json()
      setConversation(data.conversation)
      setMessages(data.messages || [])
      onLoadComplete?.(data.conversation)
    } catch (err) {
      console.error('Error loading chat:', err)
    } finally {
      setLoading(false)
    }
  }

  const handlePostMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !publicKey) return

    setSending(true)
    try {
      const res = await fetch(`https://belac-fun-production.up.railway.app/api/conversations/${chatId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet_address: publicKey.toBase58(),
          message: newMessage.trim()
        })
      })

      if (res.ok) {
        setNewMessage('')
        loadChat() // Reload to show new message
      }
    } catch (err) {
      console.error('Error posting message:', err)
    } finally {
      setSending(false)
    }
  }

  if (!chatId) {
    return (
      <div className="chat-view-empty">
        <h2>Select a chat</h2>
        <p>Choose a chat from the list on the left or start a new one</p>
      </div>
    )
  }

  if (loading) {
    return <div className="chat-view-loading">Loading chat...</div>
  }

  if (!conversation) {
    return (
      <div className="chat-view-empty">
        <h2>Chat not found</h2>
      </div>
    )
  }

  return (
    <div className="chat-view">
      {/* Messages */}
      <div className="chat-view-messages">
        {messages.length > 0 ? (
          <div className="chat-view-thread">
            {messages.map((msg) => (
              <div key={msg.id} className="chat-view-message">
                <div className="chat-msg-author">
                  <strong>{msg.display_name || msg.wallet_address.slice(0, 8)}</strong>
                  <span className="chat-msg-time">{new Date(msg.created_at).toLocaleString()}</span>
                </div>
                <p className="chat-msg-text">{msg.message}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="chat-view-no-messages">No replies yet. Be the first!</div>
        )}
      </div>

      {/* Reply Form */}
      {publicKey ? (
        <form onSubmit={handlePostMessage} className="chat-view-form">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Reply to this conversation..."
            rows={3}
          />
          <button type="submit" className="chat-view-submit" disabled={!newMessage.trim() || sending}>
            {sending ? 'Sending...' : 'Reply'}
          </button>
        </form>
      ) : (
        <div className="chat-view-connect">
          <p>Connect your wallet to reply</p>
          <button onClick={() => setVisible(true)}>Connect Wallet</button>
        </div>
      )}
    </div>
  )
}
