<div align="center">

<svg width="1280" height="400" viewBox="0 0 1280 400" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="noise">
      <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="4" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
      <feBlend in="SourceGraphic" mode="multiply" result="noisy"/>
    </filter>
    <radialGradient id="glow" cx="20%" cy="100%" r="60%">
      <stop offset="0%" stop-color="#FF5555" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#05050A" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glowRight" cx="90%" cy="10%" r="40%">
      <stop offset="0%" stop-color="#F5A623" stop-opacity="0.07"/>
      <stop offset="100%" stop-color="#05050A" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#FF5555" stop-opacity="0"/>
      <stop offset="30%" stop-color="#FF5555" stop-opacity="0.5"/>
      <stop offset="70%" stop-color="#FF5555" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="#FF5555" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="needleGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FF5555"/>
      <stop offset="100%" stop-color="#FF5555" stop-opacity="0.2"/>
    </linearGradient>
    <linearGradient id="titleGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#F0EBE0"/>
      <stop offset="100%" stop-color="#9490A0"/>
    </linearGradient>
    <mask id="scanMask">
      <rect width="1280" height="400" fill="white"/>
    </mask>
  </defs>

  <!-- Base background -->
  <rect width="1280" height="400" fill="#05050A"/>

  <!-- Glow layers -->
  <rect width="1280" height="400" fill="url(#glow)"/>
  <rect width="1280" height="400" fill="url(#glowRight)"/>

  <!-- Scan lines -->
  <rect width="1280" height="400" fill="none"
    style="background: repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.015) 3px, rgba(0,0,0,0.015) 4px)"
    opacity="0.4"/>

  <!-- Guitar headstock silhouette (left side) -->
  <g opacity="0.08" transform="translate(30, 20)">
    <!-- Neck -->
    <rect x="95" y="80" width="28" height="260" rx="4" fill="#FF5555"/>
    <!-- Headstock body -->
    <ellipse cx="109" cy="72" rx="52" ry="78" fill="#FF5555"/>
    <!-- Tuning pegs -->
    <circle cx="62" cy="40" r="10" fill="none" stroke="#FF5555" stroke-width="3"/>
    <circle cx="62" cy="75" r="10" fill="none" stroke="#FF5555" stroke-width="3"/>
    <circle cx="62" cy="110" r="10" fill="none" stroke="#FF5555" stroke-width="3"/>
    <circle cx="156" cy="40" r="10" fill="none" stroke="#FF5555" stroke-width="3"/>
    <circle cx="156" cy="75" r="10" fill="none" stroke="#FF5555" stroke-width="3"/>
    <circle cx="156" cy="110" r="10" fill="none" stroke="#FF5555" stroke-width="3"/>
    <!-- Peg connectors -->
    <line x1="72" y1="40" x2="95" y2="60" stroke="#FF5555" stroke-width="2"/>
    <line x1="72" y1="75" x2="95" y2="88" stroke="#FF5555" stroke-width="2"/>
    <line x1="72" y1="110" x2="95" y2="105" stroke="#FF5555" stroke-width="2"/>
    <line x1="146" y1="40" x2="123" y2="60" stroke="#FF5555" stroke-width="2"/>
    <line x1="146" y1="75" x2="123" y2="88" stroke="#FF5555" stroke-width="2"/>
    <line x1="146" y1="110" x2="123" y2="105" stroke="#FF5555" stroke-width="2"/>
    <!-- Nut -->
    <rect x="90" y="148" width="38" height="5" rx="1" fill="#FF5555"/>
    <!-- Frets -->
    <rect x="90" y="170" width="38" height="2" rx="1" fill="#FF5555" opacity="0.5"/>
    <rect x="90" y="195" width="38" height="2" rx="1" fill="#FF5555" opacity="0.5"/>
    <rect x="90" y="218" width="38" height="2" rx="1" fill="#FF5555" opacity="0.5"/>
    <rect x="90" y="239" width="38" height="2" rx="1" fill="#FF5555" opacity="0.5"/>
    <rect x="90" y="258" width="38" height="2" rx="1" fill="#FF5555" opacity="0.5"/>
    <!-- Strings -->
    <line x1="98" y1="153" x2="98" y2="340" stroke="#FF5555" stroke-width="1" opacity="0.6"/>
    <line x1="104" y1="153" x2="104" y2="340" stroke="#FF5555" stroke-width="1" opacity="0.6"/>
    <line x1="109" y1="153" x2="109" y2="340" stroke="#FF5555" stroke-width="1.2" opacity="0.6"/>
    <line x1="114" y1="153" x2="114" y2="340" stroke="#FF5555" stroke-width="1.2" opacity="0.6"/>
    <line x1="119" y1="153" x2="119" y2="340" stroke="#FF5555" stroke-width="1.5" opacity="0.6"/>
    <line x1="124" y1="153" x2="124" y2="340" stroke="#FF5555" stroke-width="1.5" opacity="0.6"/>
  </g>

  <!-- Tuner meter arc (decorative, right side) -->
  <g transform="translate(980, 200)" opacity="0.12">
    <path d="M -160 0 A 160 160 0 0 1 160 0" fill="none" stroke="#FF5555" stroke-width="3" stroke-linecap="round"/>
    <path d="M -120 0 A 120 120 0 0 1 120 0" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>
    <!-- Tick marks -->
    <line x1="-160" y1="0" x2="-148" y2="0" stroke="#FF5555" stroke-width="2" opacity="0.6" transform="rotate(-70, 0, 0)"/>
    <line x1="-160" y1="0" x2="-148" y2="0" stroke="#FF5555" stroke-width="2" opacity="0.6" transform="rotate(-50, 0, 0)"/>
    <line x1="-160" y1="0" x2="-148" y2="0" stroke="#9490A0" stroke-width="1.5" opacity="0.4" transform="rotate(-30, 0, 0)"/>
    <line x1="-160" y1="0" x2="-148" y2="0" stroke="#9490A0" stroke-width="1.5" opacity="0.4" transform="rotate(-10, 0, 0)"/>
    <line x1="-160" y1="0" x2="-140" y2="0" stroke="#3DCA7A" stroke-width="2.5" opacity="0.8" transform="rotate(0, 0, 0)"/>
    <line x1="-160" y1="0" x2="-148" y2="0" stroke="#9490A0" stroke-width="1.5" opacity="0.4" transform="rotate(10, 0, 0)"/>
    <line x1="-160" y1="0" x2="-148" y2="0" stroke="#9490A0" stroke-width="1.5" opacity="0.4" transform="rotate(30, 0, 0)"/>
    <line x1="-160" y1="0" x2="-148" y2="0" stroke="#FF5555" stroke-width="2" opacity="0.6" transform="rotate(50, 0, 0)"/>
    <line x1="-160" y1="0" x2="-148" y2="0" stroke="#FF5555" stroke-width="2" opacity="0.6" transform="rotate(70, 0, 0)"/>
    <!-- Needle -->
    <line x1="0" y1="0" x2="0" y2="-145" stroke="url(#needleGrad)" stroke-width="2.5" stroke-linecap="round" transform="rotate(-15, 0, 0)"/>
    <circle cx="0" cy="0" r="8" fill="#FF5555" opacity="0.9"/>
    <circle cx="0" cy="0" r="4" fill="#F0EBE0"/>
  </g>

  <!-- Waveform decoration (center-bottom area) -->
  <g opacity="0.06" transform="translate(400, 340)">
    <path d="M0 20 Q15 0 30 20 Q45 40 60 20 Q75 0 90 20 Q105 40 120 20 Q135 0 150 20 Q165 40 180 20 Q195 0 210 20 Q225 40 240 20 Q255 0 270 20 Q285 40 300 20 Q315 0 330 20 Q345 40 360 20 Q375 0 390 20 Q405 40 420 20"
      fill="none" stroke="#FF5555" stroke-width="1.5"/>
  </g>

  <!-- Main title -->
  <text x="340" y="160" font-family="'Courier New', Courier, monospace" font-size="88"
    font-weight="bold" fill="url(#titleGrad)" letter-spacing="6">GuitarTune</text>

  <!-- Subtitle -->
  <text x="342" y="205" font-family="'Courier New', Courier, monospace" font-size="17"
    fill="#9490A0" letter-spacing="1">The Complete Guitar Practice Suite</text>

  <!-- Tagline -->
  <text x="342" y="232" font-family="'Courier New', Courier, monospace" font-size="14"
    fill="#4A4858" letter-spacing="0.5">100% Browser  ·  Zero Backend  ·  Zero Dependencies</text>

  <!-- Decorative accent line under title -->
  <rect x="342" y="248" width="480" height="1.5" rx="1" fill="url(#lineGrad)"/>

  <!-- Musical notes scattered bottom-left -->
  <text x="200" y="370" font-family="serif" font-size="28" fill="#FF5555" opacity="0.25">♩</text>
  <text x="240" y="355" font-family="serif" font-size="18" fill="#FF5555" opacity="0.18">♪</text>
  <text x="270" y="375" font-family="serif" font-size="22" fill="#FF5555" opacity="0.2">♫</text>
  <text x="165" y="350" font-family="serif" font-size="14" fill="#FF5555" opacity="0.15">𝄞</text>
  <text x="305" y="360" font-family="serif" font-size="16" fill="#FF5555" opacity="0.12">♩</text>

  <!-- Tech stack badges bottom-right -->
  <g transform="translate(820, 345)">
    <rect x="0" y="0" width="72" height="26" rx="5" fill="#16161F" stroke="#FF5555" stroke-opacity="0.35" stroke-width="1"/>
    <text x="36" y="17" font-family="'Courier New', monospace" font-size="10.5" fill="#FF5555" text-anchor="middle" letter-spacing="0.5">HTML</text>

    <rect x="82" y="0" width="60" height="26" rx="5" fill="#16161F" stroke="#FF5555" stroke-opacity="0.35" stroke-width="1"/>
    <text x="112" y="17" font-family="'Courier New', monospace" font-size="10.5" fill="#FF5555" text-anchor="middle" letter-spacing="0.5">CSS</text>

    <rect x="152" y="0" width="100" height="26" rx="5" fill="#16161F" stroke="#FF5555" stroke-opacity="0.35" stroke-width="1"/>
    <text x="202" y="17" font-family="'Courier New', monospace" font-size="10.5" fill="#FF5555" text-anchor="middle" letter-spacing="0.5">JavaScript</text>

    <rect x="262" y="0" width="148" height="26" rx="5" fill="#16161F" stroke="#FF5555" stroke-opacity="0.35" stroke-width="1"/>
    <text x="336" y="17" font-family="'Courier New', monospace" font-size="10.5" fill="#FF5555" text-anchor="middle" letter-spacing="0.5">Web Audio API</text>
  </g>

  <!-- Version tag -->
  <text x="1230" y="30" font-family="'Courier New', monospace" font-size="11"
    fill="#4A4858" text-anchor="end" letter-spacing="0.5">v1.0.0</text>

  <!-- Bottom border line -->
  <rect x="0" y="398" width="1280" height="2" fill="url(#lineGrad)"/>
</svg>

<br/>

![License](https://img.shields.io/badge/License-MIT-FF5555?style=for-the-badge&labelColor=0A0A12)
![Version](https://img.shields.io/badge/Version-1.0.0-FF5555?style=for-the-badge&labelColor=0A0A12)
![Zero Dependencies](https://img.shields.io/badge/Vanilla_JS-Zero_Dependencies-FF5555?style=for-the-badge&labelColor=0A0A12)
![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-FF5555?style=for-the-badge&labelColor=0A0A12)
![Platform](https://img.shields.io/badge/Platform-Browser_Only-FF5555?style=for-the-badge&labelColor=0A0A12)

<br/>

</div>

---

> *"The guitar doesn't care what DAW you run, what subscription you pay,*  
> *or what framework your frontend uses. Neither does GuitarTune."*

**GuitarTune** is a complete, professional-grade guitar practice suite that runs entirely in your browser. No servers, no accounts, no installs, no subscriptions. Every feature — from real-time pitch detection to multi-track looping — is powered exclusively by native browser APIs. It was built on a single principle: a musician's tools should belong to the musician, not to a cloud provider.

Whether you're a beginner tuning your first chord or a professional guitarist preparing for a live set, GuitarTune covers every stage of your practice workflow in one cohesive, offline-first application.

---

## 📦 Modules

<div align="center">

| # | Module | Description | Status |
|---|--------|-------------|--------|
| 01 | 🎸 **Chromatic Tuner** | Real-time pitch detection via Web Audio API with physics-based needle | ![Live](https://img.shields.io/badge/Live-3DCA7A?style=flat-square) |
| 02 | ♩ **Advanced Metronome** | BPM control, tap tempo, time signatures, subdivisions, training mode | ![Live](https://img.shields.io/badge/Live-3DCA7A?style=flat-square) |
| 03 | 🎵 **Chord Library** | 100+ chords with interactive SVG diagrams, audio preview, favorites | ![Live](https://img.shields.io/badge/Live-3DCA7A?style=flat-square) |
| 04 | 👂 **Ear Training** | Gamified note, interval and chord recognition with XP system | ![Live](https://img.shields.io/badge/Live-3DCA7A?style=flat-square) |
| 05 | 📊 **Scale Visualizer** | Interactive fretboard with 13 scale types and CAGED positions | ![Live](https://img.shields.io/badge/Live-3DCA7A?style=flat-square) |
| 06 | 🎛 **Capo Calculator** | Transposition assistant and capo position finder | ![Live](https://img.shields.io/badge/Live-3DCA7A?style=flat-square) |
| 07 | 📅 **Practice Journal** | Session logging, GitHub-style heatmap, streaks, progress charts | ![Live](https://img.shields.io/badge/Live-3DCA7A?style=flat-square) |
| 08 | 🔬 **Chord Detector** | Harmonic progression analysis with tension mapping and suggestions | ![Beta](https://img.shields.io/badge/Beta-5B9CF6?style=flat-square) |
| 09 | 🔴 **Loop Station** | 4-track browser looper via MediaRecorder API with overdub | ![Beta](https://img.shields.io/badge/Beta-5B9CF6?style=flat-square) |
| 10 | 🎤 **Performance Mode** | Fullscreen setlist with auto-scroll, keyboard shortcuts, tuner overlay | ![Live](https://img.shields.io/badge/Live-3DCA7A?style=flat-square) |
| 11 | 🥁 **Rhythm Trainer** | Visual strumming patterns with audio synthesis and timing score | ![Live](https://img.shields.io/badge/Live-3DCA7A?style=flat-square) |
| 12 | 🏆 **Achievements** | XP, levels, badges, daily missions, shareable progress cards | ![Live](https://img.shields.io/badge/Live-3DCA7A?style=flat-square) |
| 13 | ✍️ **Cifra Editor** | Chord chart editor with real-time rendering and auto-transposition | ![Beta](https://img.shields.io/badge/Beta-5B9CF6?style=flat-square) |
| 14 | ⚙️ **Settings & Profile** | Full customization, theme engine, data export/import | ![Live](https://img.shields.io/badge/Live-3DCA7A?style=flat-square) |

</div>

---

## 🏗 Architecture

<div align="center">

<svg width="860" height="300" viewBox="0 0 860 300" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L0,6 L8,3 z" fill="#4A4858"/>
    </marker>
    <marker id="arrowRed" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L0,6 L8,3 z" fill="#FF5555"/>
    </marker>
    <marker id="arrowGreen" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L0,6 L8,3 z" fill="#3DCA7A"/>
    </marker>
    <marker id="arrowAmber" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L0,6 L8,3 z" fill="#F5A623"/>
    </marker>
    <marker id="arrowBlue" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L0,6 L8,3 z" fill="#5B9CF6"/>
    </marker>
    <filter id="glow2">
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>

  <rect width="860" height="300" fill="#05050A" rx="12"/>
  <rect width="860" height="300" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="1" rx="12"/>

  <!-- Title -->
  <text x="430" y="28" font-family="'Courier New', monospace" font-size="11" fill="#4A4858"
    text-anchor="middle" letter-spacing="2">ARCHITECTURE OVERVIEW</text>

  <!-- Node: User / Microphone -->
  <rect x="30" y="110" width="130" height="70" rx="8" fill="#16161F" stroke="#FF5555" stroke-width="1.5"/>
  <text x="95" y="141" font-family="'Courier New', monospace" font-size="12" fill="#F0EBE0" text-anchor="middle" font-weight="bold">User</text>
  <text x="95" y="158" font-family="'Courier New', monospace" font-size="10" fill="#9490A0" text-anchor="middle">/ Microphone</text>
  <text x="95" y="172" font-family="'Courier New', monospace" font-size="9" fill="#4A4858" text-anchor="middle">input layer</text>

  <!-- Arrow: User → Web Audio -->
  <line x1="160" y1="145" x2="198" y2="145" stroke="#FF5555" stroke-width="1.5" marker-end="url(#arrowRed)"/>
  <text x="179" y="138" font-family="'Courier New', monospace" font-size="8" fill="#FF5555" text-anchor="middle">audio stream</text>

  <!-- Node: Web Audio API -->
  <rect x="200" y="110" width="130" height="70" rx="8" fill="#16161F" stroke="#F5A623" stroke-width="1.5"/>
  <text x="265" y="141" font-family="'Courier New', monospace" font-size="12" fill="#F0EBE0" text-anchor="middle" font-weight="bold">Web Audio</text>
  <text x="265" y="158" font-family="'Courier New', monospace" font-size="10" fill="#9490A0" text-anchor="middle">API</text>
  <text x="265" y="172" font-family="'Courier New', monospace" font-size="9" fill="#4A4858" text-anchor="middle">processing layer</text>

  <!-- Arrow: Web Audio → App Core -->
  <line x1="330" y1="145" x2="368" y2="145" stroke="#F5A623" stroke-width="1.5" marker-end="url(#arrowAmber)"/>
  <text x="349" y="138" font-family="'Courier New', monospace" font-size="8" fill="#F5A623" text-anchor="middle">pitch data</text>

  <!-- Node: App Core (Hero) -->
  <rect x="370" y="95" width="150" height="100" rx="10" fill="rgba(255,85,85,0.08)" stroke="#FF5555" stroke-width="2" filter="url(#glow2)"/>
  <rect x="370" y="95" width="150" height="100" rx="10" fill="none" stroke="rgba(255,85,85,0.3)" stroke-width="1" stroke-dasharray="4,3"/>
  <text x="445" y="135" font-family="'Courier New', monospace" font-size="13" fill="#FF5555" text-anchor="middle" font-weight="bold">App Core</text>
  <text x="445" y="153" font-family="'Courier New', monospace" font-size="10" fill="#FF5555" text-anchor="middle" opacity="0.7">Vanilla JS</text>
  <text x="445" y="168" font-family="'Courier New', monospace" font-size="9" fill="#4A4858" text-anchor="middle">14 modules</text>
  <text x="445" y="183" font-family="'Courier New', monospace" font-size="9" fill="#4A4858" text-anchor="middle">zero dependencies</text>

  <!-- Arrows from App Core to outputs -->
  <!-- App Core → localStorage -->
  <line x1="520" y1="125" x2="570" y2="95" stroke="#3DCA7A" stroke-width="1.5" marker-end="url(#arrowGreen)"/>
  <text x="547" y="100" font-family="'Courier New', monospace" font-size="8" fill="#3DCA7A" text-anchor="middle">persist</text>

  <!-- App Core → Canvas/SVG -->
  <line x1="520" y1="145" x2="570" y2="155" stroke="#5B9CF6" stroke-width="1.5" marker-end="url(#arrowBlue)"/>
  <text x="548" y="143" font-family="'Courier New', monospace" font-size="8" fill="#5B9CF6" text-anchor="middle">render</text>

  <!-- App Core → DOM/CSS -->
  <line x1="520" y1="168" x2="570" y2="205" stroke="#9490A0" stroke-width="1.5" marker-end="url(#arrow)"/>
  <text x="548" y="195" font-family="'Courier New', monospace" font-size="8" fill="#9490A0" text-anchor="middle">animate</text>

  <!-- Node: localStorage -->
  <rect x="572" y="60" width="125" height="60" rx="8" fill="#16161F" stroke="#3DCA7A" stroke-width="1.5"/>
  <text x="634" y="87" font-family="'Courier New', monospace" font-size="12" fill="#3DCA7A" text-anchor="middle" font-weight="bold">localStorage</text>
  <text x="634" y="103" font-family="'Courier New', monospace" font-size="9" fill="#4A4858" text-anchor="middle">persistence layer</text>

  <!-- Node: Canvas/SVG -->
  <rect x="572" y="135" width="125" height="55" rx="8" fill="#16161F" stroke="#5B9CF6" stroke-width="1.5"/>
  <text x="634" y="159" font-family="'Courier New', monospace" font-size="12" fill="#5B9CF6" text-anchor="middle" font-weight="bold">Canvas / SVG</text>
  <text x="634" y="175" font-family="'Courier New', monospace" font-size="9" fill="#4A4858" text-anchor="middle">visual layer</text>

  <!-- Node: DOM/CSS -->
  <rect x="572" y="202" width="125" height="55" rx="8" fill="#16161F" stroke="#9490A0" stroke-width="1.5"/>
  <text x="634" y="226" font-family="'Courier New', monospace" font-size="12" fill="#9490A0" text-anchor="middle" font-weight="bold">DOM / CSS</text>
  <text x="634" y="242" font-family="'Courier New', monospace" font-size="9" fill="#4A4858" text-anchor="middle">interface layer</text>

  <!-- Arrow to User Output -->
  <line x1="697" y1="163" x2="735" y2="145" stroke="#4A4858" stroke-width="1.5" marker-end="url(#arrow)"/>
  <line x1="697" y1="163" x2="735" y2="163" stroke="#4A4858" stroke-width="1.5"/>
  <line x1="697" y1="163" x2="735" y2="225" stroke="#4A4858" stroke-width="1.5"/>

  <!-- Node: Output -->
  <rect x="737" y="110" width="100" height="130" rx="8" fill="#16161F" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
  <text x="787" y="138" font-family="'Courier New', monospace" font-size="11" fill="#9490A0" text-anchor="middle" font-weight="bold">Output</text>
  <line x1="755" y1="148" x2="820" y2="148" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
  <text x="787" y="164" font-family="'Courier New', monospace" font-size="9.5" fill="#4A4858" text-anchor="middle">🖥 Visual UI</text>
  <text x="787" y="182" font-family="'Courier New', monospace" font-size="9.5" fill="#4A4858" text-anchor="middle">🔊 Audio</text>
  <text x="787" y="200" font-family="'Courier New', monospace" font-size="9.5" fill="#4A4858" text-anchor="middle">💾 Data</text>
  <text x="787" y="218" font-family="'Courier New', monospace" font-size="9.5" fill="#4A4858" text-anchor="middle">📤 Export</text>

  <!-- Bottom caption -->
  <text x="430" y="282" font-family="'Courier New', monospace" font-size="10" fill="#2A2838"
    text-anchor="middle">All processing is local. No data ever leaves your device.</text>
</svg>

*All 14 modules communicate through a shared event bus. No data ever leaves the browser.*

</div>

---

## 🚀 Quick Start

No installation. No build step. No `npm install`. No configuration. No account.

**Option 1 — Open directly (fastest)**
```bash
# Download the file and open it
# That's it. Seriously.
open index.html
```

**Option 2 — Local development server**
```bash
# Python 3
python -m http.server 8080

# Node.js
npx serve .

# PHP
php -S localhost:8080
```

**Option 3 — Deploy to Vercel (30 seconds)**
```bash
npx vercel --prod
# Your app is live at https://guitartune-xxx.vercel.app
```

> **⚠️ Microphone Permission** — The Chromatic Tuner and Ear Training modules require microphone access. When prompted by your browser, click **Allow**. No audio is ever transmitted or stored externally.

---

## 🛠 Built With

<div align="center">
<table>
<tr>
<td align="center" width="25%">
<br/>
<svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
  <path d="M4 24 Q12 8 20 24 Q28 40 36 24 Q40 16 44 24" fill="none" stroke="#FF5555" stroke-width="2" stroke-linecap="round"/>
  <circle cx="4" cy="24" r="2.5" fill="#FF5555"/>
  <circle cx="44" cy="24" r="2.5" fill="#FF5555"/>
</svg>
<br/><b>Web Audio API</b><br/>
<sub>Pitch detection · Synthesis · FFT analysis · Recording</sub>
<br/><br/>
</td>
<td align="center" width="25%">
<br/>
<svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
  <rect x="6" y="6" width="36" height="36" rx="3" fill="none" stroke="#FF5555" stroke-width="2"/>
  <line x1="6" y1="18" x2="42" y2="18" stroke="#FF5555" stroke-width="1" opacity="0.4"/>
  <line x1="6" y1="30" x2="42" y2="30" stroke="#FF5555" stroke-width="1" opacity="0.4"/>
  <line x1="18" y1="6" x2="18" y2="42" stroke="#FF5555" stroke-width="1" opacity="0.4"/>
  <line x1="30" y1="6" x2="30" y2="42" stroke="#FF5555" stroke-width="1" opacity="0.4"/>
  <circle cx="18" cy="18" r="3" fill="#FF5555"/>
  <circle cx="30" cy="30" r="3" fill="#FF5555"/>
</svg>
<br/><b>Canvas API</b><br/>
<sub>Waveforms · Heatmaps · Charts · Progress cards</sub>
<br/><br/>
</td>
<td align="center" width="25%">
<br/>
<svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
  <circle cx="24" cy="24" r="18" fill="none" stroke="#FF5555" stroke-width="2"/>
  <circle cx="24" cy="24" r="10" fill="none" stroke="#FF5555" stroke-width="1" opacity="0.4"/>
  <circle cx="24" cy="24" r="5" fill="#FF5555"/>
</svg>
<br/><b>MediaRecorder API</b><br/>
<sub>Loop station · Multi-track recording · WAV export</sub>
<br/><br/>
</td>
<td align="center" width="25%">
<br/>
<svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="24" cy="14" rx="16" ry="8" fill="none" stroke="#FF5555" stroke-width="2"/>
  <line x1="8" y1="14" x2="8" y2="34" stroke="#FF5555" stroke-width="2"/>
  <line x1="40" y1="14" x2="40" y2="34" stroke="#FF5555" stroke-width="2"/>
  <ellipse cx="24" cy="34" rx="16" ry="8" fill="none" stroke="#FF5555" stroke-width="2"/>
  <ellipse cx="24" cy="24" rx="16" ry="8" fill="none" stroke="#FF5555" stroke-width="1" opacity="0.4"/>
</svg>
<br/><b>localStorage</b><br/>
<sub>All data persisted locally · No external storage</sub>
<br/><br/>
</td>
</tr>
<tr>
<td align="center">
<br/>
<svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
  <text x="10" y="32" font-family="'Courier New', monospace" font-size="22" fill="none" stroke="#FF5555" stroke-width="1.2">{}</text>
  <line x1="22" y1="8" x2="22" y2="40" stroke="#FF5555" stroke-width="1.5" opacity="0.4"/>
</svg>
<br/><b>CSS Custom Properties</b><br/>
<sub>Design tokens · Runtime theming · 14 color variants</sub>
<br/><br/>
</td>
<td align="center">
<br/>
<svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
  <polygon points="24,6 42,16 42,32 24,42 6,32 6,16" fill="none" stroke="#FF5555" stroke-width="2"/>
  <polygon points="24,14 34,20 34,30 24,36 14,30 14,20" fill="none" stroke="#FF5555" stroke-width="1" opacity="0.4"/>
  <circle cx="24" cy="24" r="4" fill="#FF5555"/>
</svg>
<br/><b>SVG</b><br/>
<sub>Chord diagrams · Fretboard · Architecture maps</sub>
<br/><br/>
</td>
<td align="center">
<br/>
<svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
  <rect x="10" y="8" width="28" height="32" rx="3" fill="none" stroke="#FF5555" stroke-width="2"/>
  <text x="24" y="30" font-family="Georgia, serif" font-size="18" fill="#FF5555" text-anchor="middle" font-weight="bold">T</text>
  <line x1="14" y1="36" x2="34" y2="36" stroke="#FF5555" stroke-width="1" opacity="0.4"/>
</svg>
<br/><b>Google Fonts</b><br/>
<sub>Bebas Neue · Syne · JetBrains Mono</sub>
<br/><br/>
</td>
<td align="center">
<br/>
<svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
  <rect x="8" y="8" width="32" height="32" rx="3" fill="none" stroke="#FF5555" stroke-width="2"/>
  <line x1="16" y1="8" x2="10" y2="2" stroke="#FF5555" stroke-width="1.5" stroke-linecap="round"/>
  <line x1="32" y1="8" x2="38" y2="2" stroke="#FF5555" stroke-width="1.5" stroke-linecap="round"/>
  <line x1="8" y1="20" x2="2" y2="20" stroke="#FF5555" stroke-width="1.5" stroke-linecap="round"/>
  <line x1="40" y1="20" x2="46" y2="20" stroke="#FF5555" stroke-width="1.5" stroke-linecap="round"/>
  <rect x="18" y="18" width="12" height="12" rx="2" fill="none" stroke="#FF5555" stroke-width="1.5"/>
</svg>
<br/><b>Fullscreen API</b><br/>
<sub>Performance mode · Setlist display · Stage-ready UI</sub>
<br/><br/>
</td>
</tr>
</table>
</div>

---

## 🔍 Module Showcase

<details>
<summary><b>🎸 Chromatic Tuner</b> — The heart of the suite</summary>
<br/>

Real-time pitch detection using Web Audio API's `AnalyserNode` with FFT-based frequency analysis. The needle movement is driven by a custom spring physics simulation rather than CSS transitions — this gives it the authentic feel of an analog VU meter.

| Feature | Detail |
|---------|--------|
| Detection method | FFT analysis via `AnalyserNode` |
| Accuracy | ±1 cent resolution |
| Reference pitch | A4 = 430–450 Hz (user-configurable) |
| Supported tunings | Standard (EADGBe), Drop D, Open G, Open D, DADGAD |
| Needle physics | Custom spring simulation — stiffness 0.08, damping 0.75 |
| Visual zones | Red (>20¢ off) → Amber (5–20¢) → Green (±5¢) |
| Auto-detect | Identifies nearest note across full chromatic range |

</details>

<details>
<summary><b>♩ Advanced Metronome</b> — Precision timing engine</summary>
<br/>

Built entirely on the Web Audio API scheduler — not `setInterval`. This means timing accuracy within a few milliseconds regardless of browser tab activity or system load. The visual pendulum is purely CSS, synchronized to the exact beat duration via CSS custom property injection.

| Feature | Detail |
|---------|--------|
| BPM range | 20 – 300 BPM |
| Tap tempo | Calculates rolling average of last 4 taps |
| Time signatures | 2/4, 3/4, 4/4, 5/4, 6/8, 7/8 |
| Subdivisions | Quarter, eighth, triplet, sixteenth notes |
| Click sounds | Wood block, electronic, metallic (synthesized) |
| Training mode | Auto-increment BPM by +N every N bars |
| Scheduler | Web Audio API lookahead = 25ms, interval = 10ms |

</details>

<details>
<summary><b>🔴 Loop Station</b> — 4-track browser looper</summary>
<br/>

Uses `MediaRecorder API` to capture microphone input and `AudioContext` for playback synchronization. Each of the 4 tracks supports independent volume, mute, solo, and overdub. Beat quantization snaps the loop endpoint to the nearest bar boundary based on the current BPM.

| Feature | Detail |
|---------|--------|
| Tracks | 4 independent audio layers |
| Max loop length | 30 seconds per track |
| Overdub | Layer recordings on existing loops |
| Quantization | Snap to nearest bar (BPM-aware) |
| Playback speed | 0.5x / 0.75x / 1.0x (pitch-preserved) |
| Reverse | Play loop backwards in real-time |
| Export | Download mix as WAV blob |

</details>

<details>
<summary><b>🎤 Performance Mode</b> — Built for the stage</summary>
<br/>

A distraction-free fullscreen environment designed to be readable from two meters away under stage lighting. Uses the `Fullscreen API`, `KeyboardEvent` global listeners, and CSS `@media print` for setlist export. Auto-scroll speed is configurable via swipe gesture on mobile.

| Feature | Detail |
|---------|--------|
| Layout | 100% black, maximum contrast typography |
| Navigation | Arrow keys or swipe between songs |
| Auto-scroll | Configurable speed teleprompter mode |
| Tuner overlay | Opens chromatic tuner without exiting performance mode |
| Set timer | Countdown for total set duration |
| Setlist order | Drag-and-drop reordering via SortableJS |
| Keyboard shortcuts | Space, arrows, F, T, Esc |

</details>

<details>
<summary><b>🏆 Achievement System</b> — Gamified practice</summary>
<br/>

XP is tracked across all 14 modules and persisted in localStorage. Achievements are evaluated on every meaningful user interaction through a lightweight rule engine. Daily missions reset at midnight via stored timestamp comparison.

| Feature | Detail |
|---------|--------|
| XP system | Earned across all modules, cumulative |
| Levels | 50 tiers — Apprentice → Legendary |
| Badges | 8 unique achievements with unlock conditions |
| Daily missions | 5 tasks, reset at midnight, +50 to +150 XP each |
| Streak tracking | Consecutive practice days, all-time record |
| Progress card | Canvas-generated PNG for social sharing |

</details>

---

## 📁 Project Structure

```
guitartune/
├── index.html          ← Entire application (HTML + CSS + JS)
├── README.md           ← You are here
└── LICENSE             ← MIT
```

> The entire application lives in a single `index.html` file. This is not a limitation — it is the architecture. It means zero build tooling, zero bundlers, zero configuration, and zero deployment complexity.

```javascript
// Internal module pattern
const GuitarTune = {
  modules: {},

  register(name, init) {
    this.modules[name] = { init };
    return this;
  },

  boot() {
    Object.entries(this.modules).forEach(([name, mod]) => {
      try {
        mod.init();
        console.log(`[GuitarTune] ✓ ${name}`);
      } catch (e) {
        console.warn(`[GuitarTune] ✗ ${name}`, e);
      }
    });
  }
};

// Each module self-registers
GuitarTune
  .register('tuner',       initTuner)
  .register('metronome',   initMetronome)
  .register('chords',      initChords)
  // ... 11 more modules
  .boot();
```

---

## 🌐 Browser Compatibility

<div align="center">

| Browser | Tuner | Loop Station | Performance Mode | Notes |
|---------|-------|-------------|-----------------|-------|
| Chrome 90+ | ✅ | ✅ | ✅ | Full support — recommended |
| Firefox 88+ | ✅ | ✅ | ✅ | Full support |
| Safari 14.1+ | ✅ | ⚠️ | ✅ | MediaRecorder has limited codec support |
| Edge 90+ | ✅ | ✅ | ✅ | Full support |
| Mobile Chrome | ✅ | ✅ | ✅ | Microphone permission required |
| Mobile Safari | ✅ | ⚠️ | ✅ | AudioContext requires user gesture to start |
| Opera 76+ | ✅ | ✅ | ✅ | Full support |

</div>

> ⚠️ **Safari note:** `MediaRecorder` on Safari only supports `audio/mp4`. All Loop Station recordings are handled correctly but WAV export falls back to MP4 on Safari.

---

## 🗺 Roadmap

<div align="center">

<svg width="860" height="200" viewBox="0 0 860 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="roadGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#FF5555" stop-opacity="0.8"/>
      <stop offset="30%" stop-color="#FF5555" stop-opacity="0.6"/>
      <stop offset="65%" stop-color="#4A4858" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="#2A2838" stop-opacity="0.2"/>
    </linearGradient>
  </defs>

  <rect width="860" height="200" fill="#05050A" rx="10"/>
  <rect width="860" height="200" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1" rx="10"/>

  <!-- Timeline line -->
  <line x1="80" y1="100" x2="800" y2="100" stroke="url(#roadGrad)" stroke-width="2"/>

  <!-- v1.0 (current - active with pulse) -->
  <circle cx="140" cy="100" r="14" fill="rgba(255,85,85,0.15)" stroke="#FF5555" stroke-width="2"/>
  <circle cx="140" cy="100" r="8" fill="#FF5555"/>
  <circle cx="140" cy="100" r="22" fill="none" stroke="#FF5555" stroke-width="1" opacity="0.4">
    <animate attributeName="r" from="14" to="30" dur="2s" repeatCount="indefinite"/>
    <animate attributeName="opacity" from="0.5" to="0" dur="2s" repeatCount="indefinite"/>
  </circle>
  <text x="140" y="68" font-family="'Courier New', monospace" font-size="13" fill="#FF5555" text-anchor="middle" font-weight="bold">v1.0</text>
  <text x="140" y="52" font-family="'Courier New', monospace" font-size="9" fill="#FF5555" text-anchor="middle" opacity="0.7">CURRENT</text>
  <text x="140" y="128" font-family="'Courier New', monospace" font-size="10" fill="#9490A0" text-anchor="middle">Core Suite</text>
  <text x="140" y="143" font-family="'Courier New', monospace" font-size="9" fill="#4A4858" text-anchor="middle">14 Modules</text>

  <!-- v1.5 -->
  <circle cx="360" cy="100" r="12" fill="#16161F" stroke="#FF5555" stroke-width="1.5" opacity="0.7"/>
  <circle cx="360" cy="100" r="5" fill="#FF5555" opacity="0.7"/>
  <text x="360" y="68" font-family="'Courier New', monospace" font-size="13" fill="#9490A0" text-anchor="middle" font-weight="bold">v1.5</text>
  <text x="360" y="128" font-family="'Courier New', monospace" font-size="10" fill="#4A4858" text-anchor="middle">AI Recognition</text>
  <text x="360" y="143" font-family="'Courier New', monospace" font-size="9" fill="#2A2838" text-anchor="middle">Chord detection via ML</text>

  <!-- v2.0 -->
  <circle cx="580" cy="100" r="12" fill="#16161F" stroke="#4A4858" stroke-width="1.5"/>
  <circle cx="580" cy="100" r="5" fill="#4A4858"/>
  <text x="580" y="68" font-family="'Courier New', monospace" font-size="13" fill="#4A4858" text-anchor="middle" font-weight="bold">v2.0</text>
  <text x="580" y="128" font-family="'Courier New', monospace" font-size="10" fill="#4A4858" text-anchor="middle">MIDI Support</text>
  <text x="580" y="143" font-family="'Courier New', monospace" font-size="9" fill="#2A2838" text-anchor="middle">Web MIDI API integration</text>

  <!-- v3.0 -->
  <circle cx="770" cy="100" r="12" fill="#16161F" stroke="#2A2838" stroke-width="1.5"/>
  <circle cx="770" cy="100" r="5" fill="#2A2838"/>
  <text x="770" y="68" font-family="'Courier New', monospace" font-size="13" fill="#2A2838" text-anchor="middle" font-weight="bold">v3.0</text>
  <text x="770" y="128" font-family="'Courier New', monospace" font-size="10" fill="#2A2838" text-anchor="middle">Collaboration</text>
  <text x="770" y="143" font-family="'Courier New', monospace" font-size="9" fill="#2A2838" text-anchor="middle">Real-time sessions</text>

  <!-- Current label -->
  <text x="430" y="180" font-family="'Courier New', monospace" font-size="9" fill="#2A2838" text-anchor="middle">Roadmap subject to change — PRs always welcome</text>
</svg>

</div>

---

## 🤝 Contributing

Contributions are welcome. This project has three hard constraints that all PRs must respect:

> **Before submitting a PR, verify:**
> - [ ] No external dependencies were added (`node_modules` does not exist in this repo)
> - [ ] All audio is generated via Web Audio API — no audio files, no CDN samples
> - [ ] All user data persists via `localStorage` only — no external APIs, no accounts
> - [ ] The single-file architecture (`index.html`) is maintained
> - [ ] All colors reference CSS custom properties from `:root` — no hardcoded hex values
> - [ ] New modules follow the `GuitarTune.register()` pattern

```bash
# Clone
git clone https://github.com/MChiodi/guitartune.git
cd guitartune

# Develop
open index.html   # or serve locally with any static server

# There is no build step. What you edit is what ships.
```

---

## 📄 License

```
MIT License — Copyright (c) 2024 MChiodi

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software to use, copy, modify, merge, publish, distribute, sublicense,
and/or sell copies of the Software, without restriction.
```

See [LICENSE](LICENSE) for the full text.

---

<div align="center">

<svg width="500" height="2" viewBox="0 0 500 2" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="sepGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#FF5555" stop-opacity="0"/>
      <stop offset="50%" stop-color="#FF5555" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="#FF5555" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="500" height="2" fill="url(#sepGrad)" rx="1"/>
</svg>

<br/>

<sub>
  Built with obsession by
  <a href="https://github.com/MChiodi"><strong>MChiodi</strong></a>
  <br/>
  Crafted for guitarists, by a developer who wanted to practice without ads.
</sub>

<br/><br/>

<sub>
  <a href="#-quick-start">Get Started</a> ·
  <a href="#-modules">Modules</a> ·
  <a href="#-contributing">Contribute</a> ·
  <a href="#-roadmap">Roadmap</a> ·
  <a href="LICENSE">MIT License</a>
</sub>

<br/><br/>

<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <text x="0" y="20" font-family="serif" font-size="20" fill="#FF5555" opacity="0.6">♪</text>
</svg>

</div>
