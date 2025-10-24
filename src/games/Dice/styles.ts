import styled from "styled-components";

export const Container = styled.div`
  color: white;
  user-select: none;
  width: min(100vw, 420px);
  font-size: 20px;
`

export const Stats = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  width: 100%;
  max-width: 350px;

  & > div {
    padding: 15px 10px;
    text-align: center;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.1);

    div:first-child {
      font-weight: bold;
      font-size: 18px;
      color: #ffffff;
      margin-bottom: 5px;
    }

    div:last-child {
      font-size: 12px;
      opacity: 0.7;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
  }
`

export const RollUnder = styled.div`
  display: flex;
  color: white;
  margin: 0;

  & > div {
    margin: 0 auto;
    border-radius: 15px;
    text-align: center;
    padding: 15px;
    background: rgba(255, 255, 255, 0.05);
    border: 2px solid rgba(255, 255, 255, 0.1);

    & > div:first-child {
      font-weight: bold;
      font-size: 48px;
      font-variant-numeric: tabular-nums;
      color: #ffd700;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
    }

    & > div:last-child {
      font-size: 14px;
      opacity: 0.8;
      margin-top: 5px;
    }
  }
`

export const Result = styled.div`
  @keyframes result-appear {
    from {
      transform: scale(0);
    }
    to {
      transform: scale(1);
    }
  }

  transform: translateX(-50%);
  position: absolute;
  top: -50px;
  transition: left .3s ease;

  & > div {
    animation: result-appear .25s cubic-bezier(0.18, 0.89, 0.32, 1.28);
    transform-origin: bottom;
    background: #ffffffCC;
    backdrop-filter: blur(50px);
    border-radius: 5px;
    padding: 5px;
    font-weight: bold;
    width: 50px;
    text-align: center;
    color: black;
  }

  & > div::after {
    content: "";
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -10px;
    border-width: 10px 10px 0px 10px;
    border-style: solid;
    border-color: #ffffffCC transparent transparent transparent;
  }

`
