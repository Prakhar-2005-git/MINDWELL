import { useEffect, useRef } from 'react';

const FRAME_COUNT = 191;
const frameSource = (index) => `/scroll-frames/ezgif-frame-${String(index + 1).padStart(3, '0')}.jpg`;
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

// The video frames advance only while the page moves. The final frame is reached as
// soon as the footer enters the viewport, so the sequence never loops past it.
const ScrollBrain = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const frames = Array(FRAME_COUNT);
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let animationFrame;
    let renderedFrame = -1;
    let displayedFrame = 0;
    let targetFrame = 0;

    const draw = (frameNumber) => {
      const image = frames[frameNumber];
      if (!image?.complete || !image.naturalWidth) return;

      const bounds = canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.round(bounds.width * ratio);
      const height = Math.round(bounds.height * ratio);
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      const scale = Math.max(canvas.width / image.naturalWidth, canvas.height / image.naturalHeight);
      const imageWidth = image.naturalWidth;
      const imageHeight = image.naturalHeight * scale;
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = 'high';
      context.drawImage(image, (canvas.width - imageWidth) / 2, (canvas.height - imageHeight) / 2, imageWidth, imageHeight);
      renderedFrame = frameNumber;
    };

    const loadFrame = (index) => {
      const image = new Image();
      image.src = frameSource(index);
      image.onload = () => {
        if (index === Math.round(displayedFrame) || (reducedMotion && index === 0)) draw(index);
      };
      frames[index] = image;
    };

    // Load the opening frame first so there is no blank state, then warm the
    // rest of the scroll sequence in the browser cache.
    loadFrame(0);
    for (let index = 1; index < FRAME_COUNT; index += 1) loadFrame(index);

    const updateTarget = () => {
      const footer = document.querySelector('.site-footer');
      const footerTop = footer
        ? footer.getBoundingClientRect().top + window.scrollY
        : document.documentElement.scrollHeight;
      const finishAt = Math.max(footerTop - window.innerHeight, 1);
      targetFrame = clamp((window.scrollY / finishAt) * (FRAME_COUNT - 1), 0, FRAME_COUNT - 1);
    };

    const animate = () => {
      displayedFrame += (targetFrame - displayedFrame) * 0.14;
      const nextFrame = Math.round(displayedFrame);
      if (nextFrame !== renderedFrame) draw(nextFrame);
      if (Math.abs(targetFrame - displayedFrame) > 0.08) animationFrame = requestAnimationFrame(animate);
    };

    const onScroll = () => {
      updateTarget();
      cancelAnimationFrame(animationFrame);
      if (!reducedMotion) animationFrame = requestAnimationFrame(animate);
      else draw(0);
    };

    updateTarget();
    draw(0);
    if (!reducedMotion) animate();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return <canvas ref={canvasRef} className="scroll-brain" aria-hidden="true" />;
};

export default ScrollBrain;
