import styled from 'styled-components'

export const StyledSlots = styled.div`
  /* Altura fija del reel */
  --slot-h: clamp(160px, 28vw, 240px);

  --glass: rgba(255, 255, 255, 0.06);
  --accent: #ffec63;
  --accent-soft: #ffec631a;

  user-select: none;
  width: 100%;
  display: grid;
  gap: 18px;

  & > div { display: grid; gap: 16px; }

  .result {
    border: 1px solid var(--accent);
    background: linear-gradient(0deg, var(--accent-soft), transparent);
    color: var(--accent);
    text-transform: uppercase;
    font-weight: 800;
    letter-spacing: .5px;
    text-align: center;
    padding: 14px 16px;
    border-radius: 14px;
    font-size: clamp(18px, 2.6vw, 28px);
    position: relative;
    overflow: hidden;
    box-shadow: 0 0 0 1px rgba(255, 236, 99, 0.15) inset, 0 12px 24px rgba(0,0,0,.25);
  }

  .result[data-good="true"] {
    animation: result-flash 1200ms ease-out 1, subtle-pulse 4s ease-in-out infinite;
  }

  @keyframes result-flash { 0% { filter: brightness(1.5); } 100% { filter: brightness(1); } }
  @keyframes subtle-pulse { 0%,100% { transform: translateZ(0) scale(1); } 50% { transform: translateZ(0) scale(1.01); } }

  /* EXACTAMENTE 3 columnas por defecto */
  .slots {
    display: grid;
    gap: 14px;
    perspective: 800px;
    grid-template-columns: repeat(3, 1fr);
    grid-auto-rows: var(--slot-h);
  }

  /* En móvil opcionalmente baja a 2 para no apretar demasiado */
  @media (max-width: 640px) {
    .slots {
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
    }
    .slot { padding: 8px; border-radius: 14px; }
  }

  /* Reel */
  .slot {
    background: linear-gradient(180deg, var(--glass), transparent 120%),
                radial-gradient(120% 120% at 50% -10%, rgba(255,255,255,.06), transparent 60%);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 16px;
    padding: 10px;
    height: var(--slot-h);
    min-height: var(--slot-h);
    position: relative;
    overflow: hidden;
    box-shadow:
      0 2px 6px rgba(0,0,0,.25),
      inset 0 0 0 1px rgba(255,255,255,.06);
    transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease;
    will-change: transform;
  }

  .slot:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 24px rgba(0,0,0,.35), inset 0 0 0 1px rgba(255,255,255,.1);
    border-color: rgba(255,255,255,0.2);
  }

  .slotImage {
    aspect-ratio: 1/1;
    max-width: 86%;
    max-height: 86%;
    object-fit: contain;
    image-rendering: auto;
    filter: drop-shadow(0 4px 8px rgba(0,0,0,.35));
  }

  .result[data-good="true"]::after {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    background:
      radial-gradient(6px 6px at 20% 30%, var(--accent) 40%, transparent 41%),
      radial-gradient(6px 6px at 80% 40%, #fff 40%, transparent 41%),
      radial-gradient(6px 6px at 60% 70%, var(--accent) 40%, transparent 41%),
      radial-gradient(6px 6px at 35% 80%, #fff 40%, transparent 41%);
    opacity: .6;
    animation: confetti-fall 1100ms ease-out 1;
  }
  @keyframes confetti-fall { from { transform: translateY(-12%); opacity: 0; } to { transform: translateY(0%);  opacity: .6; } }

  /* === Responsive grid for reels === */
  .reels-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr)); /* default 3 reels */
    gap: 16px;
    align-items: stretch;
  }

  /* Mobile: 2 reels side by side */
  @media (max-width: 640px) {
    .reels-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px;
    }
  }

  /* Desktop/wide: allow 4 reels layout if there are 4 items */
  @media (min-width: 1024px) {
    .reels-grid {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }
  }

  /* Make each slot stretch within its grid cell */
  .reels-grid .slot {
    display: flex;
    align-items: stretch;
  }

`