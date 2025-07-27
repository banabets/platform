import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'

const SidebarContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 290px;
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

const SolanaPrice = styled.div`
  background-color: #111;
  color: #00ffa3;
  padding: 10px;
  border-radius: 8px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 20px;
`

// NUEVO DISEÑO DEL BOTÓN DE AIRDROP
const AirdropButtonContainer = styled.div`
  background: #1c1c2b;
  border: 2px solid #2a2a40;
  border-radius: 12px;
  padding: 10px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
gap: 2px; /* 👈 agrega esto */
  margin-bottom: 20px;
  font-family: 'Arial', sans-serif;
`

const AirdropText = styled.div`
  display: flex;
  flex-direction: column;
  font-size: 0.75rem;
  font-weight: bold;
  color: #a1a1aa;

  span:first-child {
    font-size: 0.7rem;
    text-transform: uppercase;
    color: #fff;
  }

  span:last-child {
    color: #a78bfa;
    font-size: 1.2rem;
    font-weight: 900;
  }
`

const AirdropAmountBox = styled.div`
  display: flex;
  align-items: center;
  background: #2a2a40;
  padding: 6px 10px;
  border-radius: 10px;
  font-weight: bold;
  font-size: 0.9rem;
  gap: 8px;
  color: white;
`

const SolIcon = styled.img`
  width: 20px;
  height: 20px;
`

const ClaimButton = styled.button`
  background: #a78bfa;
  border: none;
  border-radius: 10px;
  padding: 10px;
  margin-left: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  &:hover {
    background: #c084fc;
  }

  img {
    width: 20px;
    height: 20px;
  }
`

const Sidebar = () => {
  const [solPrice, setSolPrice] = useState(null)
  const airdropAmount = 0.5

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
          <span>$BANANAS</span>
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
      <center><NavLink to="/provably-fair">$BANANAS Nft's Coming Soon..</NavLink></center>
    </SidebarContainer>
  )
}

export default Sidebar
