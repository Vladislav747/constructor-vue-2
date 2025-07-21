/** Возвращает координаты где был клик относительно канваса */
export const getElPosition = ({ evt, el }: { evt: MouseEvent; el: HTMLElement }): { xPos: number; yPos: number } => {
  const rect = el.getBoundingClientRect();
  const xPos = Math.floor(evt.clientX - rect.left) || 0;
  const yPos = Math.floor(evt.clientY - rect.top) || 0;
  return {
    xPos,
    yPos,
  };
};
