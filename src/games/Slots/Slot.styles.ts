import styled from 'styled-components'

/**
 * Uncrop fix:
 * - Remove mask by default so icons are fully visible when not spinning.
 * - Apply a MUCH shallower mask only while spinning (class .spinning).
 * - Keep full-height items so symbols never shrink.
 */
export const StyledSpinner = styled.div`
  --spin-speed: .65s;
  --num-items: 5;

  position: absolute;
  inset: 0;
  overflow: hidden;
  border-radius: 12px;

  /* No mask by default (to avoid cutting multiplier balloons) */
  mask-image: none;

  @keyframes spinning {
    0%   { transform: translateY(0); }
    100% { transform: translateY(calc(-1 * var(--slot-h) * var(--num-items))); }
  }

  .items {
    position: absolute;
    inset: 0;
    top: 0;
    display: flex;
    flex-direction: column;
    will-change: transform;
    animation: spinning var(--spin-speed) linear infinite;
    filter: none;
    /* Safe inset so icons don't touch rounded borders */
    padding: 8px 10px;
    box-sizing: border-box;
  }

  /* During spin, apply a light fade only at the very edges */
  &.spinning {
    mask-image: linear-gradient(to bottom, transparent 0%, black 4%, black 96%, transparent 100%);
  }

  &.slow .items  { animation-duration: 1.1s; }
  &.fast .items  { animation-duration: .45s; }
  &.stop .items  { animation: none; filter: none; }

  /* Each symbol fills the reel height */
  .items > div {
    flex: 0 0 var(--slot-h);
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 6px; /* a little internal breathing room */
  }
`
