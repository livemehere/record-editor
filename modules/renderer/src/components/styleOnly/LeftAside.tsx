import styled from "@emotion/styled";

export const LeftAside = styled.section`
  position: relative;
  min-width: 300px;
  max-width: 300px;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background-color: var(--darkBackground);
  padding: 14px;
  border-radius: 8px;
  img {
    width: 100%;
  }

  > .dimmed {
    position: absolute;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 1;
  }
`;
