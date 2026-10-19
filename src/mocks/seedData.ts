import {
  Researcher, Institution, Publication, Project, Conference,
  Citation, AuditLog, CoAuthorshipNode, CoAuthorshipLink, CollaborationGraphData
} from '../types';

export const INSTITUTIONS_SEED: Institution[] = [
  {
    id: 'inst-1',
    name: 'Massachusetts Institute of Technology',
    shortName: 'MIT',
    country: 'United States',
    city: 'Cambridge',
    type: 'University',
    departments: ['Computer Science & AI', 'Physics', 'Brain & Cognitive Sciences', 'Biological Engineering', 'Materials Science'],
    researcherCount: 12,
    publicationCount: 34,
    activeProjectsCount: 7,
    budget: 45000000,
    logoUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?w=150&auto=format&fit=crop&q=80',
    website: 'https://mit.edu',
    description: 'Leading global university dedicated to advancements in science, technology, and engineering.',
    isActive: true
  },
  {
    id: 'inst-2',
    name: 'Stanford University',
    shortName: 'Stanford',
    country: 'United States',
    city: 'Stanford',
    type: 'University',
    departments: ['Artificial Intelligence Lab', 'School of Medicine', 'Applied Physics', 'Civil & Environmental Eng'],
    researcherCount: 9,
    publicationCount: 28,
    activeProjectsCount: 6,
    budget: 38000000,
    logoUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=150&auto=format&fit=crop&q=80',
    website: 'https://stanford.edu',
    description: 'Pioneering research university located in Silicon Valley with world-class interdisciplinary institutes.',
    isActive: true
  },
  {
    id: 'inst-3',
    name: 'ETH Zürich',
    shortName: 'ETH',
    country: 'Switzerland',
    city: 'Zürich',
    type: 'University',
    departments: ['Computer Science', 'Quantum Electronics', 'Biosystems Science', 'Mechanical Engineering'],
    researcherCount: 7,
    publicationCount: 22,
    activeProjectsCount: 4,
    budget: 29000000,
    logoUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=150&auto=format&fit=crop&q=80',
    website: 'https://ethz.ch',
    description: 'Premier STEM university in Europe known for cutting-edge engineering and natural sciences.',
    isActive: true
  },
  {
    id: 'inst-4',
    name: 'University of Oxford',
    shortName: 'Oxford',
    country: 'United Kingdom',
    city: 'Oxford',
    type: 'University',
    departments: ['Clarendon Laboratory', 'Nuffield Dept of Medicine', 'Mathematical Institute', 'Engineering Science'],
    researcherCount: 6,
    publicationCount: 19,
    activeProjectsCount: 4,
    budget: 31000000,
    logoUrl: 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?w=150&auto=format&fit=crop&q=80',
    website: 'https://ox.ac.uk',
    description: 'World-renowned research university driving foundational discoveries in biotechnology and physics.',
    isActive: true
  },
  {
    id: 'inst-5',
    name: 'Max Planck Institute for Intelligent Systems',
    shortName: 'Max Planck',
    country: 'Germany',
    city: 'Stuttgart & Tübingen',
    type: 'Research Institute',
    departments: ['Empirical Inference', 'Autonomous Motion', 'Robotic Materials', 'Physical Intelligence'],
    researcherCount: 4,
    publicationCount: 12,
    activeProjectsCount: 3,
    budget: 22000000,
    logoUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=150&auto=format&fit=crop&q=80',
    website: 'https://is.mpg.de',
    description: 'Independent public research institution exploring machine learning, perception, and cybernetic systems.',
    isActive: true
  },
  {
    id: 'inst-6',
    name: 'CERN European Laboratory for Particle Physics',
    shortName: 'CERN',
    country: 'Switzerland',
    city: 'Geneva',
    type: 'Government Lab',
    departments: ['Experimental Physics', 'Theoretical Physics', 'Grid Computing', 'Accelerator Systems'],
    researcherCount: 4,
    publicationCount: 15,
    activeProjectsCount: 3,
    budget: 50000000,
    logoUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=150&auto=format&fit=crop&q=80',
    website: 'https://home.cern',
    description: 'International scientific center operating the Large Hadron Collider and leading fundamental physics research.',
    isActive: true
  }
];

// Generate 40 Researchers
const DISCIPLINE_SKILLS = [
  ['Deep Learning', 'Neural Networks', 'Transformers', 'Computer Vision', 'PyTorch'],
  ['Quantum Optics', 'Superconducting Qubits', 'Quantum Information', 'Cryogenics'],
  ['Genomics', 'CRISPR-Cas9', 'Bioinformatics', 'Next-Gen Sequencing', 'RNA Processing'],
  ['Nanomaterials', 'Graphene', 'Cleanroom Fabrication', 'Semiconductor Physics'],
  ['Robotics', 'Kinematics', 'State Estimation', 'ROS 2', 'Reinforcement Learning'],
  ['Particle Physics', 'Detector Calibration', 'Higgs Boson Analysis', 'C++ Distributed Systems'],
  ['Climate Modeling', 'Ocean Dynamics', 'Carbon Cycle', 'Satellite Remote Sensing'],
  ['Neural Circuits', 'Optogenetics', 'Electrophysiology', 'Brain-Computer Interfaces']
];

const RESEARCHER_NAMES = [
  { name: 'Dr. Sarah Chen', title: 'Professor of Artificial Intelligence', instId: 'inst-1', dept: 'Computer Science & AI', hIndex: 42, citations: 8900, pubs: 34 },
  { name: 'Prof. James Wilson', title: 'Director of Quantum Research', instId: 'inst-2', dept: 'Applied Physics', hIndex: 51, citations: 12400, pubs: 48 },
  { name: 'Dr. Maria Rodriguez', title: 'Senior Scientist in Neural Systems', instId: 'inst-3', dept: 'Computer Science', hIndex: 38, citations: 6100, pubs: 29 },
  { name: 'Dr. Alex Thompson', title: 'Principal Investigator in Nanotechnology', instId: 'inst-4', dept: 'Clarendon Laboratory', hIndex: 33, citations: 4800, pubs: 22 },
  { name: 'Prof. Hans Weber', title: 'Chair of Physical Intelligence', instId: 'inst-5', dept: 'Empirical Inference', hIndex: 47, citations: 9900, pubs: 41 },
  { name: 'Dr. Elena Rostova', title: 'Lead High-Energy Physicist', instId: 'inst-6', dept: 'Experimental Physics', hIndex: 62, citations: 18200, pubs: 76 },
  { name: 'Dr. David Kim', title: 'Associate Professor of Robotics', instId: 'inst-1', dept: 'Computer Science & AI', hIndex: 28, citations: 3400, pubs: 18 },
  { name: 'Dr. Emily Vance', title: 'Research Fellow in Synthetic Biology', instId: 'inst-2', dept: 'School of Medicine', hIndex: 25, citations: 2900, pubs: 15 },
  { name: 'Dr. Lucas Meyer', title: 'Quantum Computing Specialist', instId: 'inst-3', dept: 'Quantum Electronics', hIndex: 29, citations: 3900, pubs: 19 },
  { name: 'Prof. Arthur Pendelton', title: 'Chair of Mathematical Sciences', instId: 'inst-4', dept: 'Mathematical Institute', hIndex: 55, citations: 14200, pubs: 58 },
  { name: 'Dr. Amara Okezie', title: 'Robotics Perception Fellow', instId: 'inst-5', dept: 'Autonomous Motion', hIndex: 22, citations: 2100, pubs: 12 },
  { name: 'Dr. Marco Bellini', title: 'Detector Physicist', instId: 'inst-6', dept: 'Accelerator Systems', hIndex: 37, citations: 5500, pubs: 31 },
  { name: 'Dr. Robert Zhang', title: 'Neuroscience Group Leader', instId: 'inst-1', dept: 'Brain & Cognitive Sciences', hIndex: 36, citations: 5300, pubs: 26 },
  { name: 'Dr. Claire Laurent', title: 'Biomaterials Faculty', instId: 'inst-2', dept: 'School of Medicine', hIndex: 27, citations: 3100, pubs: 17 },
  { name: 'Dr. Stefan Kovac', title: 'Systems Architect', instId: 'inst-3', dept: 'Biosystems Science', hIndex: 24, citations: 2600, pubs: 14 },
  { name: 'Dr. Fiona Campbell', title: 'Genomics Specialist', instId: 'inst-4', dept: 'Nuffield Dept of Medicine', hIndex: 31, citations: 4300, pubs: 21 },
  { name: 'Dr. Michael Schmidt', title: 'Machine Learning Investigator', instId: 'inst-5', dept: 'Empirical Inference', hIndex: 39, citations: 7200, pubs: 30 },
  { name: 'Dr. Chloe Bennett', title: 'Cosmology Researcher', instId: 'inst-6', dept: 'Theoretical Physics', hIndex: 41, citations: 7800, pubs: 33 },
  { name: 'Dr. Vikram Patel', title: 'Quantum Hardware Engineer', instId: 'inst-1', dept: 'Physics', hIndex: 26, citations: 2800, pubs: 16 },
  { name: 'Dr. Hannah Abbott', title: 'Climate Data Scientist', instId: 'inst-2', dept: 'Civil & Environmental Eng', hIndex: 30, citations: 4100, pubs: 20 },
  { name: 'Dr. Oliver Wright', title: 'Bio-Algorithms Lecturer', instId: 'inst-3', dept: 'Computer Science', hIndex: 21, citations: 1900, pubs: 11 },
  { name: 'Dr. Yuki Tanaka', title: 'Graphene Nanostructures Fellow', instId: 'inst-4', dept: 'Engineering Science', hIndex: 29, citations: 3700, pubs: 19 },
  { name: 'Dr. Lars Lindqvist', title: 'Autonomous Swarms Specialist', instId: 'inst-5', dept: 'Robotic Materials', hIndex: 34, citations: 5100, pubs: 25 },
  { name: 'Dr. Sofia Rossi', title: 'Neutrino Oscillations Scholar', instId: 'inst-6', dept: 'Experimental Physics', hIndex: 44, citations: 9100, pubs: 40 },
  { name: 'Dr. Marcus Thorne', title: 'AI Safety Research Lead', instId: 'inst-1', dept: 'Computer Science & AI', hIndex: 32, citations: 4600, pubs: 23 },
  { name: 'Dr. Nina Patel', title: 'Precision Medicine Pioneer', instId: 'inst-2', dept: 'School of Medicine', hIndex: 43, citations: 8800, pubs: 35 },
  { name: 'Dr. Julian Mercier', title: 'Photonics Chair', instId: 'inst-3', dept: 'Quantum Electronics', hIndex: 49, citations: 11200, pubs: 44 },
  { name: 'Dr. Beatrice Howard', title: 'Epidemiology Reader', instId: 'inst-4', dept: 'Nuffield Dept of Medicine', hIndex: 52, citations: 13500, pubs: 51 },
  { name: 'Dr. Nikolai Volkov', title: 'Reinforcement Learning Scholar', instId: 'inst-5', dept: 'Physical Intelligence', hIndex: 27, citations: 3200, pubs: 17 },
  { name: 'Dr. Greta Lindholm', title: 'Subatomic Particle Specialist', instId: 'inst-6', dept: 'Grid Computing', hIndex: 35, citations: 5600, pubs: 27 },
  { name: 'Dr. Gabriel Silva', title: 'Materials Genome Specialist', instId: 'inst-1', dept: 'Materials Science', hIndex: 23, citations: 2400, pubs: 13 },
  { name: 'Dr. Rachel Green', title: 'AI Ethics & Governance Scholar', instId: 'inst-2', dept: 'Artificial Intelligence Lab', hIndex: 29, citations: 3800, pubs: 18 },
  { name: 'Dr. Thomas Novak', title: 'Microfluidics Engineer', instId: 'inst-3', dept: 'Mechanical Engineering', hIndex: 26, citations: 3000, pubs: 15 },
  { name: 'Dr. Ingrid Hauge', title: 'Quantum Cryptography Fellow', instId: 'inst-4', dept: 'Mathematical Institute', hIndex: 38, citations: 6400, pubs: 28 },
  { name: 'Dr. Kaito Yamamoto', title: 'Biomorphic Computing Specialist', instId: 'inst-5', dept: 'Empirical Inference', hIndex: 31, citations: 4400, pubs: 22 },
  { name: 'Dr. Samuel O\'Connor', title: 'High-Luminosity LHC Analyst', instId: 'inst-6', dept: 'Experimental Physics', hIndex: 40, citations: 7300, pubs: 32 },
  { name: 'Dr. Evelyn Reed', title: 'Neuro-inspired Chips Scientist', instId: 'inst-1', dept: 'Brain & Cognitive Sciences', hIndex: 33, citations: 4900, pubs: 24 },
  { name: 'Dr. Mateo Benitez', title: 'Renewable Storage Materials Scholar', instId: 'inst-2', dept: 'Applied Physics', hIndex: 25, citations: 2700, pubs: 16 },
  { name: 'Dr. Astrid Lindemann', title: 'Distributed Systems Architect', instId: 'inst-3', dept: 'Computer Science', hIndex: 37, citations: 5900, pubs: 27 },
  { name: 'Dr. Liam Gallagher', title: 'Astrophysical Data Analyst', instId: 'inst-4', dept: 'Clarendon Laboratory', hIndex: 30, citations: 4200, pubs: 20 }
];

export const RESEARCHERS_SEED: Researcher[] = RESEARCHER_NAMES.map((r, i) => {
  const inst = INSTITUTIONS_SEED.find(x => x.id === r.instId)!;
  const skillsList = DISCIPLINE_SKILLS[i % DISCIPLINE_SKILLS.length];
  return {
    id: `res-${i + 1}`,
    name: r.name,
    title: r.title,
    email: `${r.name.toLowerCase().replace(/[^a-z]/g, '.')}@${inst.shortName.toLowerCase().replace(/[^a-z]/g, '')}.org`,
    institutionId: inst.id,
    institutionName: inst.name,
    department: r.dept,
    skills: skillsList,
    researchInterests: [skillsList[0], skillsList[1], 'Interdisciplinary Methods'],
    affiliations: [inst.name, `${inst.shortName} Advanced Research Center`],
    publicationsCount: r.pubs,
    citationsCount: r.citations,
    hIndex: r.hIndex,
    avatarUrl: `https://i.pravatar.cc/150?u=res-${i + 1}`,
    bio: `${r.name} is a leading expert in ${skillsList[0]} and ${skillsList[1]} at ${inst.name}. They have led numerous breakthrough international projects.`,
    googleScholar: `https://scholar.google.com/citations?user=mock_${i + 1}`,
    orcid: `0000-0002-${1000 + i * 17}-${4321 + i * 3}`,
    joinedYear: 2015 + (i % 9)
  };
});

// Generate 120 Publications
const PUB_TITLES = [
  'Scalable Transformer Models for Large-Scale Protein Folding Prediction',
  'Coherent Control of Superconducting Transmon Qubits at Millikelvin Temperatures',
  'CRISPR-Cas13 Mediated RNA Editing in Human Neural Progenitor Cells',
  'Graphene-Based Heterostructures for High-Efficiency Solar Energy Conversion',
  'Self-Supervised Learning in Autonomous Navigation for Quadrupedal Robots',
  'Observation of Rare Higgs Boson Decay Modes in 13 TeV Proton-Proton Collisions',
  'Global Ocean Circulation Reconstructions Using High-Resolution Satellite Altimetry',
  'Non-Invasive Brain-Computer Interfaces via Ultra-Dense Magnetoencephalography',
  'Fault-Tolerant Quantum Error Correction Codes with Surface Topologies',
  'Single-Cell Transcriptomic Atlas of Mammalian Brain Development',
  'High-Temperature Superconductivity in Nickelate Thin Films',
  'Robust Distributed Consensus under Asynchronous Network Partitions',
  'Deep Reinforcement Learning for Dynamic Power Grid Stabilization',
  'Sub-Nanometer Lithography using Extreme Ultraviolet Interference',
  'Empirical Analysis of Model Collapses in Iterative Synthetic Data Pipelines',
  'Decentralized Federated Learning for Multi-Hospital Clinical Diagnostics',
  'Photon-Efficient Time-of-Flight 3D Imaging through Scattering Media',
  'Generative Diffusion Models for De Novo Molecular Ligand Design',
  'Ultra-Low Latency Neuromorphic Processors for Edge Robotics',
  'Direct Detection Limits of Dark Matter WIMPs at Sub-GeV Mass Scales'
];

const PUB_TYPES: Publication['type'][] = ['Journal', 'Conference', 'Book', 'Patent', 'Technical Report'];
const PUB_STATUSES: Publication['status'][] = ['Published', 'Published', 'Published', 'Submitted', 'Draft', 'Archived'];
const VENUES = [
  'Nature Machine Intelligence', 'Physical Review Letters', 'Cell Genomics',
  'IEEE Trans. on Pattern Analysis & Machine Intelligence', 'Science Robotics',
  'Journal of High Energy Physics', 'NeurIPS Proceedings', 'ICML Proceedings',
  'Nature Nanotechnology', 'IEEE International Conference on Robotics & Automation'
];

export const PUBLICATIONS_SEED: Publication[] = Array.from({ length: 120 }).map((_, i) => {
  const baseTitle = PUB_TITLES[i % PUB_TITLES.length];
  const year = 2019 + (i % 8); // 2019 to 2026
  const primaryAuthor = RESEARCHERS_SEED[i % RESEARCHERS_SEED.length];
  const coAuthor1 = RESEARCHERS_SEED[(i + 3) % RESEARCHERS_SEED.length];
  const coAuthor2 = RESEARCHERS_SEED[(i + 7) % RESEARCHERS_SEED.length];
  const pubType = PUB_TYPES[i % PUB_TYPES.length];
  const status = PUB_STATUSES[i % PUB_STATUSES.length];

  return {
    id: `pub-${i + 1}`,
    title: i < 20 ? baseTitle : `${baseTitle}: Part ${Math.floor(i / 20) + 1} Analysis`,
    abstract: `This study presents a rigorous empirical and theoretical framework investigating ${baseTitle.toLowerCase()}. By leveraging high-throughput computational tools and international collaborative experiments across ${primaryAuthor.institutionName} and ${coAuthor1.institutionName}, we demonstrate state-of-the-art performance with significant reduction in error metrics.`,
    type: pubType,
    status: status,
    authors: [
      { researcherId: primaryAuthor.id, name: primaryAuthor.name, institutionName: primaryAuthor.institutionName, role: 'Lead Author' },
      { researcherId: coAuthor1.id, name: coAuthor1.name, institutionName: coAuthor1.institutionName, role: 'Co-Author' },
      { researcherId: coAuthor2.id, name: coAuthor2.name, institutionName: coAuthor2.institutionName, role: 'Corresponding Author' }
    ],
    venue: VENUES[i % VENUES.length],
    publicationDate: `${year}-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
    year: year,
    doi: `10.1038/s41586-024-${String(1000 + i).padStart(5, '0')}-x`,
    citations: status === 'Published' ? Math.floor(Math.random() * 250) + 2 : 0,
    downloadUrl: `https://arxiv.org/pdf/240${(i % 9) + 1}.${1000 + i}.pdf`,
    fileName: `manuscript_draft_v${(i % 3) + 1}.pdf`,
    fileSize: `${(2.4 + (i % 5) * 1.1).toFixed(1)} MB`,
    keywords: [primaryAuthor.skills[0], primaryAuthor.skills[1], 'Computational Science', 'Scientific Collaboration'],
    history: [
      { date: `${year}-01-10`, status: 'Draft', user: primaryAuthor.name, notes: 'Initial manuscript drafted.' },
      { date: `${year}-03-15`, status: 'Submitted', user: primaryAuthor.name, notes: 'Submitted to peer review.' },
      ...(status === 'Published' ? [{ date: `${year}-07-20`, status: 'Published' as const, user: 'Peer Review Committee', notes: 'Accepted and published online.' }] : [])
    ]
  };
});

// Generate 25 Projects
export const PROJECTS_SEED: Project[] = Array.from({ length: 25 }).map((_, i) => {
  const inst = INSTITUTIONS_SEED[i % INSTITUTIONS_SEED.length];
  const lead = RESEARCHERS_SEED.find(r => r.institutionId === inst.id) || RESEARCHERS_SEED[i];
  const member1 = RESEARCHERS_SEED[(i * 2 + 1) % RESEARCHERS_SEED.length];
  const member2 = RESEARCHERS_SEED[(i * 3 + 4) % RESEARCHERS_SEED.length];

  return {
    id: `proj-${i + 1}`,
    code: `PRJ-${2023 + (i % 4)}-${100 + i}`,
    title: `Project ${i + 1}: ${lead.skills[0]} & Next-Gen ${lead.skills[1]} Initiative`,
    description: `A multi-year collaborative initiative focused on groundbreaking developments in ${lead.skills[0].toLowerCase()} and its real-world industrial and clinical applications.`,
    leadResearcherId: lead.id,
    leadResearcherName: lead.name,
    institutionId: inst.id,
    institutionName: inst.name,
    status: (['Active', 'Active', 'Completed', 'Planning', 'On Hold'] as const)[i % 5],
    budget: 500000 + (i * 350000),
    startDate: `2023-0${(i % 9) + 1}-01`,
    endDate: `2026-12-31`,
    teamMembers: [
      { researcherId: lead.id, name: lead.name, role: 'Principal Investigator', institutionName: inst.name },
      { researcherId: member1.id, name: member1.name, role: 'Co-Investigator', institutionName: member1.institutionName },
      { researcherId: member2.id, name: member2.name, role: 'Senior Research Associate', institutionName: member2.institutionName }
    ],
    tags: [lead.skills[0], 'Horizon Europe', 'Interdisciplinary'],
    publicationsLinkedCount: Math.floor(Math.random() * 8) + 1
  };
});

// Generate 10 Conferences
export const CONFERENCES_SEED: Conference[] = [
  {
    id: 'conf-1',
    title: 'International Conference on Machine Learning & Scientific AI',
    acronym: 'ICML-SAI 2026',
    location: 'Palais des Congrès',
    city: 'Paris',
    country: 'France',
    startDate: '2026-07-12',
    endDate: '2026-07-18',
    website: 'https://icml-sai2026.org',
    submissionDeadline: '2026-04-15',
    tracks: ['Deep Learning Theory', 'AI for Physics', 'Bio-AI', 'Quantum ML'],
    acceptedPapersCount: 142,
    registeredResearchers: [
      { researcherId: 'res-1', researcherName: 'Dr. Sarah Chen', paperTitle: 'Scalable Transformer Models', status: 'Registered' },
      { researcherId: 'res-7', researcherName: 'Dr. David Kim', paperTitle: 'Self-Supervised Robotics', status: 'Registered' },
      { researcherId: 'res-17', researcherName: 'Dr. Michael Schmidt', paperTitle: 'Synthetic Data Frameworks', status: 'Attended' }
    ],
    schedule: [
      { id: 's1', time: '09:00 - 10:30', title: 'Keynote: The Future of Foundation AI in Science', speaker: 'Dr. Sarah Chen', room: 'Main Auditorium', date: '2026-07-13' },
      { id: 's2', time: '11:00 - 12:30', title: 'Session A: Bio-AI & Protein Folding', speaker: 'Dr. Emily Vance', room: 'Hall B', date: '2026-07-13' }
    ]
  },
  {
    id: 'conf-2',
    title: 'Global Quantum Information & Hardware Summit',
    acronym: 'QUANTUM-SUMMIT 2026',
    location: 'Kongresshaus Zürich',
    city: 'Zürich',
    country: 'Switzerland',
    startDate: '2026-09-01',
    endDate: '2026-09-05',
    website: 'https://quantum-summit2026.ch',
    submissionDeadline: '2026-05-30',
    tracks: ['Superconducting Circuits', 'Trapped Ions', 'Quantum Software', 'Cryptanalysis'],
    acceptedPapersCount: 98,
    registeredResearchers: [
      { researcherId: 'res-2', researcherName: 'Prof. James Wilson', paperTitle: 'Coherent Control in Transmon Qubits', status: 'Registered' },
      { researcherId: 'res-9', researcherName: 'Dr. Lucas Meyer', paperTitle: 'Quantum Error Correction', status: 'Attended' }
    ],
    schedule: [
      { id: 's3', time: '10:00 - 11:30', title: 'Plenary: Millikelvin Cryogenic Supercomputing', speaker: 'Prof. James Wilson', room: 'Quantum Hall', date: '2026-09-02' }
    ]
  },
  {
    id: 'conf-3',
    title: 'European Biotechnology & Genomic Engineering Congress',
    acronym: 'EURO-GENE 2026',
    location: 'Oxford Town Hall',
    city: 'Oxford',
    country: 'United Kingdom',
    startDate: '2026-10-10',
    endDate: '2026-10-14',
    website: 'https://eurogene2026.org.uk',
    submissionDeadline: '2026-07-01',
    tracks: ['Gene Editing', 'Synthetic Organisms', 'CRISPR Applications', 'Therapeutics'],
    acceptedPapersCount: 115,
    registeredResearchers: [
      { researcherId: 'res-8', researcherName: 'Dr. Emily Vance', status: 'Registered' },
      { researcherId: 'res-16', researcherName: 'Dr. Fiona Campbell', status: 'Pending' }
    ],
    schedule: [
      { id: 's4', time: '14:00 - 15:30', title: 'RNA Editing Breakthroughs', speaker: 'Dr. Fiona Campbell', room: 'Room 201', date: '2026-10-11' }
    ]
  },
  {
    id: 'conf-4',
    title: 'International Conference on Robotics and Automation',
    acronym: 'IEEE ICRA 2026',
    location: 'Boston Convention & Exhibition Center',
    city: 'Boston',
    country: 'United States',
    startDate: '2026-05-18',
    endDate: '2026-05-22',
    website: 'https://icra2026.org',
    submissionDeadline: '2026-01-15',
    tracks: ['Legged Locomotion', 'Soft Robotics', 'Human-Robot Interaction', 'Multi-Agent Swarms'],
    acceptedPapersCount: 320,
    registeredResearchers: [
      { researcherId: 'res-7', researcherName: 'Dr. David Kim', status: 'Attended' },
      { researcherId: 'res-11', researcherName: 'Dr. Amara Okezie', status: 'Attended' }
    ],
    schedule: [
      { id: 's5', time: '09:00 - 10:00', title: 'Keynote: Embodied AI in Complex Environments', speaker: 'Dr. Amara Okezie', room: 'Grand Ballroom', date: '2026-05-19' }
    ]
  },
  {
    id: 'conf-5',
    title: 'CERN High Energy Physics & Computing Workshop',
    acronym: 'CHEP-WORKSHOP 2026',
    location: 'Globe of Science and Innovation',
    city: 'Geneva',
    country: 'Switzerland',
    startDate: '2026-11-04',
    endDate: '2026-11-08',
    website: 'https://indico.cern.ch/chep2026',
    submissionDeadline: '2026-08-15',
    tracks: ['Exascale Data Pipelines', 'Higgs Physics', 'Grid Middleware', 'Calorimetry'],
    acceptedPapersCount: 75,
    registeredResearchers: [
      { researcherId: 'res-6', researcherName: 'Dr. Elena Rostova', status: 'Registered' },
      { researcherId: 'res-12', researcherName: 'Dr. Marco Bellini', status: 'Registered' }
    ],
    schedule: [
      { id: 's6', time: '11:00 - 12:30', title: 'HL-LHC Data Infrastructure Progress', speaker: 'Dr. Elena Rostova', room: 'CERN Amphitheatre', date: '2026-11-05' }
    ]
  },
  {
    id: 'conf-6',
    title: 'International Materials Research Congress',
    acronym: 'IMRC 2026',
    location: 'Cancún Center',
    city: 'Cancún',
    country: 'Mexico',
    startDate: '2026-08-20',
    endDate: '2026-08-25',
    website: 'https://imrc2026.org',
    submissionDeadline: '2026-05-01',
    tracks: ['Graphene', '2D Materials', 'Batteries & Storage', 'Cleanroom Techniques'],
    acceptedPapersCount: 160,
    registeredResearchers: [
      { researcherId: 'res-4', researcherName: 'Dr. Alex Thompson', status: 'Registered' },
      { researcherId: 'res-22', researcherName: 'Dr. Yuki Tanaka', status: 'Registered' }
    ],
    schedule: []
  },
  {
    id: 'conf-7',
    title: 'World Symposium on Climate Remote Sensing & Modeling',
    acronym: 'CLIMATE-SENS 2026',
    location: 'Stanford Alumni Center',
    city: 'Stanford',
    country: 'United States',
    startDate: '2026-10-22',
    endDate: '2026-10-26',
    website: 'https://climatesens2026.stanford.edu',
    submissionDeadline: '2026-07-20',
    tracks: ['Satellite Altimetry', 'Ocean Carbon Capture', 'Extreme Weather ML'],
    acceptedPapersCount: 90,
    registeredResearchers: [
      { researcherId: 'res-20', researcherName: 'Dr. Hannah Abbott', status: 'Registered' }
    ],
    schedule: []
  },
  {
    id: 'conf-8',
    title: 'IEEE Conference on Decision and Control',
    acronym: 'CDC 2026',
    location: 'Marina Bay Sands',
    city: 'Singapore',
    country: 'Singapore',
    startDate: '2026-12-14',
    endDate: '2026-12-18',
    website: 'https://cdc2026.ieeecss.org',
    submissionDeadline: '2026-03-31',
    tracks: ['Optimal Control', 'Stochastic Systems', 'Networked Robotics'],
    acceptedPapersCount: 410,
    registeredResearchers: [],
    schedule: []
  },
  {
    id: 'conf-9',
    title: 'International Neural Interfaces & Brain Engineering Conference',
    acronym: 'BRAIN-ENG 2026',
    location: 'MIT Media Lab',
    city: 'Cambridge',
    country: 'United States',
    startDate: '2026-11-15',
    endDate: '2026-11-18',
    website: 'https://brain-eng2026.mit.edu',
    submissionDeadline: '2026-08-01',
    tracks: ['Optogenetics', 'Neuromorphic Hardware', 'Brain-Computer Interfaces'],
    acceptedPapersCount: 88,
    registeredResearchers: [
      { researcherId: 'res-13', researcherName: 'Dr. Robert Zhang', status: 'Registered' },
      { researcherId: 'res-37', researcherName: 'Dr. Evelyn Reed', status: 'Registered' }
    ],
    schedule: []
  },
  {
    id: 'conf-10',
    title: 'Max Planck Symposium on Physical Intelligence',
    acronym: 'MPI-PI 2026',
    location: 'MPI Auditorium',
    city: 'Tübingen',
    country: 'Germany',
    startDate: '2026-06-08',
    endDate: '2026-06-11',
    website: 'https://pi.mpg.de/symposium2026',
    submissionDeadline: '2026-03-10',
    tracks: ['Cybernetics', 'Biomorphic Locomotion', 'Empirical Inference'],
    acceptedPapersCount: 60,
    registeredResearchers: [
      { researcherId: 'res-5', researcherName: 'Prof. Hans Weber', status: 'Attended' }
    ],
    schedule: []
  }
];

// Generate Citations
export const CITATIONS_SEED: Citation[] = PUBLICATIONS_SEED.slice(0, 30).map((pub, i) => {
  return {
    id: `cite-${i + 1}`,
    publicationId: pub.id,
    publicationTitle: pub.title,
    citingTitle: `Advancements in ${pub.keywords[0] || 'Computational Methods'}: Extended Review`,
    citingAuthors: `Prof. H. Davis, Dr. K. Miller et al.`,
    citingVenue: `IEEE Transactions on Multi-Scale Systems`,
    citingYear: 2025,
    doi: `10.1109/TMSS.2025.${9000 + i}`
  };
});

// Generate Audit Logs
export const AUDIT_LOGS_SEED: AuditLog[] = [
  { id: 'aud-1', timestamp: '2026-10-02 10:45:12', category: 'Security', user: 'sarah.chen@mit.edu', role: 'Researcher', action: 'User Login', ipAddress: '192.168.1.104', status: 'Success', details: 'Authenticated via JWT token' },
  { id: 'aud-2', timestamp: '2026-10-02 09:30:00', category: 'Publication', user: 'sarah.chen@mit.edu', role: 'Researcher', action: 'Create Manuscript', ipAddress: '192.168.1.104', status: 'Success', details: 'Added draft publication pub-121' },
  { id: 'aud-3', timestamp: '2026-10-01 16:20:44', category: 'User Activity', user: 'j.wilson@stanford.edu', role: 'Institution Admin', action: 'Update Department', ipAddress: '172.16.4.12', status: 'Success', details: 'Modified funding budget for Applied Physics' },
  { id: 'aud-4', timestamp: '2026-10-01 14:11:05', category: 'Project', user: 'm.rodriguez@ethz.ch', role: 'Reviewer', action: 'Submit Peer Review', ipAddress: '10.0.0.88', status: 'Success', details: 'Approved paper pub-4' },
  { id: 'aud-5', timestamp: '2026-09-30 11:02:19', category: 'Security', user: 'a.thompson@scientific.app', role: 'System Admin', action: 'Role Update', ipAddress: '192.168.1.1', status: 'Success', details: 'Granted Institution Admin role to user u-12' },
  { id: 'aud-6', timestamp: '2026-09-29 18:40:02', category: 'Security', user: 'unknown@external.org', role: 'Researcher', action: 'Failed Auth', ipAddress: '45.33.12.8', status: 'Warning', details: 'Invalid JWT credentials attempt' },
  { id: 'aud-7', timestamp: '2026-09-28 08:15:33', category: 'Publication', user: 'e.rostova@cern.ch', role: 'Researcher', action: 'Upload PDF', ipAddress: '137.138.4.1', status: 'Success', details: 'Uploaded manuscript_v2.pdf (14.2 MB)' },
];

// Generate Collaboration Graph (Nodes & Links)
export function getCollaborationGraphData(): CollaborationGraphData {
  const nodes: CoAuthorshipNode[] = RESEARCHERS_SEED.map((r) => ({
    id: r.id,
    name: r.name,
    institution: r.institutionName,
    department: r.department,
    publicationsCount: r.publicationsCount,
    citationsCount: r.citationsCount,
    hIndex: r.hIndex,
    avatarUrl: r.avatarUrl,
    group: parseInt(r.institutionId.replace('inst-', ''))
  }));

  const linkMap = new Map<string, { source: string; target: string; weight: number; publications: string[] }>();

  PUBLICATIONS_SEED.forEach(pub => {
    if (pub.authors.length >= 2) {
      for (let a = 0; a < pub.authors.length; a++) {
        for (let b = a + 1; b < pub.authors.length; b++) {
          const idA = pub.authors[a].researcherId;
          const idB = pub.authors[b].researcherId;
          if (idA && idB && idA !== idB) {
            const key = idA < idB ? `${idA}_${idB}` : `${idB}_${idA}`;
            const existing = linkMap.get(key);
            if (existing) {
              existing.weight += 1;
              if (!existing.publications.includes(pub.title)) {
                existing.publications.push(pub.title);
              }
            } else {
              linkMap.set(key, {
                source: idA < idB ? idA : idB,
                target: idA < idB ? idB : idA,
                weight: 1,
                publications: [pub.title]
              });
            }
          }
        }
      }
    }
  });

  const links: CoAuthorshipLink[] = Array.from(linkMap.values());

  return { nodes, links };
}
