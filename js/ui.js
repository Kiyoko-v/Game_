/**
 * Reef Guardian - UI Controller & Marine Encyclopedia (Reefdex)
 * Manages HUD vital displays, action station buttons, species cards, modals, and notifications.
 */

window.ReefUI = (function() {
  // DOM Elements cache
  let dom = {};

  function init() {
    cacheDomElements();
    bindEvents();
    renderSpeciesGrid();
    renderReefdexModal();
  }

  function cacheDomElements() {
    dom = {
      // Vitals
      tempValue: document.getElementById('temp-value'),
      tempBar: document.getElementById('temp-bar'),
      tempWarning: document.getElementById('temp-warning'),
      purityValue: document.getElementById('purity-value'),
      purityBar: document.getElementById('purity-bar'),
      coralValue: document.getElementById('coral-value'),
      coralBar: document.getElementById('coral-bar'),
      algaeValue: document.getElementById('algae-value'),
      algaeBar: document.getElementById('algae-bar'),
      mpaValue: document.getElementById('mpa-value'),
      mpaBar: document.getElementById('mpa-bar'),

      // Resources
      fundsValue: document.getElementById('funds-value'),
      energyValue: document.getElementById('energy-value'),
      energyBar: document.getElementById('energy-bar'),
      fragmentsValue: document.getElementById('fragments-value'),
      solarValue: document.getElementById('solar-value'),
      solarBar: document.getElementById('solar-bar'),

      // Sanctuary stats
      biodiversityValue: document.getElementById('biodiversity-value'),
      biodiversityBar: document.getElementById('biodiversity-bar'),
      speciesCountValue: document.getElementById('species-count-value'),
      daysValue: document.getElementById('days-value'),

      // Containers
      speciesGrid: document.getElementById('species-grid'),
      actionButtons: document.querySelectorAll('.action-btn'),

      // Modals
      speciesModal: document.getElementById('species-detail-modal'),
      speciesModalContent: document.getElementById('species-modal-content'),
      eventModal: document.getElementById('event-modal'),
      eventModalContent: document.getElementById('event-modal-content'),
      reefdexModal: document.getElementById('reefdex-modal'),
      guideModal: document.getElementById('guide-modal'),
      cloudModal: document.getElementById('cloud-modal'),
      leaderboardModal: document.getElementById('leaderboard-modal'),

      // Controls
      btnPause: document.getElementById('btn-pause'),
      btnPlay: document.getElementById('btn-play'),
      btnFast: document.getElementById('btn-fast'),
      btnZen: document.getElementById('btn-zen'),
      btnAudio: document.getElementById('btn-audio'),
      btnReefdex: document.getElementById('btn-reefdex'),
      btnGuide: document.getElementById('btn-guide'),
      btnCloud: document.getElementById('btn-cloud'),
      btnLeaderboard: document.getElementById('btn-leaderboard'),

      // Cloud HUD & Modal components
      cloudStatusDot: document.getElementById('cloud-status-dot'),
      cloudBtnText: document.getElementById('cloud-btn-text'),
      guardianNameInput: document.getElementById('guardian-name-input'),
      btnSaveCallsign: document.getElementById('btn-save-callsign'),
      cloudConnectionBadge: document.getElementById('cloud-connection-badge'),
      cloudLastSyncText: document.getElementById('cloud-last-sync-text'),
      btnManualCloudSave: document.getElementById('btn-manual-cloud-save'),
      btnManualCloudLoad: document.getElementById('btn-manual-cloud-load'),
      btnRefreshLeaderboard: document.getElementById('btn-refresh-leaderboard'),
      leaderboardList: document.getElementById('leaderboard-list'),

      // Toast container
      toastContainer: document.getElementById('toast-container')
    };
  }

  function bindEvents() {
    // Action station clicks
    document.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        handleActionClick(btn.getAttribute('data-action'));
      });
    });

    // Speed Controls
    if (dom.btnPause) dom.btnPause.addEventListener('click', () => setSpeed(0));
    if (dom.btnPlay) dom.btnPlay.addEventListener('click', () => setSpeed(1));
    if (dom.btnFast) dom.btnFast.addEventListener('click', () => setSpeed(2));

    // Zen Mode Toggle
    if (dom.btnZen) {
      dom.btnZen.addEventListener('click', () => {
        const isZen = window.ReefSim.mode === 'zen';
        const newMode = isZen ? 'simulation' : 'zen';
        window.ReefSim.setMode(newMode);
        dom.btnZen.classList.toggle('active', newMode === 'zen');
        showToast(newMode === 'zen' ? '🧘 Peaceful Zen Sanctuary Mode Activated' : '⚔️ Full Ecosystem Simulation Activated', 'info');
      });
    }

    // Audio Toggle
    if (dom.btnAudio) {
      dom.btnAudio.addEventListener('click', () => {
        const isMuted = window.ReefAudio.toggleMute();
        dom.btnAudio.innerHTML = isMuted ? '🔇 Sound: Off' : '🔊 Sound: On';
        dom.btnAudio.classList.toggle('muted', isMuted);
      });
    }

    // Modal Triggers
    if (dom.btnReefdex) dom.btnReefdex.addEventListener('click', openReefdex);
    if (dom.btnGuide) dom.btnGuide.addEventListener('click', () => openModal(dom.guideModal));
    if (dom.btnCloud) dom.btnCloud.addEventListener('click', openCloudModal);
    if (dom.btnLeaderboard) dom.btnLeaderboard.addEventListener('click', openLeaderboardModal);
    if (dom.btnRefreshLeaderboard) dom.btnRefreshLeaderboard.addEventListener('click', renderLeaderboard);

    // Callsign name save
    if (dom.btnSaveCallsign && dom.guardianNameInput) {
      dom.btnSaveCallsign.addEventListener('click', async () => {
        const nameVal = dom.guardianNameInput.value.trim();
        if (!nameVal) return;
        if (window.ReefFirebase && window.ReefFirebase.setGuardianName) {
          await window.ReefFirebase.setGuardianName(nameVal);
          showToast(`🛡️ Callsign updated to "${nameVal}"!`, 'success');
        }
      });
    }

    // Manual Cloud Save
    if (dom.btnManualCloudSave) {
      dom.btnManualCloudSave.addEventListener('click', () => {
        if (window.saveSanctuary) {
          window.saveSanctuary(true);
        }
      });
    }

    // Manual Cloud Load
    if (dom.btnManualCloudLoad) {
      dom.btnManualCloudLoad.addEventListener('click', async () => {
        if (window.ReefFirebase && window.ReefFirebase.loadFromCloud) {
          showToast('☁️ Fetching remote cloud save...', 'info', 2000);
          const data = await window.ReefFirebase.loadFromCloud();
          if (data) {
            window.ReefFirebase.applyCloudDataToGame(data);
            showToast('☁️ Sanctuary cloud save restored successfully!', 'success');
          } else {
            showToast('⚠️ No cloud save found or network unavailable.', 'warning');
          }
        }
      });
    }

    // Subscribe to Firebase status changes
    const setupFirebaseStatus = () => {
      if (window.ReefFirebase && window.ReefFirebase.onSyncStatusChange) {
        window.ReefFirebase.onSyncStatusChange(updateCloudStatusUI);
      }
    };
    setupFirebaseStatus();
    setTimeout(setupFirebaseStatus, 600);

    // Modal Close buttons
    document.querySelectorAll('.modal-close-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        closeAllModals();
      });
    });

    // Close on backdrop click
    document.querySelectorAll('.modal-backdrop').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeAllModals();
      });
    });
  }

  function setSpeed(speed) {
    window.ReefSim.setSpeed(speed);
    if (dom.btnPause) dom.btnPause.classList.toggle('active', speed === 0);
    if (dom.btnPlay) dom.btnPlay.classList.toggle('active', speed === 1);
    if (dom.btnFast) dom.btnFast.classList.toggle('active', speed === 2);
  }

  function handleActionClick(actionType) {
    let result = null;
    switch (actionType) {
      case 'cleanup_dive':
        result = window.ReefSim.performCleanupDive();
        break;
      case 'deploy_shade':
        result = window.ReefSim.deployShadeNets();
        break;
      case 'activate_upwelling':
        result = window.ReefSim.activateUpwellingPump();
        break;
      case 'outplant_corals':
        result = window.ReefSim.outplantCorals();
        break;
      case 'introduce_triton':
        result = window.ReefSim.introduceGiantTriton();
        break;
      case 'patrol_boat':
        result = window.ReefSim.dispatchPatrolBoat();
        break;
      case 'propagate_nursery':
        result = window.ReefSim.propagateNursery();
        break;
      case 'weed_algae':
        result = window.ReefSim.weedAlgaeDive();
        break;
    }

    if (result) {
      if (result.success) {
        showToast(result.message, 'success');
      } else {
        showToast('⚠️ ' + result.reason, 'warning');
      }
    }
  }

  // Update HUD values each frame
  function updateHUD() {
    const env = window.ReefSim.environment;
    const res = window.ReefSim.resources;
    const stats = window.ReefSim.stats;
    const speciesList = window.ReefSim.speciesList;

    // Environmental Vitals
    if (dom.tempValue) dom.tempValue.textContent = env.temperature.toFixed(1) + '°C';
    if (dom.tempBar) {
      // Map 20°C - 33°C to 0 - 100%
      const tempPct = Math.max(0, Math.min(100, ((env.temperature - 22) / 11) * 100));
      dom.tempBar.style.width = tempPct + '%';
      if (env.temperature > 30.2) {
        dom.tempBar.style.backgroundColor = '#e63946';
        if (dom.tempWarning) dom.tempWarning.style.display = 'inline-block';
      } else if (env.temperature > 29.5) {
        dom.tempBar.style.backgroundColor = '#f77f00';
        if (dom.tempWarning) dom.tempWarning.style.display = 'none';
      } else {
        dom.tempBar.style.backgroundColor = '#4cc9f0';
        if (dom.tempWarning) dom.tempWarning.style.display = 'none';
      }
    }

    if (dom.purityValue) dom.purityValue.textContent = Math.round(env.waterPurity) + '%';
    if (dom.purityBar) dom.purityBar.style.width = env.waterPurity + '%';

    if (dom.coralValue) dom.coralValue.textContent = Math.round(env.coralCover) + '%';
    if (dom.coralBar) dom.coralBar.style.width = env.coralCover + '%';

    if (dom.algaeValue) dom.algaeValue.textContent = Math.round(env.algaeLevel) + '%';
    if (dom.algaeBar) {
      dom.algaeBar.style.width = env.algaeLevel + '%';
      dom.algaeBar.style.backgroundColor = env.algaeLevel > 50 ? '#d90429' : '#52b788';
    }

    if (dom.mpaValue) dom.mpaValue.textContent = Math.round(env.mpaProtection) + '%';
    if (dom.mpaBar) dom.mpaBar.style.width = env.mpaProtection + '%';

    // Resources
    if (dom.fundsValue) dom.fundsValue.textContent = '$' + Math.floor(res.funds).toLocaleString();
    if (dom.energyValue) dom.energyValue.textContent = Math.floor(res.energy) + ' / ' + res.maxEnergy;
    if (dom.energyBar) dom.energyBar.style.width = (res.energy / res.maxEnergy * 100) + '%';
    if (dom.fragmentsValue) dom.fragmentsValue.textContent = res.fragments;
    if (dom.solarValue) dom.solarValue.textContent = Math.floor(res.solar) + '%';
    if (dom.solarBar) dom.solarBar.style.width = (res.solar / res.maxSolar * 100) + '%';

    // Sanctuary Progress
    const aliveCount = speciesList.filter(s => s.unlocked && s.population > 0).length;
    const totalCount = speciesList.length;
    if (dom.speciesCountValue) dom.speciesCountValue.textContent = `${aliveCount} / ${totalCount}`;

    let totalScore = 0;
    speciesList.forEach(sp => {
      if (sp.unlocked) {
        totalScore += (Math.min(1, sp.population / sp.basePopulation) * 0.6 + (sp.health / 100) * 0.4);
      }
    });
    const bioPct = Math.min(100, Math.round((totalScore / totalCount) * 100 * 1.3));
    if (dom.biodiversityValue) dom.biodiversityValue.textContent = bioPct + '%';
    if (dom.biodiversityBar) dom.biodiversityBar.style.width = bioPct + '%';
    if (dom.daysValue) dom.daysValue.textContent = stats.daysSurvived;

    // Refresh species cards mini-meters
    updateSpeciesCards();
  }

  // Render the interactive species grid in sanctuary drawer
  function renderSpeciesGrid() {
    if (!dom.speciesGrid) return;
    const list = window.ReefSim.speciesList;
    dom.speciesGrid.innerHTML = '';

    list.forEach(sp => {
      const card = document.createElement('div');
      card.className = `species-card ${sp.unlocked ? 'unlocked' : 'locked'}`;
      card.id = `species-card-${sp.id}`;

      if (sp.unlocked) {
        card.innerHTML = `
          <div class="species-card-header">
            <span class="species-tier-badge tier-${sp.tier}">Tier ${sp.tier}</span>
            <span class="species-status-badge status-${sp.status.toLowerCase()}">${sp.status}</span>
          </div>
          <div class="species-card-body">
            <div class="species-name">${sp.name}</div>
            <div class="species-sci">${sp.scientific}</div>
            <div class="species-role-tag">${sp.roleTag}</div>
            <div class="species-meter-row">
              <span>Pop:</span>
              <strong id="pop-${sp.id}">${sp.displayPopulation || Math.round(sp.population)}</strong>
            </div>
            <div class="species-health-track">
              <div class="species-health-fill" id="health-${sp.id}" style="width: ${sp.health}%;"></div>
            </div>
          </div>
          <button class="species-info-btn">Field Notes & Biology</button>
        `;
        card.querySelector('.species-info-btn').addEventListener('click', (e) => {
          e.stopPropagation();
          openSpeciesModal(sp);
        });
      } else {
        card.innerHTML = `
          <div class="species-card-header">
            <span class="species-tier-badge tier-${sp.tier}">Tier ${sp.tier}</span>
            <span class="species-status-badge">Locked</span>
          </div>
          <div class="species-locked-body">
            <div class="lock-icon">🔒</div>
            <div class="species-name">${sp.name}</div>
            <div class="unlock-req">${sp.unlockConditionText}</div>
          </div>
          <button class="species-info-btn">Habitat Profile</button>
        `;
        card.querySelector('.species-info-btn').addEventListener('click', (e) => {
          e.stopPropagation();
          openSpeciesModal(sp);
        });
      }

      card.addEventListener('click', () => {
        openSpeciesModal(sp);
      });

      dom.speciesGrid.appendChild(card);
    });
  }

  function updateSpeciesCards() {
    const list = window.ReefSim.speciesList;
    list.forEach(sp => {
      const card = document.getElementById(`species-card-${sp.id}`);
      if (!card) return;

      if (sp.unlocked) {
        if (card.classList.contains('locked')) {
          // Re-render when newly unlocked
          renderSpeciesGrid();
          return;
        }

        const popEl = document.getElementById(`pop-${sp.id}`);
        const healthEl = document.getElementById(`health-${sp.id}`);
        if (popEl) popEl.textContent = sp.displayPopulation || Math.round(sp.population);
        if (healthEl) {
          healthEl.style.width = sp.health + '%';
          healthEl.style.backgroundColor = sp.health > 70 ? '#00bfa5' : (sp.health > 35 ? '#ffb300' : '#ff1744');
        }

        // Status badge
        const badge = card.querySelector('.species-status-badge');
        if (badge) {
          badge.textContent = sp.status;
          badge.className = `species-status-badge status-${sp.status.toLowerCase()}`;
        }
      }
    });
  }

  // Open Species Detail Modal with rich scientific facts & lore
  function openSpeciesModal(sp) {
    if (!dom.speciesModal || !dom.speciesModalContent) return;

    dom.speciesModalContent.innerHTML = `
      <div class="modal-species-header">
        <div>
          <span class="species-tier-badge tier-${sp.tier}">Tier ${sp.tier} • ${sp.category.toUpperCase()}</span>
          <span class="iucn-badge" style="background-color: ${sp.badgeColor || '#e67e22'}">${sp.iucn}</span>
          <h2 class="modal-title">${sp.name}</h2>
          <p class="modal-subtitle"><em>${sp.scientific}</em></p>
        </div>
      </div>

      <div class="modal-species-body">
        <div class="species-role-box">
          <h4>Ecosystem Function: ${sp.role}</h4>
          <p>${sp.roleDescription}</p>
        </div>

        <div class="habitat-tolerances-grid">
          <div class="tol-item">
            <span class="tol-label">Optimal Temp:</span>
            <strong>${sp.optimalTemp[0]}°C - ${sp.optimalTemp[1]}°C</strong>
          </div>
          <div class="tol-item">
            <span class="tol-label">Min Purity:</span>
            <strong>${sp.minPurity}%</strong>
          </div>
          <div class="tol-item">
            <span class="tol-label">Min Coral Cover:</span>
            <strong>${sp.minCoralCover}%</strong>
          </div>
          <div class="tol-item">
            <span class="tol-label">Sanctuary Population:</span>
            <strong>${sp.unlocked ? (sp.displayPopulation || Math.round(sp.population)) + ' / ' + sp.maxPopulation : 'Undiscovered'}</strong>
          </div>
        </div>

        <div class="fun-facts-section">
          <h3>Biological Facts & Field Discoveries:</h3>
          <ul class="fun-facts-list">
            ${sp.funFacts.map(fact => `<li><span class="bullet">▸</span> ${fact}</li>`).join('')}
          </ul>
        </div>

        <div class="conservation-tip-box">
          <strong>Conservation Action:</strong> ${sp.conservationTip}
        </div>
      </div>
    `;

    openModal(dom.speciesModal);
    if (window.ReefAudio) window.ReefAudio.playBubble(1.1);
  }

  // Open Event Modal
  function showEventModal(event) {
    if (!dom.eventModal || !dom.eventModalContent) return;

    dom.eventModalContent.innerHTML = `
      <div class="event-modal-header event-${event.severity}">
        <span class="event-icon">${event.icon}</span>
        <div>
          <span class="event-badge">${event.severity.toUpperCase()} ALERT</span>
          <h2>${event.title}</h2>
          <p class="event-subtitle">${event.subtitle}</p>
        </div>
      </div>
      <div class="event-modal-body">
        <p class="event-desc">${event.description}</p>
        
        <div class="event-fun-fact">
          <strong>💡 Did You Know?</strong>
          <p>${event.funFact}</p>
        </div>

        <div class="event-actions-help">
          <h4>Recommended Countermeasures:</h4>
          <div class="countermeasure-tags">
            ${(event.suggestedActions || []).map(act => `<span class="cm-tag">⚡ ${act.replace('_', ' ').toUpperCase()}</span>`).join('')}
          </div>
        </div>

        <button class="event-dismiss-btn" id="event-action-dismiss">I'll Protect The Reef!</button>
      </div>
    `;

    openModal(dom.eventModal);
    const dismissBtn = document.getElementById('event-action-dismiss');
    if (dismissBtn) {
      dismissBtn.addEventListener('click', () => {
        closeAllModals();
      });
    }
  }

  // Species Unlock Celebratory Dialog
  function showUnlockModal(sp) {
    showToast(`🎉 NEW SPECIES ARRIVED: ${sp.name} has migrated to your sanctuary!`, 'unlock', 6000);
    renderSpeciesGrid();

    // Auto-open its fun fact sheet
    setTimeout(() => {
      openSpeciesModal(sp);
    }, 500);
  }

  // Species Distress Warning
  function showDistressAlert(sp) {
    showToast(`🚨 CRITICAL: ${sp.name} population is in danger of extinction in sanctuary! Check water temperature & purity!`, 'warning', 7000);
  }

  // Open Reefdex Marine Encyclopedia
  function openReefdex() {
    if (!dom.reefdexModal) return;
    openModal(dom.reefdexModal);
    if (window.ReefAudio) window.ReefAudio.playBubble(1.2);
  }

  function renderReefdexModal() {
    const list = window.REEF_SPECIES_DATA;
    const invasives = window.REEF_INVASIVE_DATA;
    const container = document.getElementById('reefdex-entries');
    if (!container) return;

    container.innerHTML = `
      <div class="reefdex-filter-tabs">
        <button class="reefdex-tab active" data-tab="all">All Creatures (${list.length + invasives.length})</button>
        <button class="reefdex-tab" data-tab="coral">Corals & Habitats</button>
        <button class="reefdex-tab" data-tab="helper">Helpful Allies</button>
        <button class="reefdex-tab" data-tab="invasive">Threats & Invasives</button>
      </div>
      <div class="reefdex-card-deck" id="reefdex-deck"></div>
    `;

    const deck = document.getElementById('reefdex-deck');
    renderReefdexTab('all', deck);

    // Filter tab clicks
    document.querySelectorAll('.reefdex-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.reefdex-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        renderReefdexTab(tab.getAttribute('data-tab'), deck);
      });
    });
  }

  function renderReefdexTab(tabKey, deck) {
    deck.innerHTML = '';
    const allSpecies = window.REEF_SPECIES_DATA;
    const invasives = window.REEF_INVASIVE_DATA;

    let items = [];
    if (tabKey === 'all') {
      items = [...allSpecies, ...invasives];
    } else if (tabKey === 'coral') {
      items = allSpecies.filter(s => s.category === 'coral');
    } else if (tabKey === 'helper') {
      items = allSpecies.filter(s => s.role.includes('Helper') || s.role.includes('Guardian'));
    } else if (tabKey === 'invasive') {
      items = invasives;
    }

    items.forEach(item => {
      const card = document.createElement('div');
      card.className = 'reefdex-item-card';
      const isInvasive = item.category === 'invasive';

      card.innerHTML = `
        <div class="reefdex-item-header">
          <div>
            <span class="iucn-badge" style="background-color: ${item.badgeColor || '#c0392b'}">${item.iucn || 'Invasive Threat'}</span>
            <h3 class="item-name">${item.name}</h3>
            <p class="item-sci"><em>${item.scientific}</em></p>
          </div>
        </div>
        <p class="item-role-desc"><strong>${isInvasive ? '⚠️ Threat:' : '🌟 Role:'}</strong> ${isInvasive ? item.description : item.roleDescription}</p>
        <div class="item-facts">
          <strong>💡 Fun Facts:</strong>
          <ul>
            ${item.funFacts.map(f => `<li>${f}</li>`).join('')}
          </ul>
        </div>
      `;
      deck.appendChild(card);
    });
  }

  // Toast Notifications
  function showToast(message, type = 'info', duration = 4000) {
    if (!dom.toastContainer) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <div class="toast-content">${message}</div>
      <button class="toast-close">&times;</button>
    `;

    toast.querySelector('.toast-close').addEventListener('click', () => {
      toast.remove();
    });

    dom.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => toast.remove(), 400);
    }, duration);
  }

  // Firebase Cloud Modal Logic
  function openCloudModal() {
    if (window.ReefFirebase) {
      if (dom.guardianNameInput) {
        dom.guardianNameInput.value = window.ReefFirebase.getGuardianName();
      }
      updateCloudStatusUI(window.ReefFirebase.syncStatus, window.ReefFirebase.lastSyncTime);
    }
    openModal(dom.cloudModal);
  }

  function updateCloudStatusUI(status, lastSync) {
    if (!dom.cloudStatusDot) return;

    dom.cloudStatusDot.className = 'cloud-status-dot';
    if (status === 'saving') {
      dom.cloudStatusDot.classList.add('saving');
      if (dom.cloudBtnText) dom.cloudBtnText.textContent = '⏳ Saving...';
    } else if (status === 'offline' || status === 'error') {
      dom.cloudStatusDot.classList.add('offline');
      if (dom.cloudBtnText) dom.cloudBtnText.textContent = '☁️ Offline';
    } else {
      // online or synced
      if (dom.cloudBtnText) dom.cloudBtnText.textContent = '☁️ Cloud';
    }

    if (dom.cloudConnectionBadge) {
      if (status === 'offline') {
        dom.cloudConnectionBadge.className = 'cloud-status-chip offline';
        dom.cloudConnectionBadge.textContent = '⚠️ Offline / Local Mode';
      } else {
        dom.cloudConnectionBadge.className = 'cloud-status-chip online';
        dom.cloudConnectionBadge.textContent = status === 'saving' ? '🔄 Syncing...' : '🟢 Connected';
      }
    }

    if (dom.cloudLastSyncText) {
      if (lastSync) {
        const timeStr = new Date(lastSync).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        dom.cloudLastSyncText.textContent = `Last Synced: ${timeStr}`;
      } else {
        dom.cloudLastSyncText.textContent = 'Last Synced: Pending initial save';
      }
    }
  }

  // Leaderboard Modal Logic
  async function openLeaderboardModal() {
    openModal(dom.leaderboardModal);
    await renderLeaderboard();
  }

  async function renderLeaderboard() {
    if (!dom.leaderboardList) return;
    dom.leaderboardList.innerHTML = `
      <div style="padding: 24px; text-align: center; color: var(--accent-cyan); font-family: var(--font-heading);">
        🌊 Fetching conservation rankings from Cloud Firestore...
      </div>
    `;

    try {
      let entries = [];
      if (window.ReefFirebase && window.ReefFirebase.fetchLeaderboard) {
        entries = await window.ReefFirebase.fetchLeaderboard(15);
      }

      if (!entries || entries.length === 0) {
        dom.leaderboardList.innerHTML = `
          <div style="padding: 24px; text-align: center; color: #90a4ae;">
            No public entries yet. Be the first to synchronize your sanctuary!
          </div>
        `;
        return;
      }

      const currentUid = window.ReefFirebase && window.ReefFirebase.currentUser ? window.ReefFirebase.currentUser.uid : null;

      let html = '';
      entries.forEach((item, index) => {
        const rank = index + 1;
        let rankClass = '';
        let rankBadge = `#${rank}`;
        if (rank === 1) { rankClass = 'rank-top1'; rankBadge = '🥇 #1'; }
        else if (rank === 2) { rankClass = 'rank-top2'; rankBadge = '🥈 #2'; }
        else if (rank === 3) { rankClass = 'rank-top3'; rankBadge = '🥉 #3'; }

        const isMe = currentUid && item.uid === currentUid;

        html += `
          <div class="leaderboard-row ${isMe ? 'current-user' : ''}">
            <span class="lb-col rank ${rankClass}">${rankBadge}</span>
            <span class="lb-col name">${item.guardianName || 'Reef Guardian'} ${isMe ? '<small style="color:var(--accent-cyan); font-size:10px;">(YOU)</small>' : ''}</span>
            <span class="lb-col bio">${item.biodiversity || 0}%</span>
            <span class="lb-col days">${item.daysSurvived || 0}d</span>
            <span class="lb-col species">${item.speciesUnlocked || 0} / 16</span>
            <span class="lb-col coral">${item.coralCover || 0}%</span>
          </div>
        `;
      });
      dom.leaderboardList.innerHTML = html;
    } catch (e) {
      console.warn('Could not render leaderboard:', e);
      dom.leaderboardList.innerHTML = `
        <div style="padding: 20px; text-align: center; color: #ff5252;">
          Unable to retrieve online rankings. Please check internet connection.
        </div>
      `;
    }
  }

  function openModal(modal) {
    if (modal) {
      modal.classList.add('visible');
    }
  }

  function closeAllModals() {
    document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.remove('visible'));
  }

  return {
    init: init,
    updateHUD: updateHUD,
    renderSpeciesGrid: renderSpeciesGrid,
    openSpeciesModal: openSpeciesModal,
    showEventModal: showEventModal,
    showUnlockModal: showUnlockModal,
    showDistressAlert: showDistressAlert,
    showToast: showToast,
    openCloudModal: openCloudModal,
    openLeaderboardModal: openLeaderboardModal,
    updateCloudStatusUI: updateCloudStatusUI
  };
})();
