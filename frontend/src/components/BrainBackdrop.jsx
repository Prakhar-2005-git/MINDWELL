import React from 'react';

const BrainBackdrop = () => (
  <div className="brain-backdrop" aria-hidden="true">
    <div className="brain-orbit orbit-one" /><div className="brain-orbit orbit-two" />
    <svg viewBox="0 0 500 430" role="presentation" className="brain-illustration">
      <path d="M245 390c-34 5-72-11-88-41-29 7-61-11-63-43-29-14-39-51-20-77-18-31-3-72 30-82-2-39 35-68 72-55 20-30 66-33 89-5 32-19 75-3 84 32 36 5 58 43 43 76 24 25 17 68-14 84 3 34-29 62-62 52-17 31-43 41-71 40Z" fill="currentColor"/>
      <g fill="none" stroke="currentColor" strokeWidth="9" strokeLinecap="round" opacity=".42">
        <path d="M110 153c25 7 34 22 27 47 26-5 47 8 44 32-2 16-12 26-27 32 18 17 21 40 4 60"/>
        <path d="M187 106c21 10 29 28 21 49 20 2 34 19 28 39-5 16-16 22-30 27 16 20 13 46-9 59"/>
        <path d="M268 95c-17 18-16 42 1 58-16 12-19 39-4 55 13 14 29 16 43 11-4 25 10 44 31 50"/>
        <path d="M337 132c-13 17-11 38 5 52-16 9-22 33-12 50 9 14 26 18 42 14-5 23 8 40 25 46"/>
        <path d="M122 315c20-1 38 13 39 34M216 320c4 25 21 42 45 43M299 307c4 22 19 38 42 41"/>
      </g>
      <path d="M250 73v315" fill="none" stroke="currentColor" strokeWidth="6" opacity=".25"/>
    </svg>
  </div>
);

export default BrainBackdrop;
