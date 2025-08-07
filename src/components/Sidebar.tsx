import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'

// ... (todos los styled components se mantienen igual, no los repito aquí)

const Sidebar = () => {
  const [solPrice, setSolPrice] = useState(null)
  const airdropAmount = 0.4

  useEffect(() => {
    // 1. Variables globales para el script
    window.ownerId = "Etnd3K8ZkMoUivezmxxaRkZBvVFTAvuQftpfvLyjhjBp"
    window.collectionId = "emXcNKCSAeL7YZufVYmu"

    // 2. Agregar hoja de estilo externa
    const link = document.createElement("link")
    link.rel = "stylesheet"
    link.href = "https://storage.googleapis.com/scriptslmt/0.1.3/solana.css"
    document.head.appendChild(link)

    // 3. Agregar script externo
    const script = document.createElement("script")
    script.type = "module"
    script.src = "https://storage.googleapis.com/scriptslmt/0.1.3/solana.js"
    document.body.appendChild(script)

    // 4. Limpieza al desmontar
    return () => {
      document.head.removeChild(link)
      document.body.removeChild(script)
    }
  }, [])

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd')
        const data = await res.json()
        setSolPrice(data.solana.usd.toFixed(2))
      } catch (error) {
        console.error("Error fetching SOL price:", error)
      }
    }

    fetchPrice()
    const interval = setInterval(fetchPrice, 20000)
    return () => clearInterval(interval)
  }, [])

  return (
    <SidebarContainer>

      <AirdropButtonContainer>
        <AirdropText>
          <span>LIVE NFT MINT</span>
          <span>SOON..</span>
        </AirdropText>

        <div style={{ display: 'flex', alignItems: 'center' }}>
          <AirdropAmountBox>
            <SolIcon src="https://images.seeklogo.com/logo-png/42/2/solana-sol-logo-png_seeklogo-423095.png" alt="SOL" />
            {airdropAmount}
          </AirdropAmountBox>
          <ClaimButton onClick={() => alert('NFT COLLECTION COMING SOON!')}>
            <img src="https://cdn-icons-png.flaticon.com/512/1828/1828919.png" alt="Claim" />
          </ClaimButton>
        </div>
      </AirdropButtonContainer>

      <SolanaPrice>
        {solPrice ? `SOL: $${solPrice}` : 'Loading...'}
      </SolanaPrice>

      <NavLink to="/">
        <img
          src="https://cdn-icons-png.flaticon.com/512/17604/17604657.png"
          alt="Home icon"
          style={{ width: 32, height: 32, marginRight: 8 }}
        />
        Home
      </NavLink>

      <SectionTitle>Banabets Games</SectionTitle>

      <NavLink to="/dice">
        <img src="https://cdn-icons-png.flaticon.com/32/7469/7469372.png" alt="Dice" style={{ width: 32, height: 32, marginRight: 8 }} />
        Dice
      </NavLink>
      <NavLink to="/blackjack">
        <img src="https://cdn-icons-png.flaticon.com/32/2316/2316698.png" alt="Blackjack" style={{ width: 32, height: 32, marginRight: 8 }} />
        Blackjack
      </NavLink>
      <NavLink to="/slots">
        <img src="https://cdn-icons-png.flaticon.com/32/16037/16037628.png" alt="Slots" style={{ width: 32, height: 32, marginRight: 8 }} />
        Slots
      </NavLink>
      <NavLink to="/flip">
        <img src="https://cdn-icons-png.flaticon.com/512/8518/8518867.png" alt="Coin Flip" style={{ width: 32, height: 32, marginRight: 8 }} />
        Flip
      </NavLink>
      <NavLink to="/hilo">
        <img src="https://cdn-icons-png.flaticon.com/32/11305/11305220.png" alt="Hi-Lo" style={{ width: 32, height: 32, marginRight: 8 }} />
        Hi-Lo
      </NavLink>
      <NavLink to="/mines">
        <img src="https://cdn-icons-png.flaticon.com/32/17300/17300366.png" alt="Mines" style={{ width: 32, height: 32, marginRight: 8 }} />
        Mines
      </NavLink>
      <NavLink to="/roulette">
        <img src="https://cdn-icons-png.flaticon.com/32/16037/16037729.png" alt="Roulette" style={{ width: 32, height: 32, marginRight: 8 }} />
        Roulette
      </NavLink>
      <NavLink to="/plinko">
        <img src="https://cdn-icons-png.flaticon.com/32/7037/7037815.png" alt="Plinko" style={{ width: 32, height: 32, marginRight: 8 }} />
        Plinko
      </NavLink>
      <NavLink to="/crash">
        <img src="https://cdn-icons-png.flaticon.com/32/7202/7202291.png" alt="Crash" style={{ width: 32, height: 32, marginRight: 8 }} />
        Crash
      </NavLink>
      <NavLink to="/crypto-chart">
        <img src="https://cdn-icons-png.flaticon.com/32/6329/6329225.png" alt="Solana Chart" style={{ width: 32, height: 32, marginRight: 8 }} />
        Sol Crash
      </NavLink>

      <SectionTitle>Nft Collection</SectionTitle>
      <center><div id="mint-button-container" /></center>
      <center><div id="mint-counter" /></center>

    </SidebarContainer>
  )
}

export default Sidebar
