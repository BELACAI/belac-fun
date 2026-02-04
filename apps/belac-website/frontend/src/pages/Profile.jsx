import { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { MdEdit, MdAdd, MdLogout } from 'react-icons/md'
import '../styles/Profile.css'

export default function Profile() {
  const { publicKey, disconnect } = useWallet()
  const { setVisible } = useWalletModal()
  const [profile, setProfile] = useState(null)
  const [conversations, setConversations] = useState([])
  const [isEditing, setIsEditing] = useState(false)
  const [showNewConversation, setShowNewConversation] = useState(false)
  const [formData, setFormData] = useState({ display_name: '', bio: '', avatar_url: '' })
  const [newConvData, setNewConvData] = useState({ title: '', description: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const walletAddress = publicKey?.toBase58()

  // Load profile and conversations
  useEffect(() => {
    if (!walletAddress) return

    const fetchData = async () => {
      try {
        const profileRes = await fetch(
          `https://belac-fun-production.up.railway.app/api/profile/${walletAddress}`
        )
        const profileData = await profileRes.json()
        setProfile(profileData)
        setFormData({
          display_name: profileData.display_name || '',
          bio: profileData.bio || '',
          avatar_url: profileData.avatar_url || ''
        })

        const convRes = await fetch(
          `https://belac-fun-production.up.railway.app/api/conversations/user/${walletAddress}`
        )
        const convData = await convRes.json()
        setConversations(convData.conversations || [])
      } catch (err) {
        console.error('Error loading profile:', err)
      }
    }

    fetchData()
  }, [walletAddress])

  const saveProfile = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('https://belac-fun-production.up.railway.app/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet_address: walletAddress,
          ...formData
        })
      })

      if (!res.ok) throw new Error('Failed to save profile')
      const data = await res.json()
      setProfile(data.profile)
      setIsEditing(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const createConversation = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('https://belac-fun-production.up.railway.app/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet_address: walletAddress,
          ...newConvData
        })
      })

      if (!res.ok) throw new Error('Failed to create conversation')
      const data = await res.json()
      setConversations([data.conversation, ...conversations])
      setNewConvData({ title: '', description: '' })
      setShowNewConversation(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!publicKey) {
    return (
      <div className="profile-container profile-empty">
        <div className="profile-connect">
          <h2>Connect Your Wallet</h2>
          <p>Connect your Solana wallet to create your Belac profile.</p>
          <button className="profile-connect-button" onClick={() => setVisible(true)}>
            CONNECT WALLET
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="profile-container">
      {/* PROFILE HEADER */}
      <div className="profile-header">
        <div className="profile-wallet">
          <div className="profile-avatar">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.display_name} />
            ) : (
              <div className="profile-avatar-placeholder">{walletAddress.slice(0, 2).toUpperCase()}</div>
            )}
          </div>

          <div className="profile-info">
            <h1 className="profile-name">
              {profile?.display_name || walletAddress.slice(0, 8) + '...'}
            </h1>
            <p className="profile-address">{walletAddress}</p>
            {profile?.bio && <p className="profile-bio">{profile.bio}</p>}
          </div>

          <div className="profile-actions">
            {!isEditing ? (
              <button className="profile-edit-button" onClick={() => setIsEditing(true)}>
                <MdEdit size={16} /> EDIT
              </button>
            ) : null}
            <button className="profile-disconnect-button" onClick={() => disconnect()}>
              <MdLogout size={16} /> DISCONNECT
            </button>
          </div>
        </div>
      </div>

      {/* EDIT PROFILE FORM */}
      {isEditing && (
        <div className="profile-edit-section">
          <form onSubmit={saveProfile} className="profile-form">
            <div className="form-group">
              <label>Display Name</label>
              <input
                type="text"
                value={formData.display_name}
                onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                placeholder="Your display name"
              />
            </div>

            <div className="form-group">
              <label>Bio</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell us about yourself"
                rows={3}
              />
            </div>

            <div className="form-group">
              <label>Avatar URL</label>
              <input
                type="url"
                value={formData.avatar_url}
                onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                placeholder="https://..."
              />
            </div>

            {error && <div className="profile-error">{error}</div>}

            <div className="form-actions">
              <button type="submit" className="form-button form-button-save" disabled={loading}>
                {loading ? 'SAVING...' : 'SAVE PROFILE'}
              </button>
              <button
                type="button"
                className="form-button form-button-cancel"
                onClick={() => setIsEditing(false)}
                disabled={loading}
              >
                CANCEL
              </button>
            </div>
          </form>
        </div>
      )}

      {/* CONVERSATIONS SECTION */}
      <div className="profile-conversations-section">
        <div className="section-header">
          <h2>My Conversations</h2>
          <button
            className="section-action-button"
            onClick={() => setShowNewConversation(!showNewConversation)}
          >
            <MdAdd size={16} /> NEW DISCUSSION
          </button>
        </div>

        {/* NEW CONVERSATION FORM */}
        {showNewConversation && (
          <form onSubmit={createConversation} className="new-conversation-form">
            <div className="form-group">
              <label>Discussion Title</label>
              <input
                type="text"
                value={newConvData.title}
                onChange={(e) => setNewConvData({ ...newConvData, title: e.target.value })}
                placeholder="What do you want to discuss?"
                required
              />
            </div>

            <div className="form-group">
              <label>Description (optional)</label>
              <textarea
                value={newConvData.description}
                onChange={(e) => setNewConvData({ ...newConvData, description: e.target.value })}
                placeholder="Add context or details..."
                rows={3}
              />
            </div>

            {error && <div className="profile-error">{error}</div>}

            <div className="form-actions">
              <button type="submit" className="form-button form-button-save" disabled={loading}>
                {loading ? 'CREATING...' : 'START DISCUSSION'}
              </button>
              <button
                type="button"
                className="form-button form-button-cancel"
                onClick={() => {
                  setShowNewConversation(false)
                  setNewConvData({ title: '', description: '' })
                }}
                disabled={loading}
              >
                CANCEL
              </button>
            </div>
          </form>
        )}

        {/* CONVERSATIONS LIST */}
        {conversations.length > 0 ? (
          <div className="conversations-list">
            {conversations.map((conv) => (
              <div key={conv.id} className="conversation-card">
                <div className="conversation-header">
                  <h3 className="conversation-title">{conv.title}</h3>
                </div>
                {conv.description && (
                  <p className="conversation-description">{conv.description}</p>
                )}
                <div className="conversation-meta">
                  <span className="conversation-date">
                    Started {new Date(conv.created_at).toLocaleDateString()}
                  </span>
                  <span className="conversation-replies">{conv.message_count} replies</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="profile-empty-state">
            <p>No conversations yet. Start one to discuss your ideas!</p>
          </div>
        )}
      </div>
    </div>
  )
}
