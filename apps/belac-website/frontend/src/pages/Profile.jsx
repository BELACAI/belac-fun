import { useWallet } from '@solana/wallet-adapter-react'

export default function Profile() {
  const { publicKey } = useWallet()

  return (
    <div className="page-stub">
      {publicKey ? (
        <p>Profile: {publicKey.toString().slice(0, 8)}...</p>
      ) : (
        <p>Connect wallet to see profile</p>
      )}
    </div>
  )
}
