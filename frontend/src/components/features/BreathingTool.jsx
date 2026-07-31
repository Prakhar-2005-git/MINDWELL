import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useTransform, animate, useMotionValueEvent } from 'framer-motion';

const levels = [
  { title: 'Settle in', detail: 'A gentle 4-4 rhythm', cycle: 12, inhale: 4, hold: 4, exhale: 4 },
  { title: 'Find your rhythm', detail: 'The classic 4-7-8 breath', cycle: 19, inhale: 4, hold: 7, exhale: 8 },
  { title: 'Deep release', detail: 'A slower 5-5-10 reset', cycle: 20, inhale: 5, hold: 5, exhale: 10 }
];

const BreathingTool = () => {
  const [selected, setSelected] = useState(null);
  const [seconds, setSeconds] = useState(4);
  const [phase, setPhase] = useState('Inhale');

  // useMotionValue tracks the elapsed time of the current cycle fluidly
  const cycleTime = useMotionValue(0);

  const cycle = selected?.cycle || 19;
  const inhaleTime = selected?.inhale || 4;
  const holdTime = selected?.hold || 7;
  const exhaleTime = selected?.exhale || 8;

  // Build the coordinate timeline for the triangle
  const inputPoints = [0, inhaleTime, inhaleTime + holdTime];
  const xPoints = [-115, 0, 115];
  const yPoints = [85, -95, 85];

  if (exhaleTime > 0) {
    inputPoints.push(cycle);
    xPoints.push(-115);
    yPoints.push(85);
  }

  // Smoothly transform the elapsed time into X/Y coordinates
  const ballX = useTransform(cycleTime, inputPoints, xPoints);
  const ballY = useTransform(cycleTime, inputPoints, yPoints);

  // Smoothly transform scale (Grow slightly during inhale, stay, then shrink back)
  const scaleInputPoints = [0, inhaleTime / 2, inhaleTime, inhaleTime + holdTime];
  const scalePoints = [1, 1.1, 1, 1];
  
  if (exhaleTime > 0) {
    scaleInputPoints.push(cycle);
    scalePoints.push(1);
  }
  const ballScale = useTransform(cycleTime, scaleInputPoints, scalePoints);

  // Drive the animation loop
  useEffect(() => {
    if (!selected) return;
    
    // Reset back to start
    cycleTime.set(0); 

    const controls = animate(cycleTime, cycle, {
      duration: cycle,
      ease: 'linear',
      repeat: Infinity,
    });

    return () => controls.stop();
  }, [selected, cycle, cycleTime]);

  // Sync the React State (Seconds / Phase text) to the high-performance motion value
  useMotionValueEvent(cycleTime, "change", (latest) => {
    if (!selected) return;

    // Calculate countdown from cycle limit down to 1
    const remaining = Math.max(1, Math.ceil(cycle - latest));
    setSeconds(remaining);

    // Determine phase safely
    if (latest >= inhaleTime + holdTime && exhaleTime > 0) {
      setPhase('Exhale');
    } else if (latest >= inhaleTime) {
      setPhase('Hold');
    } else {
      setPhase('Inhale');
    }
  });

  return (
    <section className="breath-page">
      <div className="breath-intro">
        <p className="eyebrow">YOURBREATH</p>
        <h1>
          Come back to<br />
          <em>yourself.</em>
        </h1>
        <p>Choose a gentle practice, then let the rhythm take care of the rest.</p>
      </div>
      
      <div className="breath-layout">
        <div className="breath-levels">
          {levels.map((level, index) => (
            <button
              className={`breath-card ${selected === level ? 'selected' : ''}`}
              onClick={() => setSelected(level)}
              key={level.title}
            >
              <b>0{index + 1}</b>
              <span>
                <strong>{level.title}</strong>
                <small>{level.detail}</small>
              </span>
              <i>↗</i>
            </button>
          ))}
        </div>
        
        <div className="exercise-panel">
          {selected ? (
            <>
              <p className="eyebrow">{selected.title.toUpperCase()}</p>
              <div className="breath-stage">
                <div className="triangle-shape" />
                
                <motion.div
                  className="breath-ball"
                  style={{
                    x: ballX,
                    y: ballY,
                    scale: ballScale,
                    // Replaces the CSS transform offset to prevent Framer Motion conflicts
                    marginLeft: -20, 
                    marginTop: -20 
                  }}
                />
                
                <div className="breath-copy">
                  <strong>{phase}</strong>
                  <span>{seconds}s</span>
                  <p>
                    {phase === 'Inhale'
                      ? 'Take in a soft, steady breath.'
                      : phase === 'Hold'
                      ? 'You have got this. Stay soft.'
                      : 'Let it all gently go.'}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="exercise-empty">
              <span>○</span>
              <h2>Choose your practice</h2>
              <p>Each exercise will guide you through a simple, calming rhythm.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default BreathingTool;