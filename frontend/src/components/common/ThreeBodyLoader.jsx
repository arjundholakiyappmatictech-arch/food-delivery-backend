'use client';

import React from 'react';

export default function ThreeBodyLoader({
   size,
   color,
   speed,
   className = '',
}) {
   const style = {};
   if (size) style['--uib-size'] = size;
   if (color) style['--uib-color'] = color;
   if (speed) style['--uib-speed'] = speed;

   return (
      <div
         className={`three-body ${className}`.trim()}
         style={Object.keys(style).length ? style : undefined}
         role="status"
         aria-label="Loading..."
      >
         <div className="three-body__dot" />
         <div className="three-body__dot" />
         <div className="three-body__dot" />
      </div>
   );
}
