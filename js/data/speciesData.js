/**
 * Reef Guardian - Comprehensive Marine Species & Ecological Data
 * Real-world marine biology, ecological mutualisms, and fun facts.
 */

window.REEF_SPECIES_DATA = [
  // ==========================================
  // TIER 1: HARDY PIONEERS (Unlocked at Start)
  // ==========================================
  {
    id: 'staghorn_coral',
    name: 'Staghorn Coral',
    scientific: 'Acropora cervicornis',
    category: 'coral',
    tier: 1,
    role: 'Habitat Foundation',
    roleTag: 'Coral Builder',
    roleDescription: 'Rapidly creates intricate calcium carbonate branching thickets, providing essential shelter for fish fry.',
    iucn: 'Critically Endangered',
    badgeColor: '#e74c3c',
    basePopulation: 50,
    maxPopulation: 250,
    optimalTemp: [24.0, 29.8],
    minPurity: 35,
    minCoralCover: 0,
    unlockBiodiversity: 0,
    unlocked: true,
    unlockConditionText: 'Foundational starter species for the reef sanctuary.',
    effects: {
      shelterCapacity: 1.0,
      coralGrowthBoost: 0.8
    },
    sensitivity: 1.0,
    visual: {
      type: 'coral_branch',
      color: '#e07a5f',
      bleachColor: '#f4f1de',
      size: 45,
      depthMin: 0.65,
      depthMax: 0.95
    },
    funFacts: [
      'Staghorn coral is one of the fastest-growing stony corals on Earth, growing up to 10 to 20 cm (4-8 inches) every single year!',
      'They reproduce both sexually via synchronous mass spawning under full moons, and asexually when broken fragments fuse onto new rocks.',
      'Despite once dominating Caribbean shallow waters, over 98% of wild staghorn corals have perished since 1980 due to bleaching and disease.'
    ],
    conservationTip: 'Avoid touching corals while snorkeling—even human skin oils and sunscreen chemicals like oxybenzone can poison delicate polyps.'
  },
  {
    id: 'clownfish',
    name: 'Ocellaris Clownfish',
    scientific: 'Amphiprion ocellaris',
    category: 'fish',
    tier: 1,
    role: 'Passive Mutualist',
    roleTag: 'Symbiont',
    roleDescription: 'Lives symbiotically in sea anemones. Aerates anemone tentacles and scares away polyp-nibbling butterflyfish.',
    iucn: 'Least Concern',
    badgeColor: '#27ae60',
    basePopulation: 20,
    maxPopulation: 120,
    optimalTemp: [24.0, 30.2],
    minPurity: 30,
    minCoralCover: 10,
    unlockBiodiversity: 0,
    unlocked: true,
    unlockConditionText: 'Foundational starter species for the reef sanctuary.',
    effects: {
      anemoneHealth: 1.2,
      ecoAppeal: 5
    },
    sensitivity: 0.8,
    visual: {
      type: 'clownfish',
      color: '#ff7700',
      stripeColor: '#ffffff',
      size: 18,
      speed: 1.2,
      depthMin: 0.5,
      depthMax: 0.85
    },
    funFacts: [
      'All clownfish are born male! When the dominant female in a social group dies, the largest male transforms into a breeding female permanently.',
      'Clownfish are coated in a specialized mucus layer that prevents sea anemone nematocysts (stinging harpoons) from firing upon them.',
      'At night, clownfish wiggle vigorously between anemone tentacles, circulating fresh oxygenated water directly to their host.'
    ],
    conservationTip: 'Never buy wild-caught clownfish for home aquariums; always demand certified captive-bred specimens to protect wild reefs.'
  },
  {
    id: 'rainbow_parrotfish',
    name: 'Rainbow Parrotfish',
    scientific: 'Scarus guacamaia',
    category: 'fish',
    tier: 1,
    role: 'Active Helper',
    roleTag: 'Algae Scraper & Sand Maker',
    roleDescription: 'Scrapes away smothering turf algae using beak-like teeth, clearing bare rock for baby coral larvae to settle and grow.',
    iucn: 'Near Threatened',
    badgeColor: '#f39c12',
    basePopulation: 15,
    maxPopulation: 80,
    optimalTemp: [24.0, 30.5],
    minPurity: 35,
    minCoralCover: 15,
    unlockBiodiversity: 0,
    unlocked: true,
    unlockConditionText: 'Foundational starter species for the reef sanctuary.',
    effects: {
      algaeControlRate: 0.25,
      bioSandProduction: 0.5
    },
    sensitivity: 0.9,
    visual: {
      type: 'parrotfish',
      color: '#00b4d8',
      accentColor: '#52b788',
      beakColor: '#f4a261',
      size: 30,
      speed: 1.6,
      depthMin: 0.45,
      depthMax: 0.8
    },
    funFacts: [
      'A single adult parrotfish can poop out over 840 pounds (380 kg) of white sand each year from crushed dead coral rocks!',
      'Before sleeping at night, many parrotfish secrete a transparent mucous sleeping bag that masks their scent from nocturnal moray eels and parasites.',
      'Without parrotfish grazing, opportunistic fleshy macro-algae can overrun and suffocate an entire coral reef in just a few months.'
    ],
    conservationTip: 'Support marine no-take zones! Protecting herbivorous parrotfish from gillnets is one of the most cost-effective ways to save coral reefs.'
  },
  {
    id: 'blue_tang',
    name: 'Blue Tang Surgeonfish',
    scientific: 'Paracanthurus hepatus',
    category: 'fish',
    tier: 1,
    role: 'Helpful Grazer',
    roleTag: 'Filamentous Algae Eater',
    roleDescription: 'Schools across reef crests, continuously nibbling nuisance hair algae before it chokes delicate coral polyps.',
    iucn: 'Least Concern',
    badgeColor: '#27ae60',
    basePopulation: 18,
    maxPopulation: 100,
    optimalTemp: [24.5, 30.0],
    minPurity: 40,
    minCoralCover: 15,
    unlockBiodiversity: 0,
    unlocked: true,
    unlockConditionText: 'Foundational starter species for the reef sanctuary.',
    effects: {
      algaeControlRate: 0.2,
      ecoAppeal: 8
    },
    sensitivity: 1.0,
    visual: {
      type: 'blue_tang',
      color: '#1d3557',
      accentColor: '#e63946',
      tailColor: '#ffd166',
      size: 22,
      speed: 1.8,
      depthMin: 0.35,
      depthMax: 0.75
    },
    funFacts: [
      'Blue Tangs have razor-sharp spines folded inside grooves on both sides of their tail stalk that swing out like surgical scalpels when threatened!',
      'Juvenile Blue Tangs are actually bright radiant yellow! They transition into deep royal blue as they mature into adulthood.',
      'They often swim in large multi-species schools with parrotfish and doctorfish, overwhelming territorial damselfish to graze on algae patches.'
    ],
    conservationTip: 'Chemical cyanide fishing used by illegal traders to stun wild blue tangs destroys coral polyps and kills 90% of non-target fish.'
  },

  // ========================================================
  // TIER 2: SPECIALIZED GUARDIANS (Unlock at 30% Biodiversity)
  // ==========================================
  {
    id: 'brain_coral',
    name: 'Grooved Brain Coral',
    scientific: 'Diploria labyrinthiformis',
    category: 'coral',
    tier: 2,
    role: 'Reef Anchor & Wave Buffer',
    roleTag: 'Storm Fortress',
    roleDescription: 'Massive, boulder-like coral heads that absorb up to 97% of destructive storm wave energy and resist high water temperatures.',
    iucn: 'Vulnerable',
    badgeColor: '#e67e22',
    basePopulation: 0,
    maxPopulation: 150,
    optimalTemp: [23.5, 30.8],
    minPurity: 45,
    minCoralCover: 25,
    unlockBiodiversity: 28,
    unlocked: false,
    unlockConditionText: 'Reach 28% Biodiversity & maintain Coral Cover above 25%.',
    effects: {
      stormResistance: 0.4,
      thermalBuffer: 0.3
    },
    sensitivity: 0.6,
    visual: {
      type: 'coral_brain',
      color: '#d4a373',
      bleachColor: '#fefae0',
      size: 55,
      depthMin: 0.7,
      depthMax: 0.95
    },
    funFacts: [
      'Brain corals can live for more than 900 years, slowly accumulating limestone growth rings that scientists study like tree rings to track ancient climates!',
      'Their maze-like surface ridges are lined with thousands of tiny feeding tentacles that extend predominantly at night to catch drifting zooplankton.',
      'Brain corals exhibit remarkable resilience during thermal bleaching events, often surviving water temperatures that kill branching corals.'
    ],
    conservationTip: 'Living coral reefs act as natural submerged breakwaters, protecting coastal towns from tidal surges and reducing coastal erosion.'
  },
  {
    id: 'giant_clam',
    name: 'Giant Clam',
    scientific: 'Tridacna gigas',
    category: 'invertebrate',
    tier: 2,
    role: 'Active Helper',
    roleTag: 'Master Water Filter',
    roleDescription: 'Filters hundreds of liters of seawater daily, removing murky particulate matter and agricultural nutrients to crystalize reef waters.',
    iucn: 'Vulnerable',
    badgeColor: '#e67e22',
    basePopulation: 0,
    maxPopulation: 60,
    optimalTemp: [25.0, 30.2],
    minPurity: 50,
    minCoralCover: 30,
    unlockBiodiversity: 35,
    unlocked: false,
    unlockConditionText: 'Reach 35% Biodiversity & achieve Water Purity > 50%.',
    effects: {
      waterFilterRate: 0.35,
      ecoAppeal: 12
    },
    sensitivity: 1.1,
    visual: {
      type: 'giant_clam',
      shellColor: '#6c757d',
      mantleColor: '#00f5d4',
      size: 38,
      depthMin: 0.75,
      depthMax: 0.92
    },
    funFacts: [
      'Giant Clams farm sunlight! Their iridescent mantles host billions of symbiotic zooxanthellae micro-algae, which supply over 70% of the clam’s nutrition.',
      'The vibrant blue, emerald, and purple speckles in their mantles are specialized cellular optical prisms called iridocytes that scatter optimal light wavelengths deep into tissue!',
      'An adult Giant Clam can weigh up to 500 lbs (230 kg) and measure over 4 feet across—and once settled on the reef bed, it cannot move for life.'
    ],
    conservationTip: 'Giant clams were heavily overharvested for decorative shell carvings and sashimi meat; community mariculture nurseries are now reseeding reefs.'
  },
  {
    id: 'cleaner_wrasse',
    name: 'Bluestreak Cleaner Wrasse',
    scientific: 'Labroides dimidiatus',
    category: 'fish',
    tier: 2,
    role: 'Active Helper',
    roleTag: 'Ecosystem Doctor',
    roleDescription: 'Establishes reef cleaning stations where predatory and prey fish patiently queue up. Removes ectoparasites, dramatically reducing diseases.',
    iucn: 'Least Concern',
    badgeColor: '#27ae60',
    basePopulation: 0,
    maxPopulation: 50,
    optimalTemp: [24.5, 30.5],
    minPurity: 45,
    minCoralCover: 35,
    unlockBiodiversity: 42,
    unlocked: false,
    unlockConditionText: 'Reach 42% Biodiversity with 35%+ Living Coral Cover.',
    effects: {
      diseaseResistance: 0.45,
      fishHealthBoost: 0.3
    },
    sensitivity: 1.0,
    visual: {
      type: 'cleaner_wrasse',
      color: '#4cc9f0',
      stripeColor: '#03045e',
      size: 16,
      speed: 2.0,
      depthMin: 0.4,
      depthMax: 0.8
    },
    funFacts: [
      'Cleaner Wrasses passed the rigorous "mirror self-recognition test", proving they possess visual self-awareness—the first fish ever shown to do so!',
      'Predators such as moray eels and groupers recognize the cleaner wrasse’s distinct blue dance and deliberately open their mouths and gills to let the wrasse clean without eating them.',
      'Reefs where cleaner wrasses are artificially removed suffer a rapid 30% drop in overall fish diversity and higher parasite infections.'
    ],
    conservationTip: 'Protect cleaning stations from anchoring and boat disruption—these tiny spots are vital health clinics for the entire ocean ecosystem.'
  },
  {
    id: 'green_turtle',
    name: 'Green Sea Turtle',
    scientific: 'Chelonia mydas',
    category: 'reptile_mammal',
    tier: 2,
    role: 'Passive Grazer',
    roleTag: 'Seagrass Pruner',
    roleDescription: 'Maintains healthy underwater seagrass meadows by grazing old blades, preventing microbial decay and creating nurseries for juvenile crabs.',
    iucn: 'Endangered',
    badgeColor: '#c0392b',
    basePopulation: 0,
    maxPopulation: 30,
    optimalTemp: [23.5, 30.5],
    minPurity: 55,
    minCoralCover: 30,
    unlockBiodiversity: 48,
    unlocked: false,
    unlockConditionText: 'Reach 48% Biodiversity & clean debris (Purity > 55%).',
    effects: {
      seagrassProductivity: 0.4,
      ecoAppeal: 25,
      grantEarningRate: 15
    },
    sensitivity: 1.3,
    threatSensitivities: ['plastic_pollution', 'trawling'],
    visual: {
      type: 'turtle',
      shellColor: '#2b9348',
      skinColor: '#a7c957',
      size: 42,
      speed: 1.1,
      depthMin: 0.25,
      depthMax: 0.7
    },
    funFacts: [
      'Sea turtles have roamed Earth’s oceans for over 110 million years, surviving the mass asteroid impact that wiped out the dinosaurs!',
      'Adult Green Turtles can hold their breath underwater for up to 5 hours while resting, slowing their heartbeat to one beat every 9 minutes to conserve oxygen.',
      'Female sea turtles use Earth’s invisible geomagnetic field like a built-in GPS to navigate thousands of miles back to the exact beach where they hatched decades ago.'
    ],
    conservationTip: 'Say NO to single-use plastics! To a hungry sea turtle, a drifting clear plastic bag looks identical to a delicious jellyfish snack.'
  },

  // ========================================================
  // TIER 3: KEYSTONE GUARDIANS & SENSITIVE SPECIES (55%+ Bio)
  // ==========================================
  {
    id: 'blacktip_shark',
    name: 'Blacktip Reef Shark',
    scientific: 'Carcharhinus melanopterus',
    category: 'fish',
    tier: 3,
    role: 'Keystone Guardian',
    roleTag: 'Apex Predator Balance',
    roleDescription: 'Patrols shallow reef flats, weeding out diseased and injured fish, maintaining apex balance and preventing mid-predator population collapses.',
    iucn: 'Vulnerable',
    badgeColor: '#e67e22',
    basePopulation: 0,
    maxPopulation: 25,
    optimalTemp: [24.0, 30.5],
    minPurity: 60,
    minCoralCover: 45,
    unlockBiodiversity: 56,
    unlocked: false,
    unlockConditionText: 'Reach 56% Biodiversity & 45%+ Coral Cover with active MPA Patrols.',
    effects: {
      trophicBalance: 0.5,
      diseaseSuppression: 0.35,
      ecoAppeal: 35
    },
    sensitivity: 1.4,
    threatSensitivities: ['overfishing'],
    visual: {
      type: 'shark',
      bodyColor: '#6c757d',
      bellyColor: '#f8f9fa',
      finTipColor: '#000000',
      size: 58,
      speed: 2.2,
      depthMin: 0.3,
      depthMax: 0.75
    },
    funFacts: [
      'Reef sharks have no bones! Their skeletons are made entirely of lightweight, flexible cartilage—the same supple tissue found in human ears and noses.',
      'Sharks possess a special sixth sense via gel-filled pores called the "Ampullae of Lorenzini" that can detect the faint electrical heartbeat of hidden prey buried under the sand.',
      'Healthy coral reefs actually require sharks: their presence prevents mid-level carnivores from wiping out herbivorous fish like parrotfish that protect corals from algae.'
    ],
    conservationTip: 'Ban shark fin products! Over 70 million sharks are slaughtered globally every year, destabilizing fragile marine food chains.'
  },
  {
    id: 'giant_triton',
    name: 'Giant Triton Snail',
    scientific: 'Charonia tritonis',
    category: 'invertebrate',
    tier: 3,
    role: 'Active Helper',
    roleTag: 'COTS Nemesis',
    roleDescription: 'The supreme natural predator of the venomous Crown-of-Thorns Starfish (COTS). Actively hunts and suppresses coral-destroying starfish plagues.',
    iucn: 'Vulnerable',
    badgeColor: '#e67e22',
    basePopulation: 0,
    maxPopulation: 20,
    optimalTemp: [24.0, 30.0],
    minPurity: 60,
    minCoralCover: 50,
    unlockBiodiversity: 63,
    unlocked: false,
    unlockConditionText: 'Reach 63% Biodiversity & 50% Coral Cover to attract rare Tritons.',
    effects: {
      cotsHuntRate: 0.6,
      coralShielding: 0.3
    },
    sensitivity: 1.2,
    visual: {
      type: 'triton_snail',
      shellColor: '#bc6c25',
      patternColor: '#dda15e',
      size: 32,
      depthMin: 0.8,
      depthMax: 0.98
    },
    funFacts: [
      'The Giant Triton snail is immune to the neurotoxins in Crown-of-Thorns starfish spines! It pins the starfish with its muscular foot and slices it open with a serrated radula.',
      'Tritons can track the scent of a Crown-of-Thorns starfish from meters away using chemical receptors on their sensory tentacles.',
      'Because their giant spiral shells were coveted as decorative trumpets and souvenirs, Tritons were heavily over-collected, directly triggering starfish outbreaks across the Pacific.'
    ],
    conservationTip: 'Never buy sea snail shells or conch shells in souvenir markets—leaving them in the sea preserves the reef’s natural immune system.'
  },
  {
    id: 'hawksbill_turtle',
    name: 'Hawksbill Sea Turtle',
    scientific: 'Eretmochelys imbricata',
    category: 'reptile_mammal',
    tier: 3,
    role: 'Active Helper',
    roleTag: 'Sponge Controller',
    roleDescription: 'Feeds almost exclusively on aggressive sea sponges that would otherwise overgrow and smother slow-growing reef-building corals.',
    iucn: 'Critically Endangered',
    badgeColor: '#e74c3c',
    basePopulation: 0,
    maxPopulation: 18,
    optimalTemp: [24.5, 30.2],
    minPurity: 65,
    minCoralCover: 50,
    unlockBiodiversity: 70,
    unlocked: false,
    unlockConditionText: 'Reach 70% Biodiversity & keep Water Purity above 65%.',
    effects: {
      spongeControlRate: 0.5,
      coralSpaceBoost: 0.3,
      ecoAppeal: 40
    },
    sensitivity: 1.5,
    threatSensitivities: ['plastic_pollution', 'overfishing'],
    visual: {
      type: 'hawksbill',
      shellColor: '#8b4513',
      beakColor: '#d4a373',
      size: 40,
      speed: 1.3,
      depthMin: 0.3,
      depthMax: 0.8
    },
    funFacts: [
      'Hawksbill turtles possess a narrow, curved, raptor-like beak designed specifically to pluck toxic sponges out of narrow coral crevices!',
      'Many sponges they eat contain glass-like silica spicules and potent chemical poisons that would prove fatal to other animals, but Hawksbill turtles digest them harmlessly.',
      'For centuries, their lustrous, amber-gold patterned scutes were harvested for "tortoiseshell" jewelry, driving the species to the brink of extinction.'
    ],
    conservationTip: 'Support sustainable tourism operators who enforce strict turtle-watching distances and boat propeller guards in nesting lagoons.'
  },
  {
    id: 'table_coral',
    name: 'Acropora Table Coral',
    scientific: 'Acropora hyacinthus',
    category: 'coral',
    tier: 3,
    role: 'Canopy Architecture',
    roleTag: 'Coral Canopy Shading',
    roleDescription: 'Expands wide, horizontal umbrellas that shade the under-reef, creating sheltered microclimates and refuge for large schools of juvenile fish.',
    iucn: 'Near Threatened',
    badgeColor: '#f39c12',
    basePopulation: 0,
    maxPopulation: 80,
    optimalTemp: [24.5, 29.8],
    minPurity: 65,
    minCoralCover: 55,
    unlockBiodiversity: 75,
    unlocked: false,
    unlockConditionText: 'Reach 75% Biodiversity & maintain Water Temp below 30°C.',
    effects: {
      juvenileShelter: 1.5,
      reefDiversityCap: 0.4
    },
    sensitivity: 1.6,
    threatSensitivities: ['warming_ocean'],
    visual: {
      type: 'coral_table',
      color: '#06d6a0',
      bleachColor: '#f8f9fa',
      size: 70,
      depthMin: 0.65,
      depthMax: 0.85
    },
    funFacts: [
      'Table corals can grow to over 3 meters (10 feet) in diameter, forming horizontal canopies that act like underwater rainforest canopies!',
      'Because of their flat top-facing orientation, table corals absorb maximum sunlight, but are also the first corals to bleach when ultraviolet solar rays and heat combine.',
      'Dozens of different fish species divide up territories on a single table coral: damselfish live on top, while groupers and cardinalfish hide underneath.'
    ],
    conservationTip: 'Deploying solar shade cloths during summer heatwaves can reduce table coral mortality by up to 60%.'
  },

  // ========================================================
  // TIER 4: LIVING WONDERS & LEGENDARY GIANTS (82%+ Bio)
  // ==========================================
  {
    id: 'manta_ray',
    name: 'Reef Manta Ray',
    scientific: 'Mobula alfredi',
    category: 'fish',
    tier: 4,
    role: 'Passive Wonder',
    roleTag: 'Gentle Plankton Feeder',
    roleDescription: 'Glides gracefully along current channels, filtering rich plankton blooms and bringing global eco-tourism funding and research attention.',
    iucn: 'Vulnerable',
    badgeColor: '#e67e22',
    basePopulation: 0,
    maxPopulation: 12,
    optimalTemp: [24.0, 30.0],
    minPurity: 75,
    minCoralCover: 60,
    unlockBiodiversity: 82,
    unlocked: false,
    unlockConditionText: 'Reach 82% Biodiversity, 75%+ Purity, with ghost nets cleared.',
    effects: {
      ecoAppeal: 75,
      grantEarningRate: 50,
      planktonRegulation: 0.4
    },
    sensitivity: 1.5,
    threatSensitivities: ['trawling', 'plastic_pollution'],
    visual: {
      type: 'manta_ray',
      topColor: '#1a1a24',
      bellyColor: '#ffffff',
      wingSpan: 85,
      speed: 1.4,
      depthMin: 0.2,
      depthMax: 0.6
    },
    funFacts: [
      'Manta rays have the largest brain-to-body ratio of any fish in the ocean! They demonstrate remarkable curiosity, memory, and playful social behavior.',
      'Each manta ray has a completely unique pattern of black spots on its snowy white belly, functioning like an infallible human fingerprint for marine biologists.',
      'Unlike stingrays, manta rays possess no stinging barb or venomous spine whatsoever; they are completely harmless, filter-feeding gentle giants.'
    ],
    conservationTip: 'Manta rays are vulnerable to entanglement in synthetic monofilament ghost fishing nets abandoned at sea; dive cleanups save hundreds each year.'
  },
  {
    id: 'whale_shark',
    name: 'Whale Shark',
    scientific: 'Rhincodon typus',
    category: 'fish',
    tier: 4,
    role: 'Passive Giant',
    roleTag: 'Ocean Titan & Beacon',
    roleDescription: 'The world’s largest fish. Its seasonal arrival signifies a thriving, pristine marine sanctuary, unlocking international conservation grants.',
    iucn: 'Endangered',
    badgeColor: '#c0392b',
    basePopulation: 0,
    maxPopulation: 6,
    optimalTemp: [23.5, 30.2],
    minPurity: 80,
    minCoralCover: 65,
    unlockBiodiversity: 88,
    unlocked: false,
    unlockConditionText: 'Reach 88% Biodiversity & maintain Water Purity > 80% with low boat noise.',
    effects: {
      ecoAppeal: 120,
      grantEarningRate: 100,
      globalPrestige: 1.0
    },
    sensitivity: 1.7,
    threatSensitivities: ['overfishing', 'plastic_pollution'],
    visual: {
      type: 'whale_shark',
      bodyColor: '#2b3a4a',
      spotColor: '#ffffff',
      size: 110,
      speed: 0.9,
      depthMin: 0.15,
      depthMax: 0.55
    },
    funFacts: [
      'Despite reaching lengths of over 40 feet (12 meters) and weighing more than 40,000 lbs, whale sharks feed only on microscopic plankton and tiny fish!',
      'Their skin can be up to 4 inches (10 cm) thick, making it the thickest skin of any living animal on Earth.',
      'NASA satellite imaging algorithms originally designed to map galaxies and constellations are now used by marine scientists to track individual whale shark spot patterns!'
    ],
    conservationTip: 'Enforce slow vessel speed limits in reef channels: high-speed boat propeller strikes are a leading cause of whale shark injury worldwide.'
  },
  {
    id: 'dugong',
    name: 'Dugong (Sea Cow)',
    scientific: 'Dugong dugon',
    category: 'reptile_mammal',
    tier: 4,
    role: 'Helpful Herbivore',
    roleTag: 'Seagrass Aerator',
    roleDescription: 'Gently roots along shallow sandbars eating seagrass rhizomes, aerating seabed sediment and recycling essential ocean nutrients.',
    iucn: 'Vulnerable',
    badgeColor: '#e67e22',
    basePopulation: 0,
    maxPopulation: 8,
    optimalTemp: [24.0, 29.8],
    minPurity: 82,
    minCoralCover: 65,
    unlockBiodiversity: 92,
    unlocked: false,
    unlockConditionText: 'Reach 92% Biodiversity & keep water sediment-free.',
    effects: {
      seagrassAeration: 0.6,
      sedimentRecycling: 0.4,
      ecoAppeal: 90
    },
    sensitivity: 1.8,
    threatSensitivities: ['plastic_pollution', 'trawling'],
    visual: {
      type: 'dugong',
      bodyColor: '#7d8597',
      bellyColor: '#9fa0a4',
      size: 50,
      speed: 0.95,
      depthMin: 0.5,
      depthMax: 0.9
    },
    funFacts: [
      'Dugongs are the real-life historical inspiration behind centuries of mythical mermaid tales told by lonely sailors on long seafaring voyages!',
      'Genetically, dugongs and manatees are much more closely related to terrestrial elephants and hyraxes than to whales or dolphins.',
      'Dugongs must surface every few minutes to breathe air through nostrils positioned on top of their broad snouts.'
    ],
    conservationTip: 'Runoff from coastal soil clearing smothers the delicate seagrass beds dugongs depend on for daily sustenance.'
  },
  {
    id: 'pygmy_seahorse',
    name: 'Bargibant’s Pygmy Seahorse',
    scientific: 'Hippocampus bargibanti',
    category: 'fish',
    tier: 4,
    role: 'Delicate Indicator',
    roleTag: 'The Ultimate Challenge',
    roleDescription: 'Microscopic, exquisitely camouflaged jewel of the reef. Lives exclusively on delicate Muricella sea fans. Exquisitely sensitive to thermal changes.',
    iucn: 'Data Deficient / Vulnerable',
    badgeColor: '#9b59b6',
    basePopulation: 0,
    maxPopulation: 25,
    optimalTemp: [25.0, 28.8], // Very narrow temperature window!
    minPurity: 88,
    minCoralCover: 75,
    unlockBiodiversity: 96,
    unlocked: false,
    unlockConditionText: 'Reach 96% Biodiversity, pristine water (Purity > 88%), and precise temp (25-28.8°C).',
    effects: {
      pristineSanctuaryStatus: 1.0,
      ecoAppeal: 150
    },
    sensitivity: 2.2, // Highly sensitive!
    threatSensitivities: ['warming_ocean', 'plastic_pollution'],
    visual: {
      type: 'seahorse',
      color: '#f72585',
      tubercleColor: '#ffffff',
      size: 14,
      speed: 0.4,
      depthMin: 0.6,
      depthMax: 0.85
    },
    funFacts: [
      'Bargibant’s Pygmy Seahorse measures less than 2 centimeters (0.8 inches) from snout to tail tip—smaller than a postage stamp!',
      'Their camouflage is so flawless that they were only discovered in 1969 by accident, when a scientist was examining a collected gorgonian sea fan in a laboratory.',
      'They spend their entire adult lifetimes clinging by their prehensile tail to a single sea fan coral, unable to swim against even gentle ocean currents.'
    ],
    conservationTip: 'Pygmy seahorses can be blinded or stressed to death by bright flash photography from underwater divers; ethical diving codes ban flash on seahorses.'
  }
];

// ==========================================
// INVASIVE & OUTBREAK THREAT SPECIES
// ==========================================
window.REEF_INVASIVE_DATA = [
  {
    id: 'cots_starfish',
    name: 'Crown-of-Thorns Starfish (COTS)',
    scientific: 'Acanthaster planci',
    category: 'invasive',
    threatType: 'coral_predator',
    badgeColor: '#c0392b',
    description: 'A venomous, voracious coral predator. During boom cycles, an adult COTS can eat up to 10 square meters of living coral every single year!',
    effects: {
      coralDamageRate: 0.4
    },
    visual: {
      type: 'starfish',
      color: '#800f2f',
      spineColor: '#ff4d6d',
      size: 34
    },
    remedy: 'Dispatch divers for targeted eco-vinegar/bile salt injection, or protect Giant Triton snails!',
    funFacts: [
      'The Crown-of-Thorns feeds by turning its stomach inside-out through its mouth, liquefying coral tissue with digestive enzymes right on the skeleton!',
      'Each starfish is covered in hundreds of sharp, venomous spines loaded with saponins and plancitoxin, capable of causing intense agony and infection in humans.',
      'A single female Crown-of-Thorns starfish can release up to 60 million eggs in a single spawning season!'
    ]
  },
  {
    id: 'invasive_lionfish',
    name: 'Invasive Red Lionfish',
    scientific: 'Pterois volitans',
    category: 'invasive',
    threatType: 'fish_predator',
    badgeColor: '#c0392b',
    description: 'An aggressive invasive predator with venomous fins. Devours native juvenile reef fish, depleting grazing populations and disrupting trophic balance.',
    effects: {
      juvenileFishPredation: 0.35,
      algaeIndirectBoost: 0.2
    },
    visual: {
      type: 'lionfish',
      color: '#a4161a',
      stripeColor: '#fdf0d5',
      size: 28
    },
    remedy: 'Organize targeted volunteer spearfishing derbies and support local lionfish culinary consumption!',
    funFacts: [
      'Lionfish stomachs can expand up to 30 times their normal volume after gorging on native reef fish!',
      'Because they are not native to Atlantic and Caribbean waters, local prey fish do not recognize lionfish as predators and swim directly into their mouths.',
      'Lionfish have 18 venomous spines along their dorsal, pelvic, and anal fins used exclusively for defense against larger predators.'
    ]
  }
];
