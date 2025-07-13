export const getCanvasPosition = (event: MouseEvent, canvasEl: HTMLDivElement): { xPos: number; yPos: number } => {
  const rect = canvasEl.getBoundingClientRect();
  const xPos = Math.floor(event.clientX - rect.left) || 0;
  const yPos = Math.floor(event.clientY - rect.top) || 0;
  return {
    xPos,
    yPos,
  };
};
