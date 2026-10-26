/**
 * History of Flight - Main JavaScript
 * 
 * Simple, clean script for a mid-fidelity prototype.
 * 1. Loads timeline milestone data from local JSON (with local fallback).
 * 2. Renders the alternating timeline layout based on the sketch.
 * 3. Rotates 3D models slowly as the user scrolls down the page.
 */

// Fallback data in case the prototype is viewed via file:// protocol
// (Browsers may block fetch() requests over file:// due to local CORS policies)
const FALLBACK_DATA = [
  {
    id: "wright-flyer",
    year: "1903",
    title: "Wright Brothers",
    subtitle: "Wright Flyer I",
    model: "models/1903WrightFlyer.glb",
    layout: "text-left",
    summary: "Orville and Wilbur Wright completed the first successful powered, heavier-than-air controlled flight near Kitty Hawk, North Carolina.",
    stats: [
      { label: "Date", value: "Dec 17, 1903" },
      { label: "Duration", value: "12 seconds" },
      { label: "Distance", value: "120 feet" }
    ],
    details: "Constructed from spruce wood and unbleached muslin, powered by a custom 12 hp aluminum-block engine."
  },
  {
    id: "spirit-of-st-louis",
    year: "1927",
    title: "Spirit of St. Louis",
    subtitle: "Ryan NYP Monoplane",
    model: "models/SpiritOfStLouis.glb",
    layout: "model-left",
    summary: "Charles Lindbergh made the historic first solo nonstop transatlantic flight from Long Island, New York to Paris, France.",
    stats: [
      { label: "Date", value: "May 20–21, 1927" },
      { label: "Duration", value: "33.5 hours" },
      { label: "Distance", value: "3,610 miles" }
    ],
    details: "Fuel tanks were placed forward to maintain aircraft balance, requiring a periscope to see directly ahead."
  },
  {
    id: "bell-x1",
    year: "1947",
    title: "Bell X-1",
    subtitle: "Experimental Rocket Plane",
    model: "models/bell_x1.glb",
    layout: "text-left",
    summary: "Captain Charles 'Chuck' Yeager broke the sound barrier for the first time in level flight over California.",
    stats: [
      { label: "Date", value: "Oct 14, 1947" },
      { label: "Speed", value: "Mach 1.06 (700 mph)" },
      { label: "Altitude", value: "43,000 feet" }
    ],
    details: "Nicknamed 'Glamorous Glennis', the bullet-shaped airframe was engineered for stability near supersonic speeds.",
    hotspots: [
      {
        slot: "hotspot-1",
        position: "3877.952136217219m 9.264772934513871m -548.5146851082523m",
        normal: "0.010331225126509573m 0.9952583515776062m 0.0967164898164295m",
        label: "wing tip"
      },
      {
        slot: "hotspot-2",
        position: "-212.01442305928867m 1057.0928352721533m 3512.194045999083m",
        normal: "-0.9969810512408077m 0.03687389604313802m 0.06833080752759976m",
        label: "tail"
      },
      {
        slot: "hotspot-3",
        position: "-517.1752242687689m 455.4582946740086m -3700.635666978802m",
        normal: "-0.634186782188784m 0.7376673788981459m -0.23163325194491197m",
        label: "cockpit"
      }
    ]
  },
  {
    id: "space-shuttle",
    year: "1981",
    title: "Space Shuttle",
    subtitle: "NASA Orbiter Fleet",
    model: "models/Orbiter_Space_Shuttle.glb",
    layout: "model-left",
    summary: "NASA launched STS-1 (Columbia), pioneering the world's first reusable orbital winged spacecraft system.",
    stats: [
      { label: "First Flight", value: "Apr 12, 1981" },
      { label: "Orbital Speed", value: "17,500 mph" },
      { label: "Payload", value: "Up to 65,000 lbs" }
    ],
    details: "Over 24,000 ceramic thermal tiles protected the orbiter during atmospheric re-entry before gliding to a runway landing."
  }
];

/**
 * Fetch timeline data from local JSON file
 */
async function loadTimelineData() {
  try {
    const response = await fetch('data/timeline.json');
    if (!response.ok) {
      throw new Error(`HTTP status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.warn('Note: Using local fallback data (normal if opened directly via file://):', error);
    return FALLBACK_DATA;
  }
}

/**
 * Creates the HTML markup for a frameless 3D Model Viewer
 */
function createModelCardMarkup(item) {
  const hotspotsMarkup = (item.hotspots || []).map(h => `
    <button class="Hotspot" slot="${h.slot}" data-position="${h.position}" data-normal="${h.normal}" data-visibility-attribute="visible">
      <div class="HotspotAnnotation">${h.label}</div>
    </button>
  `).join('');

  return `
    <div class="timeline-col col-model">
      <div class="model-view-area">
        <model-viewer
          src="${item.model}"
          alt="3D model of ${item.title}"
          camera-controls
          touch-action="pan-y"
          interaction-prompt="none"
          shadow-intensity="1"
          exposure="1.05"
          loading="lazy"
          camera-orbit="0deg 75deg auto"
        >
          ${hotspotsMarkup}
          <div slot="poster" class="model-poster">
            <span>Loading 3D Model...</span>
          </div>
        </model-viewer>
      </div>
    </div>
  `;
}

/**
 * Creates the HTML markup for the Milestone Text card
 */
function createTextCardMarkup(item, index) {
  const statsMarkup = (item.stats || []).map(stat => `
    <div class="stat-item">
      <span class="stat-label">${stat.label}</span>
      <span class="stat-value">${stat.value}</span>
    </div>
  `).join('');

  return `
    <div class="timeline-col col-text">
      <article class="timeline-card">
        <div class="card-header">
          <span class="card-year">${item.year}</span>
          <span class="card-step-num">Milestone 0${index + 1}</span>
        </div>
        <h2 class="card-title">${item.title}</h2>
        <div class="card-subtitle">${item.subtitle}</div>
        <p class="card-summary">${item.summary}</p>
        
        ${statsMarkup ? `<div class="card-stats">${statsMarkup}</div>` : ''}
        
        ${item.details ? `<p class="card-details">${item.details}</p>` : ''}
      </article>
    </div>
  `;
}

/**
 * Render all timeline items into the page
 */
function renderTimeline(items) {
  const container = document.getElementById('timeline-rows');
  const navContainer = document.getElementById('timeline-nav');
  if (!container) return;

  container.innerHTML = '';
  if (navContainer) navContainer.innerHTML = '';

  items.forEach((item, index) => {
    // 1. Build Quick-jump nav button
    if (navContainer) {
      const navPill = document.createElement('a');
      navPill.href = `#${item.id}`;
      navPill.className = 'nav-pill';
      navPill.textContent = `${item.year} · ${item.title}`;
      navContainer.appendChild(navPill);
    }

    // 2. Build alternating timeline row
    const row = document.createElement('div');
    row.id = item.id;
    row.className = `timeline-row layout-${item.layout}`;

    const textMarkup = createTextCardMarkup(item, index);
    const modelMarkup = createModelCardMarkup(item);

    // Node & branch matching the sketch layout:
    // If layout is 'text-left': Left=Text, Right=Model, Branch to Left
    // If layout is 'model-left': Left=Model, Right=Text, Branch to Right
    let columnsHtml = '';
    if (item.layout === 'text-left') {
      columnsHtml = `
        ${textMarkup}
        <div class="timeline-node" title="${item.title}"></div>
        <div class="timeline-branch" aria-hidden="true"></div>
        ${modelMarkup}
      `;
    } else {
      columnsHtml = `
        ${modelMarkup}
        <div class="timeline-node" title="${item.title}"></div>
        <div class="timeline-branch" aria-hidden="true"></div>
        ${textMarkup}
      `;
    }

    row.innerHTML = columnsHtml;
    container.appendChild(row);
  });
}

/**
 * Continuous rotation:
 * - Rotates slowly and steadily when idle (no scroll)
 * - Accelerates rotation when the user scrolls the page
 * - Smoothly decelerates back to idle speed when scrolling stops
 */
function setupContinuousRotation() {
  let currentAngle = 0;
  let scrollBoost = 0;
  let lastScrollY = window.scrollY;

  // Base idle rotation speed (degrees per frame, ~15 deg/sec at 60fps)
  const IDLE_SPEED = 0.22;

  // Track scroll activity and accelerate
  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    const scrollDelta = Math.abs(currentScrollY - lastScrollY);
    lastScrollY = currentScrollY;

    // Boost rotation speed proportional to scroll delta
    scrollBoost += scrollDelta * 0.08;

    // Cap the maximum rotation boost so it stays smooth
    if (scrollBoost > 3.5) {
      scrollBoost = 3.5;
    }
  }, { passive: true });

  // Main animation loop
  function animate() {
    // Advance angle by idle speed plus active scroll acceleration
    currentAngle = (currentAngle + IDLE_SPEED + scrollBoost) % 360;

    // Smoothly decay scroll boost back toward 0
    scrollBoost *= 0.93;
    if (scrollBoost < 0.001) {
      scrollBoost = 0;
    }

    const viewers = document.querySelectorAll('model-viewer');
    const orbitString = `${currentAngle.toFixed(1)}deg 75deg auto`;

    viewers.forEach((viewer) => {
      // Don't interrupt if the user is actively clicking/dragging to inspect
      if (!viewer.dataset.isInteracting) {
        viewer.cameraOrbit = orbitString;
      }
    });

    requestAnimationFrame(animate);
  }

  // Prevent automated rotation from overriding manual drag interactions
  document.addEventListener('pointerdown', (e) => {
    const viewer = e.target.closest('model-viewer');
    if (viewer) {
      viewer.dataset.isInteracting = 'true';
    }
  });

  window.addEventListener('pointerup', () => {
    document.querySelectorAll('model-viewer').forEach((viewer) => {
      delete viewer.dataset.isInteracting;
    });
  });

  window.addEventListener('pointercancel', () => {
    document.querySelectorAll('model-viewer').forEach((viewer) => {
      delete viewer.dataset.isInteracting;
    });
  });

  // Start rotation loop
  requestAnimationFrame(animate);
}

/**
 * Main initialization
 */
async function init() {
  const timelineData = await loadTimelineData();
  renderTimeline(timelineData);
  setupContinuousRotation();
}

// Run once the DOM is loaded
document.addEventListener('DOMContentLoaded', init);
