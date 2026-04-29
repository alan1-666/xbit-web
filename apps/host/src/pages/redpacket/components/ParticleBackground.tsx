import { useEffect, useRef } from 'react'

const ParticleBackground = () => {
  return (
    <div className="badge">
      <div className="particle-container">
        {[
          { x: 50, y: 0, xt: 13, yt: 12, xd: 2, yd: 2, w: 25, d: 1, o: 0.9 },
          { x: 16, y: 0, xt: 17, yt: 10, xd: 3, yd: 1, w: 39, d: 6, o: 0.5 },
          { x: 16, y: 0, xt: 17, yt: 10, xd: 3, yd: 3, w: 28, d: 4, o: 0.9 },
          { x: 66, y: 0, xt: 11, yt: 13, xd: 3, yd: 2, w: 38, d: 2, o: 0.9 },
          { x: 56, y: -3, xt: 11, yt: 10, xd: 3, yd: 1, w: 58, d: 0, o: 0.9 },
          { x: 19, y: 0, xt: 17, yt: 10, xd: 3, yd: 4, w: 45, d: 9, o: 0.7 },
          { x: 49, y: 0, xt: 17, yt: 10, xd: 3, yd: -4, w: 65, d: 2, o: 0.6 },
          { x: 20, y: 0, xt: 13, yt: 12, xd: 2, yd: 4, w: 70, d: 8, o: 0.9 },
          { x: 35, y: 3, xt: 8, yt: 16, xd: 0.5, yd: 0.8, w: 190, d: 5, o: 0.7 },
          { x: 15, y: 10, xt: 18, yt: 16, xd: 0.5, yd: 1, w: 190, d: 6, o: 0.9 },
          { x: 15, y: 30, xt: 9, yt: 22, xd: 0.5, yd: 1, w: 30, d: 9, o: 0.4 },
          { x: 4, y: 20, xt: 10, yt: 7, xd: 1.5, yd: 1.2, w: 26, d: 12, o: 0.4 },
          { x: 50, y: 40, xt: 16, yt: 6, xd: 1, yd: -2, w: 170, d: 0, o: 1 },
          { x: 60, y: 40, xt: 16, yt: 6, xd: 1, yd: 2, w: 70, d: 5, o: 0.4 },
          { x: 50, y: 50, xt: 12, yt: 7, xd: 1, yd: 1.2, w: 100, d: 7, o: 0.4 },
          { x: 70, y: 40, xt: 4, yt: 1, xd: 0.5, yd: 0.2, w: 100, d: 7, o: 0.4 },
          { x: 2, y: 50, xt: 10, yt: 7, xd: 1, yd: 1.2, w: 20, d: 7, o: 0.4 },
          { x: 4, y: 50, xt: 10, yt: 7, xd: 1.5, yd: 1.2, w: 16, d: 12, o: 0.4 },
          { x: 10, y: 40, xt: 10, yt: 17, xd: 2, yd: 1.2, w: 28, d: 7, o: 0.4 },
          { x: 70, y: 60, xt: 12, yt: 6, xd: 2, yd: 2, w: 36, d: 5, o: 0.7 },
          { x: 10, y: 60, xt: 12, yt: 16, xd: -1, yd: 2.2, w: 80, d: 5, o: 0.7 },
          { x: 10, y: 70, xt: 12, yt: 26, xd: -1, yd: 2.2, w: 110, d: 5, o: 0.7 },
          { x: 19, y: 70, xt: 12, yt: 26, xd: -1, yd: 3.2, w: 20, d: 5, o: 0.7 },
        ].map((p, idx) => (
          <span
            key={idx}
            className="pt"
            style={
              {
                '--x': p.x,
                '--y': p.y,
                '--xt': p.xt,
                '--yt': p.yt,
                '--xd': p.xd,
                '--yd': p.yd,
                '--w': p.w,
                '--d': p.d,
                '--o': p.o,
              } as React.CSSProperties
            }
          >
            <b></b>
          </span>
        ))}
      </div>
    </div>
  )
}

export default ParticleBackground
