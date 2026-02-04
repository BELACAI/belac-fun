import { useState, useEffect } from 'react'
import { MdChat } from 'react-icons/md'
import '../styles/Conversations.css'

export default function Conversations() {
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [conversationDetail, setConversationDetail] = useState(null)

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await fetch('https://belac-fun-production.up.railway.app/api/conversations')
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

  const handleSelectConversation = async (conv) => {
    setSelectedConversation(conv.id)
    try {
      const res = await fetch(`https://belac-fun-production.up.railway.app/api/conversations/${conv.id}`)
      const data = await res.json()
      setConversationDetail(data)
    } catch (err) {
      console.error('Error fetching conversation detail:', err)
    }
  }

  const handleBackToList = () => {
    setSelectedConversation(null)
    setConversationDetail(null)
  }

  if (loading) {
    return (
      <div className="conversations-container">
        <div className="loading">Loading conversations...</div>
      </div>
    )
  }

  // Conversation Detail View
  if (selectedConversation && conversationDetail) {
    return (
      <div className="conversations-container">
        <div className="conversation-detail-view">
          <button className="back-button" onClick={handleBackToList}>← BACK TO CONVERSATIONS</button>

          <div className="conversation-detail-header">
            <h1>{conversationDetail.conversation.title}</h1>
            <p className="detail-author">
              Started by {conversationDetail.conversation.display_name || conversationDetail.conversation.wallet_address.slice(0, 8)}
            </p>
          </div>

          {conversationDetail.conversation.description && (
            <p className="conversation-detail-description">{conversationDetail.conversation.description}</p>
          )}

          <div className="messages-section">
            <h3>Discussion ({conversationDetail.messages.length} replies)</h3>

            <div className="messages-list">
              {conversationDetail.messages.length > 0 ? (
                conversationDetail.messages.map((msg) => (
                  <div key={msg.id} className="message-item">
                    <div className="message-author">
                      {msg.avatar_url && <img src={msg.avatar_url} alt="" className="message-avatar" />}
                      <span>{msg.display_name || msg.wallet_address.slice(0, 8)}</span>
                      <span className="message-time">
                        {new Date(msg.created_at).toLocaleDateString()} {new Date(msg.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="message-text">{msg.message}</p>
                  </div>
                ))
              ) : (
                <p className="no-messages">No replies yet. Be the first to comment!</p>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Conversations List View
  return (
    <div className="conversations-container">
      <div className="conversations-header">
        <h1>Community Conversations</h1>
        <p>Browse discussions about apps, features, and more</p>
      </div>

      {conversations.length > 0 ? (
        <div className="conversations-grid">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className="community-conversation-card"
              onClick={() => handleSelectConversation(conv)}
            >
              <div className="card-header">
                <div className="card-icon">
                  <MdChat size={24} />
                </div>
                <div className="card-meta">
                  <span className="card-author">
                    {conv.display_name || 'Anonymous'}
                  </span>
                  <span className="card-date">
                    {new Date(conv.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <h3 className="card-title">{conv.title}</h3>

              {conv.description && (
                <p className="card-description">{conv.description}</p>
              )}

              <div className="card-footer">
                {conv.app_name && <span className="card-app">{conv.app_name}</span>}
                <span className="card-replies">{conv.reply_count || 0} replies</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="conversations-empty">
          <p>No conversations yet. Create the first one!</p>
        </div>
      )}
    </div>
  )
}
