import html2canvas from 'html2canvas';

export function downloadAsImage(element: HTMLElement | undefined): void {
  if (!element) {
    console.error('Element not found.');
    return;
  }

  html2canvas(element, {
    backgroundColor: null,
    useCORS: true,
  })
    .then((canvas) => {
      canvas.toBlob((blob) => {
        if (!blob) return;

        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'capture.jpg';
        link.click();
      });
    })
    .catch((err) => {
      console.error('html2canvas failed:', err);
    });
}
