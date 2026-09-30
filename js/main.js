/**
 * Reef Guardian - Main Controller & Game Loop
 */

(function() {
  let tickInterval = null;

  window.addEventListener('DOMContentLoaded', () => {
    initGame();
  });

  function initGame() {
    // 1. Initialize Canvas
    const canvasElement = document.getElementById('reef-canvas');
    if (canvasElement) {
      window.ReefCanvas.init(
        canvasElement,
        handleCreatureClick,
        handleDebrisClick,
        handleCotsClick
      );
    }

    // 2. Initialize Simulation
    window.ReefSim.init(
      handleEventTrigger,
      handleSpeciesUnlock,
      handleSpeciesDistress
    );

    // 3. Initialize UI
    window.ReefUI.init();

    // 4. Try loading saved sanctuary
    loadSavedSanctuary();

    // 5. Start main simulation tick loop (1 second interval)
    tickInterval = setInterval(() => {
      window.ReefSim.tick(1.0);
      window.ReefCanvas.syncCreatures(window.ReefSim.speciesList);
    }, 1000);

    // 6. Smooth UI HUD sync loop
    function hudLoop() {
      window.ReefUI.updateHUD();
      requestAnimationFrame(hudLoop);
    }
    requestAnimationFrame(hudLoop);

    // 7. Auto-save every 30s
    setInterval(saveSanctuary, 30000);

    // 8. Bind global keyboard shortcuts
    bindKeyboardShortcuts();

    // 9. Audio start on first user interaction
    const startAudioOnInteraction = () => {
      window.ReefAudio.init();
      window.ReefAudio.startAmbient();
      window.removeEventListener('click', startAudioOnInteraction);
      window.removeEventListener('keydown', startAudioOnInteraction);
    };
    window.addEventListener('click', startAudioOnInteraction);
    window.addEventListener('keydown', startAudioOnInteraction);

    // Initial Welcome Message
    setTimeout(() => {
      window.ReefUI.showToast('🌊 Welcome to Reef Guardian! Click floating debris to clean up, balance water temperature, and save endangered marine species.', 'info', 7000);
    }, 800);
  }

  // Direct Click on Sea Creature
  function handleCreatureClick(species, x, y) {
    if (window.ReefAudio) window.ReefAudio.playBubble(1.2);
    window.ReefCanvas.showFloatingText(`❤️ ${species.name}`, x, y, '#00f5d4');
    window.ReefUI.openSpeciesModal(species);
  }

  // Direct Click on Drifting Plastic Debris
  function handleDebrisClick(debris, x, y) {
    window.ReefSim.collectSingleDebris(debris);
    window.ReefCanvas.showFloatingText('+$15 Purity Boost!', x, y, '#48cae4');
  }

  // Direct Click on Crown-of-Thorns Starfish
  function handleCotsClick(cots, x, y) {
    window.ReefSim.cullSingleCots(cots);
    window.ReefCanvas.showFloatingText('⭐ COTS Culled! +$25', x, y, '#ff4d6d');
  }

  // Threat or Milestone Event Triggered
  function handleEventTrigger(event) {
    window.ReefUI.showEventModal(event);
  }

  // New Species Unlocked
  function handleSpeciesUnlock(species) {
    window.ReefUI.showUnlockModal(species);
    window.ReefCanvas.syncCreatures(window.ReefSim.speciesList);
  }

  // Species in Critical Distress
  function handleSpeciesDistress(species) {
    window.ReefUI.showDistressAlert(species);
  }

  // Keyboard Shortcuts
  function bindKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      switch (e.key.toLowerCase()) {
        case ' ':
          // Space: Toggle Pause
          e.preventDefault();
          const newSpeed = window.ReefSim.speed === 0 ? 1 : 0;
          window.ReefSim.setSpeed(newSpeed);
          window.ReefUI.showToast(newSpeed === 0 ? '⏸️ Simulation Paused' : '▶️ Simulation Resumed', 'info', 1500);
          break;
        case '1':
          window.ReefSim.setSpeed(1);
          break;
        case '2':
          window.ReefSim.setSpeed(2);
          break;
        case 'c':
          window.ReefSim.performCleanupDive();
          break;
        case 's':
          window.ReefSim.deployShadeNets();
          break;
        case 'u':
          window.ReefSim.activateUpwellingPump();
          break;
        case 'o':
          window.ReefSim.outplantCorals();
          break;
        case 'p':
          window.ReefSim.dispatchPatrolBoat();
          break;
        case 'm':
          window.ReefAudio.toggleMute();
          break;
        case 'r':
          document.getElementById('btn-reefdex').click();
          break;
      }
    });
  }

  // Save Sanctuary to localStorage
  function saveSanctuary() {
    try {
      const data = {
        resources: window.ReefSim.resources,
        environment: window.ReefSim.environment,
        stats: window.ReefSim.stats,
        species: window.ReefSim.speciesList.map(s => ({
          id: s.id,
          unlocked: s.unlocked,
          population: s.population,
          health: s.health
        }))
      };
      localStorage.setItem('reef_guardian_save_v1', JSON.stringify(data));
    } catch (e) {
      console.warn('Could not save game state:', e);
    }
  }

  // Load Sanctuary from localStorage
  function loadSavedSanctuary() {
    try {
      const raw = localStorage.getItem('reef_guardian_save_v1');
      if (!raw) return;
      const data = JSON.parse(raw);
      if (data && data.resources && data.species) {
        Object.assign(window.ReefSim.resources, data.resources);
        Object.assign(window.ReefSim.environment, data.environment);
        Object.assign(window.ReefSim.stats, data.stats);

        data.species.forEach(savedSp => {
          const target = window.ReefSim.speciesList.find(s => s.id === savedSp.id);
          if (target) {
            target.unlocked = savedSp.unlocked;
            target.population = savedSp.population;
            target.health = savedSp.health;
          }
        });

        window.ReefUI.renderSpeciesGrid();
        window.ReefCanvas.syncCreatures(window.ReefSim.speciesList);
        window.ReefUI.showToast('💾 Saved reef sanctuary restored successfully!', 'info');
      }
    } catch (e) {
      console.warn('Could not load saved game state:', e);
    }
  }

  // Expose reset option
  window.resetSanctuaryProgress = function() {
    localStorage.removeItem('reef_guardian_save_v1');
    location.reload();
  };
})();
