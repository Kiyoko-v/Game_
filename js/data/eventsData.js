/**
 * Reef Guardian - Dynamic Threats, Climate Events & Milestones
 */

window.REEF_EVENTS_DATA = [
  {
    id: 'heatwave',
    type: 'threat',
    title: 'Marine Heatwave Alert!',
    subtitle: 'Thermal Bleaching Threat',
    icon: '🔥',
    severity: 'critical',
    description: 'An intense marine heatwave has swept into the lagoon! Water temperatures are surging past 31°C. Branching and table corals will begin expelling their symbiotic zooxanthellae (bleaching) if temperatures remain elevated.',
    effects: {
      tempDeltaPerSec: 0.08,
      duration: 45 // seconds
    },
    suggestedActions: ['deploy_shade', 'activate_upwelling'],
    funFact: 'Coral bleaching does not mean immediate death! If water temperatures cool within 3-4 weeks, bleached corals can reabsorb zooxanthellae and make a full recovery.'
  },
  {
    id: 'plastic_debris',
    type: 'threat',
    title: 'Plastic & Ghost Net Surge!',
    subtitle: 'Pollution Influx',
    icon: '🗑️',
    severity: 'high',
    description: 'Heavy coastal river runoff has washed dense plastic debris, single-use bottles, and tangled ghost fishing nets directly into your sanctuary waters. Marine turtles and manta rays are at immediate risk of fatal entanglement.',
    effects: {
      purityDropRate: 0.6,
      spawnDebrisCount: 8,
      duration: 35
    },
    suggestedActions: ['cleanup_dive', 'direct_click'],
    funFact: 'Over 640,000 tons of commercial fishing gear is lost or dumped in the ocean each year—termed "ghost nets", they continue killing marine animals for decades.'
  },
  {
    id: 'cots_outbreak',
    type: 'threat',
    title: 'Crown-of-Thorns Outbreak!',
    subtitle: 'Predator Invasion',
    icon: '⭐',
    severity: 'critical',
    description: 'A destructive bloom of venomous Crown-of-Thorns Starfish has invaded the outer reef reef crest! They are actively digesting living coral heads. Giant Triton snails can naturally suppress them, or dispatch diver injection teams.',
    effects: {
      spawnCotsCount: 6,
      duration: 40
    },
    suggestedActions: ['cots_cull', 'deploy_triton', 'direct_click'],
    funFact: 'A single adult Crown-of-Thorns starfish can consume its own body diameter in coral polyps every night, leaving behind ghostly white skeletal scars.'
  },
  {
    id: 'illegal_trawler',
    type: 'threat',
    title: 'Illegal Trawler Encroachment!',
    subtitle: 'Poaching Intrusion',
    icon: '🚢',
    severity: 'high',
    description: 'An unauthorized commercial vessel dragging destructive bottom-trawl nets has entered the no-take Marine Protected Area zone. Heavy iron trawl doors risk pulverizing fragile coral structures.',
    effects: {
      fishLossRate: 0.4,
      coralSmashRisk: 0.3,
      duration: 30
    },
    suggestedActions: ['patrol_boat', 'acoustic_buoy'],
    funFact: 'Bottom trawling scrapes ocean floor habitats so destructively that sediment plumes kicked up by trawl nets can actually be photographed from orbiting satellites.'
  },
  {
    id: 'algae_bloom',
    type: 'threat',
    title: 'Toxic Algal Bloom!',
    subtitle: 'Eutrophication Smother',
    icon: '🌿',
    severity: 'medium',
    description: 'Excess agricultural nitrogen runoff has spurred an aggressive bloom of smothering macro-algae. Healthy herbivorous parrotfish and blue tangs will graze it down, or divers can weed coral patches.',
    effects: {
      algaeSurge: 0.8,
      purityDropRate: 0.3,
      duration: 35
    },
    suggestedActions: ['weed_algae', 'protect_herbivores'],
    funFact: 'When agricultural fertilizer washes into oceans, it causes eutrophication—dense algae blooms that block sunlight and deplete dissolved oxygen as they decompose.'
  },

  // POSITIVE & MILESTONE EVENTS
  {
    id: 'coral_spawning',
    type: 'positive',
    title: 'Synchronous Coral Spawning!',
    subtitle: 'Natural Wonder',
    icon: '✨',
    severity: 'positive',
    description: 'Tonight is the annual coral spawning miracle! Synchronized with the full moon, colonies release billions of buoyant pink gamete bundles. Clean water allows thousands of planula larvae to settle successfully on bare substrate!',
    effects: {
      coralGrowthSurge: 2.0,
      larvaeBonus: 25,
      duration: 30
    },
    funFact: 'Corals synchronize their spawning to within a few minutes across hundreds of miles of ocean, using water temperature, solar cycles, and twilight light receptors!'
  },
  {
    id: 'grant_milestone',
    type: 'positive',
    title: 'National Geographic Research Grant!',
    subtitle: 'Conservation Award',
    icon: '🏆',
    severity: 'positive',
    description: 'International oceanographers have recognized your reef sanctuary’s thriving biodiversity! A prestigious conservation grant and eco-fund package has been credited to your restoration headquarters.',
    effects: {
      fundsBonus: 600,
      energyBonus: 30,
      duration: 20
    },
    funFact: 'Marine Protected Areas (MPAs) generate immense economic value: every $1 invested in ocean conservation returns up to $10 in sustainable tourism, fish spillover, and storm protection.'
  }
];
