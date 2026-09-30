/**
 * Reef Guardian - Ecosystem Simulation Engine
 * Computes water chemistry, temperature, species reproduction, threats, and resource economics.
 */

window.ReefSim = (function() {
  // Game Speed: 0 = paused, 1 = normal, 2 = fast
  let gameSpeed = 1;
  let gameMode = 'simulation'; // 'simulation' or 'zen'
  let elapsedGameSeconds = 0;

  // Limited Player Resources
  const resources = {
    funds: 650,       // Eco-funds ($)
    energy: 60,       // Marine Team Energy (0 - 100)
    maxEnergy: 100,
    fragments: 35,    // Nursery Coral Fragments
    solar: 85,        // Solar Battery (0 - 100)
    maxSolar: 100
  };

  // Environmental Indicators
  const environment = {
    temperature: 27.2,   // °C (danger: > 29.8°C, bleaching: > 30.5°C)
    baseSeasonTemp: 27.2,
    waterPurity: 68,     // % (0 - 100)
    coralCover: 42,      // % (0 - 100)
    algaeLevel: 18,      // % (0 - 100)
    mpaProtection: 60,   // % (0 - 100)
    bleachingSeverity: 0 // 0 to 1
  };

  // Active Environmental Modifiers
  const activeModifiers = {
    shadeSeconds: 0,
    upwellingSeconds: 0,
    heatwaveSeconds: 0,
    stormDebrisSeconds: 0,
    cotsOutbreakSeconds: 0,
    trawlerSeconds: 0,
    algaeBloomSeconds: 0
  };

  // Statistics & Milestones
  const stats = {
    daysSurvived: 0,
    debrisCollected: 0,
    cotsCulled: 0,
    coralsRestored: 0,
    speciesUnlockedCount: 4,
    peakBiodiversity: 0
  };

  // Active Species List (cloned from REEF_SPECIES_DATA)
  let speciesList = [];

  // Active Threat / Event
  let activeEvent = null;
  let eventTimer = 0;
  let nextEventCountdown = 35; // Initial event after 35 seconds

  // Callbacks
  let onEventTriggerCallback = null;
  let onSpeciesUnlockCallback = null;
  let onSpeciesDistressCallback = null;

  function init(eventCallback, unlockCallback, distressCallback) {
    onEventTriggerCallback = eventCallback;
    onSpeciesUnlockCallback = unlockCallback;
    onSpeciesDistressCallback = distressCallback;

    // Deep clone species data
    speciesList = JSON.parse(JSON.stringify(window.REEF_SPECIES_DATA));
    speciesList.forEach(sp => {
      sp.population = sp.unlocked ? sp.basePopulation : 0;
      sp.health = 100;
      sp.status = sp.unlocked ? 'Thriving' : 'Locked';
    });

    updateBiodiversity();
  }

  // Primary Tick - Called every 1.0 second (scaled by gameSpeed)
  function tick(deltaSec = 1.0) {
    if (gameSpeed === 0) return;
    const dt = deltaSec * gameSpeed;
    elapsedGameSeconds += dt;
    stats.daysSurvived = Math.floor(elapsedGameSeconds / 60); // 1 real min = 1 sanctuary day

    // 1. Resource Regeneration
    regenerateResources(dt);

    // 2. Environmental Physics & Climate
    updateEnvironment(dt);

    // 3. Species Ecology & Population Dynamics
    updateSpeciesEcology(dt);

    // 4. Biodiversity Index & Progressive Unlocks
    updateBiodiversity();

    // 5. Threat Events & Random Incursions (if not in Zen mode)
    if (gameMode !== 'zen') {
      updateEvents(dt);
    }

    // 6. Occasional ambient debris drift
    if (Math.random() < 0.08 * dt * (1 - environment.waterPurity / 120)) {
      if (window.ReefCanvas) window.ReefCanvas.spawnDebris();
    }
  }

  function regenerateResources(dt) {
    // Energy recharges from rested volunteers (+1.2/sec)
    resources.energy = Math.min(resources.maxEnergy, resources.energy + 1.2 * dt);

    // Solar battery recharges
    resources.solar = Math.min(resources.maxSolar, resources.solar + 0.8 * dt);

    // Nursery fragments slow natural growth
    if (environment.waterPurity > 50 && environment.temperature < 29.8) {
      if (Math.random() < 0.15 * dt) {
        resources.fragments = Math.min(80, resources.fragments + 1);
      }
    }

    // Eco-funds passive generation: based on thriving species and eco appeal
    let totalAppeal = 0;
    speciesList.forEach(sp => {
      if (sp.unlocked && sp.population > 0) {
        totalAppeal += ((sp.effects && sp.effects.ecoAppeal) || 5) * (sp.population / sp.basePopulation);
        if (sp.effects && sp.effects.grantEarningRate) {
          totalAppeal += sp.effects.grantEarningRate;
        }
      }
    });

    // Baseline grant + eco-tourism
    const fundGain = (1.5 + totalAppeal * 0.04) * dt;
    resources.funds = Math.round((resources.funds + fundGain) * 10) / 10;
  }

  function updateEnvironment(dt) {
    // A. Temperature dynamics
    // Natural seasonal drift (smooth sine wave)
    const seasonalOffset = Math.sin(elapsedGameSeconds * 0.005) * 1.5;
    let targetTemp = environment.baseSeasonTemp + seasonalOffset;

    // Heatwave threat modifier
    if (activeModifiers.heatwaveSeconds > 0) {
      activeModifiers.heatwaveSeconds -= dt;
      targetTemp += 2.8; // Dangerous heatwave!
    }

    // Cooling interventions
    if (activeModifiers.shadeSeconds > 0) {
      activeModifiers.shadeSeconds -= dt;
      targetTemp -= 2.2;
    }
    if (activeModifiers.upwellingSeconds > 0) {
      activeModifiers.upwellingSeconds -= dt;
      targetTemp -= 1.8;
    }

    // Approach target temperature smoothly
    environment.temperature += (targetTemp - environment.temperature) * (0.05 * dt);
    environment.temperature = Math.round(environment.temperature * 10) / 10;

    // Check Coral Bleaching Threshold (> 30.2°C)
    if (environment.temperature > 30.2) {
      const excess = (environment.temperature - 30.2);
      environment.bleachingSeverity = Math.min(1.0, environment.bleachingSeverity + excess * 0.04 * dt);
      // Bleaching directly erodes living coral cover
      environment.coralCover = Math.max(5, environment.coralCover - 0.25 * environment.bleachingSeverity * dt);
    } else {
      // Corals recover slowly if temperature is benign and purity is adequate
      if (environment.waterPurity > 55) {
        environment.bleachingSeverity = Math.max(0, environment.bleachingSeverity - 0.02 * dt);
      }
    }

    // B. Water Purity dynamics
    let purityDelta = 0;
    // Degraded by debris / runoff
    purityDelta -= 0.15; // Natural ambient turbidity

    if (activeModifiers.stormDebrisSeconds > 0) {
      activeModifiers.stormDebrisSeconds -= dt;
      purityDelta -= 0.6;
    }

    // Giant Clams filter seawater actively!
    const giantClam = speciesList.find(s => s.id === 'giant_clam');
    if (giantClam && giantClam.unlocked && giantClam.population > 0) {
      purityDelta += (giantClam.population * 0.02);
    }

    environment.waterPurity = Math.min(100, Math.max(10, environment.waterPurity + purityDelta * dt));

    // C. Algae Level dynamics
    let algaeGrowth = 0.2; // Natural baseline algal growth
    if (environment.waterPurity < 40) algaeGrowth += 0.3; // Nutrient runoff fosters algae
    if (activeModifiers.algaeBloomSeconds > 0) {
      activeModifiers.algaeBloomSeconds -= dt;
      algaeGrowth += 0.8;
    }

    // Herbivorous grazers consume algae: Rainbow Parrotfish & Blue Tang!
    const parrotfish = speciesList.find(s => s.id === 'rainbow_parrotfish');
    const blueTang = speciesList.find(s => s.id === 'blue_tang');
    let grazingPower = 0;
    if (parrotfish && parrotfish.unlocked) grazingPower += (parrotfish.population * 0.025);
    if (blueTang && blueTang.unlocked) grazingPower += (blueTang.population * 0.018);

    environment.algaeLevel = Math.min(100, Math.max(5, environment.algaeLevel + (algaeGrowth - grazingPower) * dt));

    // High algae actively suffocates living corals!
    if (environment.algaeLevel > 50) {
      const suffocateRate = (environment.algaeLevel - 50) * 0.005;
      environment.coralCover = Math.max(5, environment.coralCover - suffocateRate * dt);
    }

    // D. MPA Protection dynamics
    environment.mpaProtection = Math.max(15, environment.mpaProtection - 0.08 * dt);

    // Trawler threat
    if (activeModifiers.trawlerSeconds > 0) {
      activeModifiers.trawlerSeconds -= dt;
      const damage = (1 - (environment.mpaProtection / 100)) * 0.5;
      environment.coralCover = Math.max(5, environment.coralCover - damage * dt);
    }

    // E. Natural Coral Growth (when conditions are optimal)
    if (environment.temperature <= 29.5 && environment.waterPurity >= 60 && environment.algaeLevel < 35 && environment.bleachingSeverity === 0) {
      environment.coralCover = Math.min(100, environment.coralCover + 0.08 * dt);
    }
  }

  function updateSpeciesEcology(dt) {
    // Cleaner wrasse disease resistance boost
    const cleanerWrasse = speciesList.find(s => s.id === 'cleaner_wrasse');
    const diseaseShield = (cleanerWrasse && cleanerWrasse.unlocked) ? (cleanerWrasse.population * 0.01) : 0;

    // Apex shark trophic stabilizer
    const shark = speciesList.find(s => s.id === 'blacktip_shark');
    const sharkBalance = (shark && shark.unlocked && shark.population > 5);

    speciesList.forEach(sp => {
      if (!sp.unlocked) return;

      // Check environmental suitability
      let suitability = 1.0;

      // 1. Temperature Check
      const [minT, maxT] = sp.optimalTemp;
      if (environment.temperature < minT || environment.temperature > maxT) {
        const diff = Math.max(minT - environment.temperature, environment.temperature - maxT);
        suitability -= diff * 0.45;
      }

      // 2. Water Purity Check
      if (environment.waterPurity < sp.minPurity) {
        const deficit = (sp.minPurity - environment.waterPurity) / 100;
        suitability -= deficit * 0.7;
      }

      // 3. Living Coral Cover Check
      if (environment.coralCover < sp.minCoralCover) {
        const deficit = (sp.minCoralCover - environment.coralCover) / 100;
        suitability -= deficit * 0.8;
      }

      // 4. Algae smothering penalty for corals
      if (sp.category === 'coral' && environment.algaeLevel > 50) {
        suitability -= 0.4;
      }

      // Factor in disease shield and shark balance
      suitability += diseaseShield;
      if (sharkBalance) suitability += 0.1;

      // Apply to species Health (0 - 100%)
      if (suitability > 0.6) {
        sp.health = Math.min(100, sp.health + 1.5 * dt);
        // Population growth towards capacity
        if (sp.health > 80 && sp.population < sp.maxPopulation) {
          sp.population = Math.min(sp.maxPopulation, sp.population + (0.15 / sp.sensitivity) * dt);
        }
        sp.status = 'Thriving';
      } else if (suitability > 0.2) {
        sp.health = Math.max(30, sp.health - 0.5 * dt);
        sp.status = 'Stressed';
      } else {
        // Severe Distress
        sp.health = Math.max(0, sp.health - (1.8 * sp.sensitivity) * dt);
        if (sp.health <= 0) {
          sp.population = Math.max(0, sp.population - (0.3 * sp.sensitivity) * dt);
        }
        sp.status = 'Distressed';

        // Trigger distress warning if close to extinction in sanctuary
        if (sp.population < 3 && sp.population > 0 && !sp._alertTriggered) {
          sp._alertTriggered = true;
          if (onSpeciesDistressCallback) onSpeciesDistressCallback(sp);
        }
      }

      // Re-arm alert if population recovers
      if (sp.population > 8) {
        sp._alertTriggered = false;
      }

      // Round population
      sp.displayPopulation = Math.round(sp.population);
    });
  }

  function updateBiodiversity() {
    let unlockedCount = 0;
    let totalScore = 0;
    let aliveCount = 0;

    speciesList.forEach(sp => {
      if (sp.unlocked) {
        unlockedCount++;
        const popRatio = Math.min(1, sp.population / sp.basePopulation);
        const healthRatio = sp.health / 100;
        totalScore += (popRatio * 0.6 + healthRatio * 0.4);
        if (sp.population > 0) aliveCount++;
      }
    });

    // Biodiversity Index (0 - 100%)
    const maxPossibleSpecies = speciesList.length;
    const currentIndex = Math.min(100, Math.round((totalScore / maxPossibleSpecies) * 100 * 1.3));
    stats.peakBiodiversity = Math.max(stats.peakBiodiversity, currentIndex);
    stats.speciesUnlockedCount = unlockedCount;

    // Check Progressive Species Unlocks
    speciesList.forEach(sp => {
      if (!sp.unlocked && currentIndex >= sp.unlockBiodiversity) {
        // Verify prerequisite habitat requirements
        const tempSafe = environment.temperature <= sp.optimalTemp[1];
        const purityAdequate = environment.waterPurity >= (sp.minPurity - 5);
        const coralAdequate = environment.coralCover >= (sp.minCoralCover - 5);

        if (tempSafe && purityAdequate && coralAdequate) {
          unlockSpecies(sp);
        }
      }
    });

    return currentIndex;
  }

  function unlockSpecies(sp) {
    sp.unlocked = true;
    sp.population = sp.basePopulation || 10;
    sp.health = 90;
    sp.status = 'Thriving';

    if (window.ReefAudio) window.ReefAudio.playUnlockFanfare();
    if (onSpeciesUnlockCallback) onSpeciesUnlockCallback(sp);
  }

  function updateEvents(dt) {
    // If active event is running
    if (activeEvent) {
      eventTimer -= dt;
      if (eventTimer <= 0) {
        // Event ended
        activeEvent = null;
        nextEventCountdown = 40 + Math.random() * 35; // Next event in 40-75s
      }
      return;
    }

    // Countdown to next threat or milestone event
    nextEventCountdown -= dt;
    if (nextEventCountdown <= 0) {
      triggerRandomEvent();
    }
  }

  function triggerRandomEvent() {
    if (!window.REEF_EVENTS_DATA || window.REEF_EVENTS_DATA.length === 0) return;

    // Pick appropriate event
    const candidates = window.REEF_EVENTS_DATA;
    const event = candidates[Math.floor(Math.random() * candidates.length)];
    activeEvent = event;
    eventTimer = (event.effects && event.effects.duration) || 35;

    // Apply immediate event modifiers
    if (event.id === 'heatwave') {
      activeModifiers.heatwaveSeconds = eventTimer;
      if (window.ReefAudio) window.ReefAudio.playSonarPing();
    } else if (event.id === 'plastic_debris') {
      activeModifiers.stormDebrisSeconds = eventTimer;
      // Spawn extra debris on canvas
      for (let i = 0; i < 7; i++) {
        setTimeout(() => {
          if (window.ReefCanvas) window.ReefCanvas.spawnDebris();
        }, i * 400);
      }
    } else if (event.id === 'cots_outbreak') {
      activeModifiers.cotsOutbreakSeconds = eventTimer;
      // Spawn 5 COTS starfish on canvas
      for (let i = 0; i < 5; i++) {
        if (window.ReefCanvas) window.ReefCanvas.spawnCots();
      }
      if (window.ReefAudio) window.ReefAudio.playSonarPing();
    } else if (event.id === 'illegal_trawler') {
      activeModifiers.trawlerSeconds = eventTimer;
      if (window.ReefAudio) window.ReefAudio.playSonarPing();
    } else if (event.id === 'algae_bloom') {
      activeModifiers.algaeBloomSeconds = eventTimer;
    } else if (event.id === 'coral_spawning') {
      // Positive event
      resources.fragments = Math.min(100, resources.fragments + 25);
      environment.coralCover = Math.min(100, environment.coralCover + 15);
      if (window.ReefAudio) window.ReefAudio.playCoralChime();
    } else if (event.id === 'grant_milestone') {
      // Positive event
      resources.funds += 600;
      resources.energy = Math.min(resources.maxEnergy, resources.energy + 30);
      if (window.ReefAudio) window.ReefAudio.playUnlockFanfare();
    }

    if (onEventTriggerCallback) onEventTriggerCallback(event);
  }

  // --- Player Interventions (Actions) ---

  function canAfford(cost) {
    if (cost.funds && resources.funds < cost.funds) return false;
    if (cost.energy && resources.energy < cost.energy) return false;
    if (cost.fragments && resources.fragments < cost.fragments) return false;
    if (cost.solar && resources.solar < cost.solar) return false;
    return true;
  }

  function spend(cost) {
    if (cost.funds) resources.funds -= cost.funds;
    if (cost.energy) resources.energy -= cost.energy;
    if (cost.fragments) resources.fragments -= cost.fragments;
    if (cost.solar) resources.solar -= cost.solar;
  }

  // 1. Volunteer Debris Cleanup Dive
  function performCleanupDive() {
    const cost = { energy: 15 };
    if (!canAfford(cost)) return { success: false, reason: 'Need 15 Volunteer Energy' };
    spend(cost);

    environment.waterPurity = Math.min(100, environment.waterPurity + 18);
    stats.debrisCollected += 6;
    resources.funds += 30; // Recycling reward

    if (window.ReefAudio) window.ReefAudio.playDebrisCollect();
    return { success: true, message: 'Clean-up dive complete! Purity +18%, Debris cleared!' };
  }

  // 2. Deploy Solar Thermal Shade Net (-2.2°C for 45s)
  function deployShadeNets() {
    const cost = { funds: 220 };
    if (!canAfford(cost)) return { success: false, reason: 'Need $220 Eco-funds' };
    spend(cost);

    activeModifiers.shadeSeconds = 45;
    if (window.ReefCanvas) window.ReefCanvas.setShadingActive(45);
    if (window.ReefAudio) window.ReefAudio.playClick();
    return { success: true, message: 'Solar shade screens deployed! Water cooling by -2.2°C.' };
  }

  // 3. Activate Deep Cold-Water Upwelling Cooler (-1.8°C for 60s)
  function activateUpwellingPump() {
    const cost = { funds: 350, solar: 20 };
    if (!canAfford(cost)) return { success: false, reason: 'Need $350 Funds & 20 Solar Energy' };
    spend(cost);

    activeModifiers.upwellingSeconds = 60;
    if (window.ReefCanvas) window.ReefCanvas.setUpwellingActive(60);
    if (window.ReefAudio) window.ReefAudio.playBubble(1.4);
    return { success: true, message: 'Upwelling pump circulating deep trench cold water!' };
  }

  // 4. Outplant Coral Nursery Fragments
  function outplantCorals() {
    const cost = { fragments: 12, energy: 10 };
    if (!canAfford(cost)) return { success: false, reason: 'Need 12 Coral Fragments & 10 Energy' };
    spend(cost);

    environment.coralCover = Math.min(100, environment.coralCover + 12);
    stats.coralsRestored += 12;

    // Boost Staghorn & Brain Coral populations
    speciesList.forEach(sp => {
      if (sp.category === 'coral' && sp.unlocked) {
        sp.population = Math.min(sp.maxPopulation, sp.population + 10);
        sp.health = Math.min(100, sp.health + 20);
      }
    });

    if (window.ReefAudio) window.ReefAudio.playCoralChime();
    return { success: true, message: '12 Coral fragments transplanted to degraded bommies!' };
  }

  // 5. Introduce Giant Triton Snail (Biological COTS control)
  function introduceGiantTriton() {
    const cost = { funds: 300 };
    if (!canAfford(cost)) return { success: false, reason: 'Need $300 Eco-funds' };
    spend(cost);

    const triton = speciesList.find(s => s.id === 'giant_triton');
    if (triton) {
      triton.unlocked = true;
      triton.population = Math.min(triton.maxPopulation, triton.population + 4);
      triton.health = 100;
    }

    if (window.ReefAudio) window.ReefAudio.playUnlockFanfare();
    return { success: true, message: 'Giant Triton snail released! Natural predator of COTS.' };
  }

  // 6. MPA Marine Ranger Patrol Boat
  function dispatchPatrolBoat() {
    const cost = { funds: 200, energy: 12 };
    if (!canAfford(cost)) return { success: false, reason: 'Need $200 Funds & 12 Energy' };
    spend(cost);

    environment.mpaProtection = 100;
    activeModifiers.trawlerSeconds = 0; // Dismiss any trawler

    if (window.ReefAudio) window.ReefAudio.playClick();
    return { success: true, message: 'Ranger patrol dispatched! MPA protection at 100%, poachers repelled.' };
  }

  // 7. Laboratory Coral Nursery Propagation
  function propagateNursery() {
    const cost = { funds: 150 };
    if (!canAfford(cost)) return { success: false, reason: 'Need $150 Eco-funds' };
    spend(cost);

    resources.fragments = Math.min(80, resources.fragments + 18);
    if (window.ReefAudio) window.ReefAudio.playBubble(1.1);
    return { success: true, message: '+18 Micro-fragments propagated in laboratory tanks!' };
  }

  // 8. Manual Macro-Algae Weeding Dive
  function weedAlgaeDive() {
    const cost = { energy: 12 };
    if (!canAfford(cost)) return { success: false, reason: 'Need 12 Volunteer Energy' };
    spend(cost);

    environment.algaeLevel = Math.max(5, environment.algaeLevel - 25);
    if (window.ReefAudio) window.ReefAudio.playClick();
    return { success: true, message: 'Divers cleared smothering macro-algae from coral heads!' };
  }

  // Direct Click Interactions
  function collectSingleDebris(debris) {
    stats.debrisCollected++;
    environment.waterPurity = Math.min(100, environment.waterPurity + 3.5);
    resources.funds += 15;
    if (window.ReefAudio) window.ReefAudio.playDebrisCollect();
  }

  function cullSingleCots(cots) {
    stats.cotsCulled++;
    environment.coralCover = Math.min(100, environment.coralCover + 2);
    resources.funds += 25; // Bounty
    if (window.ReefAudio) window.ReefAudio.playCullSound();
  }

  // Game Control Helpers
  function setSpeed(speed) {
    gameSpeed = speed;
  }

  function setMode(mode) {
    gameMode = mode;
  }

  function isBleachingActive() {
    return environment.bleachingSeverity > 0.15;
  }

  return {
    init: init,
    tick: tick,
    setSpeed: setSpeed,
    setMode: setMode,
    isBleachingActive: isBleachingActive,
    canAfford: canAfford,
    performCleanupDive: performCleanupDive,
    deployShadeNets: deployShadeNets,
    activateUpwellingPump: activateUpwellingPump,
    outplantCorals: outplantCorals,
    introduceGiantTriton: introduceGiantTriton,
    dispatchPatrolBoat: dispatchPatrolBoat,
    propagateNursery: propagateNursery,
    weedAlgaeDive: weedAlgaeDive,
    collectSingleDebris: collectSingleDebris,
    cullSingleCots: cullSingleCots,
    get resources() { return resources; },
    get environment() { return environment; },
    get speciesList() { return speciesList; },
    get stats() { return stats; },
    get activeEvent() { return activeEvent; },
    get speed() { return gameSpeed; },
    get mode() { return gameMode; }
  };
})();
