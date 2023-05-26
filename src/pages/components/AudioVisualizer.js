import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';

const AudioVisualizer = forwardRef(({ segments, duration }, ref) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const resizeCanvas = () => {
      canvas.width = window.innerWidth * (duration / 60000); // Adjust the scaling factor as needed
      canvas.height = window.innerHeight * 0.8; // Adjust the scaling factor as needed
    };

    const drawVisualization = () => {
      const WIDTH = canvas.width;
      const HEIGHT = canvas.height;

      ctx.clearRect(0, 0, WIDTH, HEIGHT);

      // Calculate the width of each segment based on the canvas width and total number of segments
      const segmentWidth = WIDTH / segments.length;

      segments.forEach((segment, index) => {
        // Calculate the height of the segment based on the segment's loudness
        const segmentHeight = (segment.loudness_max - segment.loudness_start) * 10;

        // Set the color of the segment based on the pitches
        ctx.fillStyle = `#1ed760`;

        // Set the border color of the segment
        ctx.strokeStyle = '#000'; // Black color for the border
        ctx.lineWidth = 1; // Border thickness in pixels

        // Draw the segment rectangle with border
        ctx.fillRect(segmentWidth * index, HEIGHT - segmentHeight, segmentWidth, segmentHeight);
        ctx.strokeRect(segmentWidth * index, HEIGHT - segmentHeight, segmentWidth, segmentHeight);
      });

      animationRef.current = requestAnimationFrame(drawVisualization);
    };

    // Resize the canvas to match the screen size
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    drawVisualization();

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [segments, duration]);

  useImperativeHandle(ref, () => ({
    restartAnimation(currentTime) {
      if (canvasRef.current) {
        const animationOffset = -(currentTime % (duration / 1000));
        const keyframes = `@keyframes dynamic-animation {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }`;

        const styleSheet = document.styleSheets[0];
        styleSheet.insertRule(keyframes, styleSheet.cssRules.length);

        canvasRef.current.style.animation = 'none';
        void canvasRef.current.offsetWidth; // Trigger a reflow
        canvasRef.current.style.animation = `dynamic-animation ${duration / 1000}s linear infinite`;
        canvasRef.current.style.animationPlayState = 'paused';
        canvasRef.current.style.animationDelay = `${animationOffset}s`;
        void canvasRef.current.offsetWidth; // Trigger a reflow
        canvasRef.current.style.animationPlayState = 'running';
      }
    },
  }));

  return <canvas ref={canvasRef} className="audio-visualizer" />;
});

export default AudioVisualizer;
