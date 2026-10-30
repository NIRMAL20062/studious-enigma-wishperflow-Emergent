// All drawings for THE VOYAGE, as SVG markup. Flat shapes, thick ink outlines, Wispr palette.
// Original art: inspired by the flat, outlined style, never copied from anyone's files.
// Only static drawings live here; any text from game-data.js is added with textContent in game.js.

const INK = 'stroke="var(--ink)" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"';

const ART = {
  // The hero: Nirmal as a young captain. viewBox 0 0 200 360. The head alone is the portrait.
  hero() {
    return `
      <g class="hero-body">
        <ellipse cx="100" cy="346" rx="62" ry="10" fill="var(--ink)" opacity=".15"/>
        <path d="M72 250 L70 322 L95 322 L100 266 L105 322 L130 322 L128 250 Z" fill="var(--ink)" ${INK}/>
        <rect x="60" y="316" width="38" height="20" rx="9" fill="var(--coral)" ${INK}/>
        <rect x="102" y="316" width="38" height="20" rx="9" fill="var(--coral)" ${INK}/>
        <path d="M62 132 L42 152 L34 224 L54 226 L64 166 Z" fill="var(--green)" ${INK}/>
        <path d="M138 132 L158 152 L166 224 L146 226 L136 166 Z" fill="var(--green)" ${INK}/>
        <circle cx="44" cy="232" r="11" fill="#D9A27A" ${INK}/>
        <circle cx="156" cy="232" r="11" fill="#D9A27A" ${INK}/>
        <path d="M60 130 Q100 118 140 130 L156 254 L112 256 L100 176 L88 256 L44 254 Z" fill="var(--green)" ${INK}/>
        <path d="M86 130 L100 176 L114 130 Z" fill="var(--cream)" ${INK}/>
        <rect x="58" y="200" width="84" height="12" rx="4" fill="var(--orange)" ${INK}/>
        <circle cx="122" cy="160" r="4" fill="var(--orange)"/>
        <circle cx="122" cy="182" r="4" fill="var(--orange)"/>
      </g>
      <g class="hero-scarf">
        <path d="M68 120 Q100 136 132 120 L136 136 Q100 152 64 136 Z" fill="var(--orange)" ${INK}/>
        <path d="M126 128 Q160 122 182 98 Q176 132 142 146 Z" fill="var(--orange)" ${INK}/>
      </g>
      <g class="hero-head">
        <path d="M58 76 Q52 18 100 16 Q150 14 146 78 Z" fill="var(--ink)"/>
        <ellipse cx="100" cy="80" rx="40" ry="44" fill="#D9A27A" ${INK}/>
        <path d="M56 76 L62 40 L76 56 L82 26 L96 50 L106 22 L116 50 L130 30 L134 56 L148 46 L144 80 Q138 46 100 42 Q62 46 56 76 Z" fill="var(--ink)" ${INK}/>
        <ellipse cx="84" cy="88" rx="6" ry="8" fill="var(--ink)"/>
        <ellipse cx="116" cy="88" rx="6" ry="8" fill="var(--ink)"/>
        <circle cx="86" cy="85" r="2.2" fill="var(--cream)"/>
        <circle cx="118" cy="85" r="2.2" fill="var(--cream)"/>
        <path d="M76 74 L90 72 M110 72 L124 74" stroke="var(--ink)" stroke-width="3.5" stroke-linecap="round"/>
        <path d="M92 106 Q100 112 108 106" fill="none" stroke="var(--ink)" stroke-width="3.5" stroke-linecap="round"/>
        <ellipse cx="72" cy="100" rx="6" ry="3.5" fill="var(--coral)" opacity=".45"/>
        <ellipse cx="128" cy="100" rx="6" ry="3.5" fill="var(--coral)" opacity=".45"/>
      </g>`;
  },

  heroSvg(viewBox = "0 0 200 360") {
    return `<svg viewBox="${viewBox}" aria-hidden="true">${ART.hero()}</svg>`;
  },

  // Head and shoulders, for the HUD badge and the dialog box
  portrait() {
    return ART.heroSvg("44 10 112 128");
  },

  // The narrator is the voyage itself: a compass
  compass() {
    return `<svg viewBox="0 0 100 100" aria-hidden="true">
      <circle cx="50" cy="50" r="40" fill="var(--cream)" ${INK}/>
      <circle cx="50" cy="50" r="30" fill="none" stroke="var(--ink)" stroke-width="2" stroke-dasharray="3 6"/>
      <path d="M50 18 L58 50 L50 82 L42 50 Z" fill="var(--coral)" ${INK}/>
      <path d="M50 50 L58 50 L50 82 L42 50 Z" fill="var(--cream)" ${INK}/>
      <circle cx="50" cy="50" r="5" fill="var(--ink)"/>
    </svg>`;
  },

  ship() {
    return `
      <g class="ship-bob">
        <path d="M-34 0 L34 0 L24 18 L-24 18 Z" fill="var(--ink)" ${INK}/>
        <path d="M0 0 L0 -54" stroke="var(--ink)" stroke-width="4"/>
        <path d="M2 -50 L30 -8 L2 -8 Z" fill="var(--cream)" ${INK}/>
        <path d="M-2 -40 L-24 -8 L-2 -8 Z" fill="var(--pink)" ${INK}/>
        <path d="M0 -54 L16 -60 L0 -66 Z" fill="var(--coral)" ${INK}/>
      </g>`;
  },

  chest() {
    return `<svg viewBox="0 0 100 80" aria-hidden="true">
      <rect x="10" y="34" width="80" height="40" rx="6" fill="var(--orange)" ${INK}/>
      <path d="M10 38 Q10 8 50 8 Q90 8 90 38 Z" fill="var(--coral)" ${INK}/>
      <path d="M10 38 L90 38" ${INK}/>
      <rect x="42" y="30" width="16" height="20" rx="3" fill="var(--cream)" ${INK}/>
      <path d="M30 10 L30 74 M70 10 L70 74" stroke="var(--ink)" stroke-width="3" opacity=".35"/>
    </svg>`;
  },

  // A smooth, slightly irregular island outline around (cx, cy)
  blob(cx, cy, r, seed, scale = 1, squash = 0.72) {
    let s = seed;
    const rand = () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
    const n = 10;
    const pts = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const rr = r * scale * (0.78 + rand() * 0.34);
      pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * squash]);
    }
    const mid = (p, q) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
    let d = `M${mid(pts[n - 1], pts[0]).join(" ")}`;
    pts.forEach((p, i) => {
      const m = mid(p, pts[(i + 1) % n]);
      d += ` Q${p[0].toFixed(1)} ${p[1].toFixed(1)} ${m[0].toFixed(1)} ${m[1].toFixed(1)}`;
    });
    return d + " Z";
  },

  island(cx, cy, r, seed, squash = 0.72) {
    const trees = [[-0.35, -0.15], [0.3, -0.25], [0.05, 0.2], [-0.15, -0.35]]
      .map(([dx, dy]) => `<circle cx="${cx + dx * r}" cy="${cy + dy * r}" r="${r * 0.12}" fill="var(--leaf)" stroke="var(--ink)" stroke-width="3"/>`)
      .join("");
    return `
      <path d="${ART.blob(cx, cy, r, seed, 1.14, squash)}" fill="var(--sand)" ${INK}/>
      <path d="${ART.blob(cx, cy, r, seed + 7, 0.92, squash)}" fill="var(--green)" ${INK}/>
      ${trees}`;
  },

  waves(count, w, h, seed) {
    let s = seed;
    const rand = () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
    let out = "";
    for (let i = 0; i < count; i++) {
      const x = rand() * w;
      const y = rand() * h;
      out += `<path class="wave" style="--d:${(rand() * 3).toFixed(2)}s" d="M${x} ${y} q8 -7 16 0 t16 0" fill="none" stroke="var(--cream)" stroke-width="3" stroke-linecap="round" opacity=".8"/>`;
    }
    return out;
  },

  fog(cx, cy) {
    return `<g class="fog">
      <circle cx="${cx - 60}" cy="${cy + 10}" r="58" fill="var(--cream)"/>
      <circle cx="${cx + 10}" cy="${cy - 20}" r="72" fill="var(--cream)"/>
      <circle cx="${cx + 80}" cy="${cy + 14}" r="54" fill="var(--cream)"/>
      <rect x="${cx - 110}" y="${cy + 10}" width="230" height="56" rx="28" fill="var(--cream)"/>
    </g>`;
  },

  // Places on an island. Each drawn around (0, 0), about 160 wide.
  place(kind) {
    const d = {
      harbour: `
        <rect x="-70" y="10" width="140" height="18" rx="4" fill="var(--sand)" ${INK}/>
        <path d="M-56 28 L-56 50 M-20 28 L-20 50 M20 28 L20 50 M56 28 L56 50" ${INK}/>
        <path d="M30 10 L36 -62 L56 -62 L62 10 Z" fill="var(--cream)" ${INK}/>
        <path d="M33 -30 L59 -30" stroke="var(--coral)" stroke-width="10"/>
        <rect x="32" y="-82" width="28" height="20" rx="4" fill="var(--orange)" ${INK}/>
        <path d="M28 -82 L46 -98 L64 -82 Z" fill="var(--coral)" ${INK}/>`,
      house: `
        <rect x="-56" y="-20" width="112" height="70" rx="6" fill="var(--cream)" ${INK}/>
        <path d="M-76 -14 L0 -76 L76 -14 Z" fill="var(--orange)" ${INK}/>
        <path d="M-50 -26 L50 -26 M-34 -44 L34 -44" stroke="var(--ink)" stroke-width="3" opacity=".35"/>
        <rect x="-14" y="8" width="28" height="42" rx="4" fill="var(--ink)"/>
        <rect x="24" y="0" width="22" height="20" rx="3" fill="var(--lavender)" ${INK}/>`,
      taxi: `
        <path d="M-72 20 L-64 -8 Q-58 -20 -44 -22 L-28 -44 L32 -44 L52 -22 Q70 -20 74 -6 L76 20 Z" fill="var(--orange)" ${INK}/>
        <path d="M-22 -36 L-6 -36 L-6 -22 L-36 -22 Z M4 -36 L26 -36 L40 -22 L4 -22 Z" fill="var(--lavender)" ${INK}/>
        <rect x="-16" y="-58" width="32" height="14" rx="3" fill="var(--cream)" ${INK}/>
        <circle cx="-42" cy="22" r="16" fill="var(--ink)"/>
        <circle cx="44" cy="22" r="16" fill="var(--ink)"/>
        <circle cx="-42" cy="22" r="6" fill="var(--cream)"/>
        <circle cx="44" cy="22" r="6" fill="var(--cream)"/>`,
      lamp: `
        <path d="M-50 10 Q0 50 50 10 Z" fill="var(--orange)" ${INK}/>
        <path d="M-50 10 L50 10" ${INK}/>
        <path d="M0 6 Q-18 -24 0 -60 Q18 -24 0 6 Z" fill="var(--coral)" ${INK}/>
        <path d="M0 0 Q-7 -16 0 -34 Q7 -16 0 0 Z" fill="var(--cream)"/>`,
      school: `
        <rect x="-74" y="-30" width="148" height="80" rx="6" fill="var(--cream)" ${INK}/>
        <path d="M-84 -26 L0 -70 L84 -26 Z" fill="var(--coral)" ${INK}/>
        <rect x="-12" y="10" width="24" height="40" rx="3" fill="var(--ink)"/>
        <rect x="-56" y="-12" width="26" height="22" rx="3" fill="var(--lavender)" ${INK}/>
        <rect x="30" y="-12" width="26" height="22" rx="3" fill="var(--lavender)" ${INK}/>
        <path d="M0 -70 L0 -104" ${INK}/>
        <path d="M2 -104 L30 -96 L2 -88 Z" fill="var(--orange)" ${INK}/>`,
      tower: `
        <rect x="-36" y="-100" width="72" height="150" rx="6" fill="var(--lavender)" ${INK}/>
        <rect x="-76" y="-40" width="40" height="90" rx="5" fill="var(--pink)" ${INK}/>
        <rect x="36" y="-60" width="40" height="110" rx="5" fill="var(--cream)" ${INK}/>
        <path d="M-22 -82 h12 M10 -82 h12 M-22 -58 h12 M10 -58 h12 M-22 -34 h12 M10 -34 h12 M-22 -10 h12 M10 -10 h12" stroke="var(--ink)" stroke-width="8"/>`,
      storm: `
        <path d="M-70 -10 Q-80 -50 -40 -54 Q-30 -90 10 -80 Q40 -100 60 -66 Q90 -60 80 -26 Q90 0 60 4 L-50 4 Q-80 4 -70 -10 Z" fill="var(--ink)" stroke="var(--cream)" stroke-width="4" stroke-linejoin="round"/>
        <path d="M6 4 L-14 40 L4 40 L-10 74 L30 26 L12 26 L26 4 Z" fill="var(--orange)" stroke="var(--ink)" stroke-width="3" stroke-linejoin="round"/>`,
      college: `
        <rect x="-80" y="-20" width="160" height="70" rx="6" fill="var(--cream)" ${INK}/>
        <path d="M-40 -20 Q-40 -76 0 -76 Q40 -76 40 -20 Z" fill="var(--lavender)" ${INK}/>
        <path d="M0 -118 L8 -98 L30 -98 L12 -86 L19 -64 L0 -77 L-19 -64 L-12 -86 L-30 -98 L-8 -98 Z" fill="var(--orange)" ${INK}/>
        <path d="M-60 0 L-60 50 M-30 0 L-30 50 M30 0 L30 50 M60 0 L60 50" stroke="var(--ink)" stroke-width="5"/>`,
      fog: `
        <circle cx="-50" cy="0" r="46" fill="var(--cream)" ${INK}/>
        <circle cx="10" cy="-24" r="58" fill="var(--cream)" ${INK}/>
        <circle cx="62" cy="4" r="42" fill="var(--cream)" ${INK}/>
        <rect x="-90" y="0" width="190" height="46" rx="23" fill="var(--cream)"/>
        <path d="M-92 40 L100 40" ${INK}/>`,
      speech: `
        <path d="M-74 -70 H74 Q90 -70 90 -54 V6 Q90 22 74 22 H-6 L-34 50 L-30 22 H-74 Q-90 22 -90 6 V-54 Q-90 -70 -74 -70 Z" fill="var(--cream)" ${INK}/>
        <circle cx="-40" cy="-24" r="9" fill="var(--coral)"/>
        <circle cx="0" cy="-24" r="9" fill="var(--orange)"/>
        <circle cx="40" cy="-24" r="9" fill="var(--green)"/>`,
      signpost: `
        <path d="M-6 -90 L6 -90 L6 54 L-6 54 Z" fill="var(--sand)" ${INK}/>
        <path d="M-78 -80 L36 -80 L58 -62 L36 -44 L-78 -44 Z" fill="var(--orange)" ${INK}/>
        <path d="M78 -30 L-36 -30 L-58 -12 L-36 6 L78 6 Z" fill="var(--lavender)" ${INK}/>
        <ellipse cx="0" cy="56" rx="40" ry="8" fill="var(--ink)" opacity=".2"/>`,
      flag: `
        <path d="M-40 54 L-40 -100" stroke="var(--ink)" stroke-width="7" stroke-linecap="round"/>
        <path d="M-36 -98 Q10 -116 50 -96 Q80 -82 70 -60 Q30 -78 -36 -56 Z" fill="var(--coral)" ${INK}/>
        <circle cx="12" cy="-80" r="10" fill="var(--cream)" ${INK}/>
        <ellipse cx="-40" cy="56" rx="40" ry="8" fill="var(--ink)" opacity=".2"/>`,
      mic: `
        <rect x="-26" y="-96" width="52" height="88" rx="26" fill="var(--green)" ${INK}/>
        <path d="M-50 -40 Q-50 24 0 24 Q50 24 50 -40" fill="none" ${INK}/>
        <path d="M0 24 L0 50 M-26 50 L26 50" ${INK}/>
        <path d="M-12 -70 L12 -70 M-12 -50 L12 -50 M-12 -30 L12 -30" stroke="var(--cream)" stroke-width="4" stroke-linecap="round"/>`,
      ship: `
        <g transform="scale(2)">${ART.ship()}</g>`,
    };
    return d[kind] || d.house;
  },
};
