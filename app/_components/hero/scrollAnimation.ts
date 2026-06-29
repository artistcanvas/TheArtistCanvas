type AnimateWindowScrollOptions = {
  top: number;
  duration: number;
  onComplete?: () => void;
};

const easeOutCubic = (progress: number) => 1 - (1 - progress) ** 3;

export function animateWindowScroll({
  top,
  duration,
  onComplete,
}: AnimateWindowScrollOptions) {
  const startY = window.scrollY;
  const distance = top - startY;
  const startTime = performance.now();
  let animationFrame: number | null = null;
  let isCancelled = false;

  if (duration <= 0 || distance === 0) {
    window.scrollTo(0, top);
    onComplete?.();
    return () => {};
  }

  const animate = (time: number) => {
    if (isCancelled) return;

    const progress = Math.min((time - startTime) / duration, 1);
    const easedProgress = easeOutCubic(progress);

    window.scrollTo(0, startY + distance * easedProgress);

    if (progress < 1) {
      animationFrame = window.requestAnimationFrame(animate);
      return;
    }

    onComplete?.();
  };

  animationFrame = window.requestAnimationFrame(animate);

  return () => {
    isCancelled = true;

    if (animationFrame !== null) {
      window.cancelAnimationFrame(animationFrame);
    }
  };
}
