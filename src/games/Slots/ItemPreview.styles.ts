import styled from "styled-components";

/**
 * Allow multiplier balloons to appear ABOVE the small tiles.
 * - No clipping: overflow: visible on each tile and inner icon container.
 * - Nudge the image upward so the yellow "x" badge sticks out.
 * - Keep a little top margin for breathing room.
 */
export const StyledItemPreview = styled.div`
  --accent: #ffec63;

  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 6px; /* space so badges can float above without colliding */

  & > div {
    position: relative;
    width: 56px;
    aspect-ratio: 1/1.25;
    border-radius: 10px;
    border: 1px solid rgba(255,255,255,0.14);
    background: rgba(255,255,255,0.05);
    display: grid;
    place-items: center;
    /* IMPORTANT: let the badge/icon go outside the box */
    overflow: visible;
  }

  & > div.hidden {
    opacity: .45;
    filter: grayscale(.3);
  }

  & > div > .icon {
    display: grid;
    place-items: center;
    height: 100%;
    width: 100%;
    overflow: visible; /* allow protrusion */
  }

  & > div > .icon > .slotImage {
    width: 78%;
    height: 78%;
    object-fit: contain;
    filter: drop-shadow(0 2px 6px rgba(0,0,0,.35));
    /* Lift the image slightly so the yellow badge sits above the frame */
    transform: translateY(-8%);
  }

  /* If you use our separate multiplier pill instead of baked-in art */
  & > div > .multiplier {
    position: absolute;
    right: 2px;
    top: -8px;  /* sits ABOVE the rounded tile */
    z-index: 2;
    color: #111;
    background: var(--accent);
    border-radius: 999px;
    padding: 2px 6px;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: .2px;
    box-shadow: 0 2px 6px rgba(0,0,0,.25);
  }
`
