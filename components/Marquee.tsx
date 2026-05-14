/**
 * Slow-scrolling tagline strip rendered at the bottom of every page.
 * Track is doubled so the loop is seamless under `translateX(-50%)`.
 */
export function Marquee() {
  const phrases = [
    "Two reps a week",
    "Taste isn't taught",
    "Form your take",
    "Before you see anyone else's",
    "A practice for product instinct",
  ];
  const row = (
    <>
      {phrases.map((p, i) => (
        <span key={i}>{p}</span>
      ))}
    </>
  );
  return (
    <div className="marquee-strip" aria-hidden>
      <div className="marquee-track">
        {row}
        {row}
      </div>
    </div>
  );
}
