import styled from 'styled-components'

/**
 * Spinner del reel cuando NO está revelado
 * - Usa --slot-h para controlar la altura del reel
 * - Máscara suave solo mientras gira
 */
export const StyledSpinner = styled.div`
  --spin-speed: .65s;
  --num-items: 5;

  position: absolute;
  inset: 0;
  overflow: hidden;
  border-radius: 12px;

  /* Mientras gira, recortamos apenas arriba y abajo para simular ventana */
  &.fast, &.slow, &:not(.stop) {
    mask: linear-gradient(to bottom, transparent 0%, #000 10%, #000 90%, transparent 100%);
    -webkit-mask: linear-gradient(to bottom, transparent 0%, #000 10%, #000 90%, transparent 100%);
  }

  .items {
    display: flex;
    flex-direction: column;
    height: calc(var(--slot-h, 220px) * var(--num-items));
    animation: spin var(--spin-speed) linear infinite;
    will-change: transform, filter;
    filter: saturate(1.1) contrast(1.02);
  }

  @keyframes spin {
    0%   { transform: translateY(0); }
    100% { transform: translateY(calc(-1 * var(--slot-h, 220px))); }
  }

  &.slow .items  { animation-duration: 1.1s; }
  &.fast .items  { animation-duration: .45s; }
  &.stop .items  { animation: none; filter: none; }

  /* Cada símbolo ocupa exactamente la altura del reel */
  .items > div {
    flex: 0 0 var(--slot-h, 220px);
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 6px;
  }

  .slotImage {
    max-width: 100%;
    max-height: calc(var(--slot-h, 220px) - 12px);
    object-fit: contain;
    display: block;
    image-rendering: auto;
  }
`

/**
 * Nota: El componente <Slot> aplica esta clase "slot" al contenedor principal.
 * Ajustamos el alto del reel aquí con media queries para que sea responsive.
 */
export const SlotRoot = styled.div`
  width: 100%;
  height: var(--slot-h, clamp(140px, 28vw, 220px));
  min-height: var(--slot-h, clamp(140px, 28vw, 220px));
  position: relative;
  overflow: hidden;
  border-radius: 12px;

  /* Móvil: reels un poco más bajos para que quepan 2 columnas cómodas */
  @media (max-width: 640px) {
    --slot-h: clamp(120px, 36vw, 200px);
  }

  /* Desktop ancho: puedes subir un poco si quieres más presencia visual */
  @media (min-width: 1280px) {
    --slot-h: clamp(180px, 22vw, 260px);
  }

  .slotImage {
    max-width: 100%;
    max-height: calc(var(--slot-h, 220px) - 12px);
    object-fit: contain;
    display: block;
  }
`
