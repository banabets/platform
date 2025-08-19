const AvatarFrame = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 24px;
  display: grid;
  place-items: center;

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: 24px;
    padding: 5px;
    background: transparent;
    -webkit-mask:
      linear-gradient(#000 0 0) content-box,
      linear-gradient(#000 0 0);
    -webkit-mask-composite: xor;
            mask-composite: exclude;
    pointer-events: none;
  }

  &.none::before {
    display: none;
  }

  &.neon::before {
    background: linear-gradient(135deg, #00ff88, #0ff, #facc15, #f472b6);
    background-size: 300% 300%;
    animation: neonShift 6s ease infinite;
    box-shadow: 0 0 18px rgba(0,255,136,.25);
  }

  &.gold::before {
    background: linear-gradient(135deg, #f59e0b, #facc15, #f59e0b);
    box-shadow: 0 0 18px rgba(250,204,21,.35), inset 0 0 10px rgba(0,0,0,.25);
  }

  &.fire::before {
    background: conic-gradient(from 0deg, #ff4d00, #ff9900, #ffd000, #ff4d00);
    box-shadow: 0 0 18px rgba(255,102,0,.35);
  }

  &.cyber::before {
    background: linear-gradient(135deg, #00e5ff, #00ff88);
    box-shadow: 0 0 14px rgba(0,229,255,.35), inset 0 0 8px rgba(0,255,136,.25);
  }

  @keyframes neonShift {
    0% { background-position: 0% 50% }
    50% { background-position: 100% 50% }
    100% { background-position: 0% 50% }
  }
`
