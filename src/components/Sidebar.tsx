import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'

const SidebarContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 260px;
  height: 100vh;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  z-index: 1000;
  padding: 20px;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  font-family: Arial, sans-serif;
  border-right: 1px solid rgba(255, 255, 255, 0.1);

  @media (max-width: 768px) {
    display: none;
  }
`

const SectionTitle = styled.h4`
  margin: 30px 0 10px;
  font-size: 0.8rem;
  font-weight: bold;
  color: #888;
  text-transform: uppercase;
`

const NavLink = styled(Link)`
  display: block;
  padding: 8px 0;
  color: white;
  text-decoration: none;
  font-size: 0.95rem;
  transition: color 0.2s;

  &:hover {
    color: #00ffe1;
  }
`

const AirdropButton = styled.button`
  font-size: 18px;
  font-weight: 700;
  padding: 12px 16px;
  background: linear-gradient(90deg, #fbbf24, #f59e0b);
  color: #000;
  box-shadow: 0 0 8px rgba(251, 191, 36, 0.8);
  border-radius: 12px;
  border: none;
  cursor: pointer;
  width: 100%;
  margin-bottom: 20px;
  transition: background 0.2s, box-shadow 0.2s;

  &:hover {
    background: linear-gradient(90deg, #f59e0b, #d97706);
    box-shadow: 0 0 12px rgba(217, 119, 6, 1);
  }
`

const SolanaPrice = styled.div`
  background-color: #111;
  color: #00ffa3;
  padding: 10px;
  border-radius: 8px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 20px;
`

const Sidebar = () => {
  const [solPrice, setSolPrice] = useState(null)

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
    const interval = setInterval(fetchPrice, 20000) // cada 20 segundos

    return () => clearInterval(interval)
  }, [])

  return (
    <SidebarContainer>
      <AirdropButton onClick={() => alert("Airdrop claimed!")}>
        Claim Airdrop 🎁
      </AirdropButton>

      <SolanaPrice>
        {solPrice ? `SOL: $${solPrice}` : 'Loading...'}
      </SolanaPrice>

<NavLink to="/">
  <img
    src="https://cdn-icons-png.flaticon.com/512/17604/17604657.png" // Ícono de casa (puedes cambiarlo)
    alt="Home icon"
    style={{ width: 32, height: 32, marginRight: 8 }}
  />
  Home
</NavLink>

      <SectionTitle>Banabets Games</SectionTitle>
      <NavLink to="/dice">
  <img
    src="https://cdn-icons-png.flaticon.com/32/7469/7469372.png"
    alt="Dice icon"
    style={{ width: 32, height: 32, marginRight: 8, verticalAlign: 'middle' }}
  />
  Dice
</NavLink>

     <NavLink to="/blackjack">
  <img
    src="https://cdn-icons-png.flaticon.com/32/2316/2316698.png"
    alt="Blackjack icon"
    style={{ width: 32, height: 32, marginRight: 8, verticalAlign: 'middle' }}
  />
  Blackjack
</NavLink>
     <NavLink to="/slots">
  <img
    src="https://cdn-icons-png.flaticon.com/32/16037/16037628.png"
    alt="Slots icon"
    style={{ width: 32, height: 32, marginRight: 8 }}
  />
  Slots
</NavLink>
      <NavLink to="/flip">
  <img
    src="https://cdn-icons-png.flaticon.com/512/8518/8518867.png"
    alt="Coin Flip icon"
    style={{ width: 32, height: 32, marginRight: 8 }}
  />
  Flip
</NavLink>
    <NavLink to="/hi-lo">
  <img
    src="https://cdn-icons-png.flaticon.com/32/11305/11305220.png"
    alt="Hi-Lo icon"
    style={{ width: 32, height: 32, marginRight: 8 }}
  />
  Hi-Lo
</NavLink>
      <NavLink to="/mines">
  <img
    src="https://cdn-icons-png.flaticon.com/32/17300/17300366.png"
    alt="Mines icon"
    style={{ width: 32, height: 32, marginRight: 8 }}
  />
  Mines
</NavLink>
      <NavLink to="/roulette">
  <img
    src="https://cdn-icons-png.flaticon.com/32/16037/16037729.png"
    alt="Roulette icon"
    style={{ width: 32, height: 32, marginRight: 8 }}
  />
  Roulette
</NavLink>
      <NavLink to="/plinko">
  <img
    src="https://cdn-icons-png.flaticon.com/32/7037/7037815.png"
    alt="Plinko icon"
    style={{ width: 32, height: 32, marginRight: 8 }}
  />
  Plinko
</NavLink>
      <NavLink to="/crash">
  <img
    src="https://cdn-icons-png.flaticon.com/32/7202/7202291.png"
    alt="Crash icon"
    style={{ width: 32, height: 32, marginRight: 8 }}
  />
  Crash
</NavLink>
      <NavLink to="/crypto-chart">
  <img
    src="https://cdn-icons-png.flaticon.com/32/6329/6329225.png"
    alt="Solana icon"
    style={{ width: 32, height: 32, marginRight: 8 }}
  />
  Sol Crash
</NavLink>


      <SectionTitle>Exclusive Games</SectionTitle>
      <center><NavLink to="/provably-fair">Coming Soon..</NavLink></center>

    </SidebarContainer>
  )
}

export default Sidebar
