export interface Publication {
  id: string; title: string; authors: string[]; journal: string; year: number;
  status: 'Published' | 'Submitted' | 'Draft' | 'Under Review';
  citations: number; doi: string; abstract: string; keywords: string[];
  type: 'Journal' | 'Conference' | 'Book Chapter' | 'Preprint';
}

export interface Researcher {
  id: string; name: string; initials: string; color: string; role: string;
  dept: string; institution: string; interests: string[]; hIndex: number;
  publications: number; collaborators: number; citations: number; email: string;
  orcid: string; status: 'Active' | 'Inactive'; joinDate: string;
}

export interface Institution {
  id: string; name: string; country: string; type: 'University' | 'Research Lab' | 'Government';
  researchers: number; projects: number; budget: number; status: 'Active' | 'Inactive';
  established: number; website: string;
}

export interface Project {
  id: string; name: string; desc: string; lead: string; institution: string;
  members: string[]; progress: number; status: 'On Track' | 'At Risk' | 'Ahead' | 'Delayed';
  start: string; end: string; budget: number;
  milestones: { name: string; date: string; completed: boolean }[];
}

export interface Conference {
  id: string; name: string; location: string; date: string; deadline: string;
  status: 'Open' | 'Closed' | 'Upcoming'; submissions: number; attendees: number;
  website: string; topics: string[];
}

export interface Review {
  id: string; paperId: string; paperTitle: string; reviewer: string;
  assignedDate: string; dueDate: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Overdue';
  priority: 'High' | 'Medium' | 'Low'; score: number | null;
  feedback: string | null; journal: string;
}

export interface Event {
  id: string; title: string; type: 'Workshop' | 'Seminar' | 'Conference' | 'Webinar';
  date: string; location: string; attendees: number; maxAttendees: number;
  registered: boolean; description: string;
}

export interface AuditLog {
  id: string; user: string; action: string; resource: string; timestamp: string;
  type: 'Info' | 'Warning' | 'Critical'; ip: string; details: string;
}

export interface Department {
  id: string; name: string; head: string; institution: string;
  researchers: number; projects: number; budget: number; publications: number;
}

export interface User {
  id: string; name: string; email: string;
  role: 'Researcher' | 'Institution Admin' | 'Reviewer' | 'System Admin';
  institution: string; status: 'Active' | 'Inactive' | 'Pending';
  lastLogin: string; joinDate: string; permissions: string[];
}

export interface Citation {
  id: string; paperTitle: string; citedBy: string; journal: string;
  year: number; authors: string[]; count: number;
}

export interface Notification {
  id: string; title: string; message: string;
  type: 'info' | 'success' | 'warning' | 'error'; time: string; read: boolean;
}

// ──────────────────────────────────────────────────────────────
// PUBLICATIONS  (20)
// ──────────────────────────────────────────────────────────────
export const publications: Publication[] = [
  {
    id: 'pub1',
    title: 'Fault-Tolerant Quantum Computing via Surface Code Concatenation',
    authors: ['Sarah Chen', 'Liam O\'Brien', 'Yuki Tanaka'],
    journal: 'Nature Physics',
    year: 2024,
    status: 'Published',
    citations: 312,
    doi: '10.1038/s41567-024-0001-1',
    abstract: 'We demonstrate a scalable approach to fault-tolerant quantum computation using concatenated surface codes on a 72-qubit superconducting processor. Our protocol achieves a logical error rate below the fault-tolerance threshold of 10⁻⁶ per gate cycle, enabling practical large-scale quantum algorithms.',
    keywords: ['quantum computing', 'surface codes', 'fault tolerance', 'superconducting qubits'],
    type: 'Journal',
  },
  {
    id: 'pub2',
    title: 'CRISPR-Cas12a Base Editing for In Vivo Correction of Sickle Cell Mutations',
    authors: ['Maria Rodriguez', 'James Wilson', 'Fatima Al-Hassan'],
    journal: 'Cell',
    year: 2024,
    status: 'Published',
    citations: 478,
    doi: '10.1016/j.cell.2024.02.011',
    abstract: 'We report high-efficiency adenine base editing using an engineered Cas12a variant that corrects the HbS point mutation in hematopoietic stem cells with 94% efficiency. In a humanized mouse model, corrected cells persist for 16 weeks with no detectable off-target edits above background.',
    keywords: ['CRISPR', 'base editing', 'sickle cell disease', 'hematopoietic stem cells'],
    type: 'Journal',
  },
  {
    id: 'pub3',
    title: 'Neuromorphic Computing with Memristive Synapses at Femtojoule Energy Scales',
    authors: ['Hiroshi Nakamura', 'Elena Volkova', 'David Park'],
    journal: 'Science',
    year: 2024,
    status: 'Published',
    citations: 205,
    doi: '10.1126/science.adi8841',
    abstract: 'We present a 256×256 crossbar array of hafnium-oxide memristors exhibiting analog weight storage with 6-bit precision and energy per synaptic operation of 0.4 fJ. Benchmarked on ImageNet, the array achieves 89.2% top-5 accuracy while consuming 47× less energy than equivalent GPU inference.',
    keywords: ['neuromorphic computing', 'memristors', 'in-memory computing', 'energy efficiency'],
    type: 'Journal',
  },
  {
    id: 'pub4',
    title: 'Atlantic Meridional Overturning Circulation Slowdown: Observational Evidence from 2010–2023',
    authors: ['Sophie Laurent', 'Anders Eriksson', 'Priya Sharma'],
    journal: 'Nature Climate Change',
    year: 2023,
    status: 'Published',
    citations: 634,
    doi: '10.1038/s41558-023-1744-x',
    abstract: 'Continuous mooring records and Argo float data reveal a statistically significant 18 ± 4% decline in AMOC strength between 2010 and 2023. Model projections constrained by these observations suggest an additional 15–25% weakening by 2100 under SSP2-4.5, with major implications for European climate.',
    keywords: ['AMOC', 'ocean circulation', 'climate change', 'paleoclimatology'],
    type: 'Journal',
  },
  {
    id: 'pub5',
    title: 'Topological Superconductivity in Twisted Bilayer Graphene at Magic Angle',
    authors: ['Wei Zhang', 'Sarah Chen', 'Marcus Hoffmann'],
    journal: 'Physical Review Letters',
    year: 2024,
    status: 'Published',
    citations: 189,
    doi: '10.1103/PhysRevLett.132.136001',
    abstract: 'We report topological superconductivity emerging at a twist angle of 1.08° in bilayer graphene encapsulated in hexagonal boron nitride. Scanning tunneling spectroscopy reveals chiral Majorana edge modes coexisting with unconventional Cooper pairs, identified by a quantized conductance plateau of e²/h.',
    keywords: ['twisted bilayer graphene', 'topological superconductivity', 'Majorana fermions', 'moiré physics'],
    type: 'Journal',
  },
  {
    id: 'pub6',
    title: 'Whole-Brain Connectome Mapping with Expansion Microscopy at Synaptic Resolution',
    authors: ['Aisha Okonkwo', 'Lena Fischer', 'James Wilson'],
    journal: 'Nature Methods',
    year: 2023,
    status: 'Published',
    citations: 291,
    doi: '10.1038/s41592-023-02081-4',
    abstract: 'ExFISH-EM, a correlative expansion-electron microscopy workflow, enables whole-brain synaptic connectome reconstruction of the adult zebrafish brain. We identified 4.7 million synapses across 100,000 neurons and found previously unknown long-range inhibitory projections linking the habenula to dopaminergic circuits.',
    keywords: ['connectomics', 'expansion microscopy', 'synapse', 'zebrafish', 'neural circuits'],
    type: 'Journal',
  },
  {
    id: 'pub7',
    title: 'Deep Learning Prediction of Protein–Protein Interaction Surfaces from Sequence Alone',
    authors: ['Raj Patel', 'Elena Volkova', 'Kenji Watanabe'],
    journal: 'Nature Structural & Molecular Biology',
    year: 2024,
    status: 'Under Review',
    citations: 0,
    doi: '',
    abstract: 'We introduce BindFormer, a transformer-based model that predicts protein–protein interaction interfaces with 91% precision and 87% recall on a held-out benchmark of 1,200 structurally diverse complexes. BindFormer generalises to orphan proteins with no homologous structures, outperforming AlphaFold-Multimer by 14 percentage points.',
    keywords: ['protein-protein interactions', 'deep learning', 'transformer', 'structural biology'],
    type: 'Journal',
  },
  {
    id: 'pub8',
    title: 'Carbon Nanotube Forest Electrodes for Ultrahigh-Energy-Density Lithium-Sulfur Batteries',
    authors: ['David Park', 'Fatima Al-Hassan', 'Hiroshi Nakamura'],
    journal: 'Advanced Energy Materials',
    year: 2023,
    status: 'Published',
    citations: 156,
    doi: '10.1002/aenm.202302877',
    abstract: 'Vertically aligned carbon nanotube forests with controlled sulfur infiltration yield cathodes delivering 1,410 mAh g⁻¹ at 0.1C with 89% capacity retention over 500 cycles. In-situ X-ray diffraction reveals suppressed polysulfide shuttling attributable to nanotube curvature-induced electrostatic confinement.',
    keywords: ['lithium-sulfur battery', 'carbon nanotubes', 'energy storage', 'electrochemistry'],
    type: 'Journal',
  },
  {
    id: 'pub9',
    title: 'Exoplanet Atmosphere Characterisation with JWST NIRSpec: The Case of TRAPPIST-1e',
    authors: ['Sophie Laurent', 'Marcus Hoffmann', 'Priya Sharma'],
    journal: 'The Astrophysical Journal Letters',
    year: 2024,
    status: 'Published',
    citations: 87,
    doi: '10.3847/2041-8213/ad2f10',
    abstract: 'Four JWST NIRSpec transmission spectra of TRAPPIST-1e reveal absorption features consistent with a CO₂-dominated atmosphere at 0.1 bar surface pressure. Retrieval analysis rules out a bare-rock scenario at 4.1σ and places a 3σ upper limit of 10 ppm on methane, constraining photochemical models of the habitable zone.',
    keywords: ['exoplanets', 'TRAPPIST-1', 'JWST', 'atmospheric spectroscopy', 'astrobiology'],
    type: 'Journal',
  },
  {
    id: 'pub10',
    title: 'Single-Cell Multi-Omics Reveals Epigenetic Drivers of Pancreatic Beta-Cell Failure',
    authors: ['Maria Rodriguez', 'Aisha Okonkwo', 'Wei Zhang'],
    journal: 'Cell Metabolism',
    year: 2024,
    status: 'Submitted',
    citations: 0,
    doi: '',
    abstract: 'Simultaneous profiling of the transcriptome, chromatin accessibility, and DNA methylome in 42,000 pancreatic islet cells from type-2 diabetic donors identifies a dedifferentiation trajectory driven by progressive loss of PDX1 binding at beta-cell identity enhancers. Restoring PDX1 occupancy via CRISPR activation reverses the phenotype ex vivo.',
    keywords: ['single-cell omics', 'type 2 diabetes', 'beta cells', 'epigenetics', 'pancreas'],
    type: 'Journal',
  },
  {
    id: 'pub11',
    title: 'Scalable Synthesis of Perovskite Quantum Dots for High-Efficiency LED Displays',
    authors: ['Kenji Watanabe', 'Lena Fischer', 'David Park'],
    journal: 'ACS Nano',
    year: 2023,
    status: 'Published',
    citations: 213,
    doi: '10.1021/acsnano.3c08415',
    abstract: 'A continuous-flow microreactor process produces CsPbBr₃ quantum dots with photoluminescence quantum yield of 98.5% and narrow emission linewidth of 18 nm FWHM at production rates of 500 mg h⁻¹. LEDs fabricated from these dots achieve an external quantum efficiency of 24.8% with CIE coordinates matching the BT.2020 green primary.',
    keywords: ['perovskite', 'quantum dots', 'LEDs', 'display technology', 'nanomaterials'],
    type: 'Journal',
  },
  {
    id: 'pub12',
    title: 'Reinforcement Learning for Autonomous Robotic Surgery: Suturing Beyond Expert Level',
    authors: ['Raj Patel', 'Elena Volkova', 'James Wilson'],
    journal: 'Science Robotics',
    year: 2024,
    status: 'Published',
    citations: 143,
    doi: '10.1126/scirobotics.adk9213',
    abstract: 'SurgiRL, a model-based reinforcement learning system trained in a photo-realistic surgical simulator, executes interrupted suture placement in ex vivo porcine tissue with needle-tip accuracy of 0.31 ± 0.08 mm—surpassing the median expert surgeon accuracy of 0.52 mm. Zero-shot transfer to a da Vinci Xi system achieves 94% task completion.',
    keywords: ['surgical robotics', 'reinforcement learning', 'autonomous surgery', 'sim-to-real'],
    type: 'Journal',
  },
  {
    id: 'pub13',
    title: 'Lattice QCD Calculation of the Proton Charge Radius to Sub-Percent Precision',
    authors: ['Marcus Hoffmann', 'Yuki Tanaka', 'Liam O\'Brien'],
    journal: 'Physical Review D',
    year: 2023,
    status: 'Published',
    citations: 98,
    doi: '10.1103/PhysRevD.108.034503',
    abstract: 'Using ensembles with physical pion mass and five lattice spacings, we determine the proton charge radius as 0.8412 ± 0.0028 fm, in agreement with the CODATA muonic hydrogen value and resolving the decade-long proton radius puzzle at the 1.3σ level. Systematic uncertainties are dominated by excited-state contamination, quantified by a model-average approach.',
    keywords: ['lattice QCD', 'proton radius', 'nuclear physics', 'high-performance computing'],
    type: 'Journal',
  },
  {
    id: 'pub14',
    title: 'Transformer-Based Weather Forecasting at Kilometre Scale',
    authors: ['Anders Eriksson', 'Sophie Laurent', 'Priya Sharma'],
    journal: 'Nature',
    year: 2024,
    status: 'Published',
    citations: 521,
    doi: '10.1038/s41586-024-07484-z',
    abstract: 'AtmosTFM, a 3-billion-parameter vision transformer trained on 40 years of ERA5 reanalysis data, produces deterministic 10-day global forecasts at 1 km horizontal resolution in 68 seconds on a single TPU pod. Compared to ECMWF HRES, AtmosTFM reduces RMSE for 500-hPa geopotential by 22% at day 5 and outperforms all operational models at lead times beyond day 7.',
    keywords: ['weather forecasting', 'deep learning', 'transformer', 'numerical weather prediction'],
    type: 'Journal',
  },
  {
    id: 'pub15',
    title: 'Organoid-on-Chip Model Recapitulates Human Blood–Brain Barrier Dysfunction in Alzheimer\'s Disease',
    authors: ['Lena Fischer', 'Aisha Okonkwo', 'Maria Rodriguez'],
    journal: 'Nature Biomedical Engineering',
    year: 2023,
    status: 'Published',
    citations: 267,
    doi: '10.1038/s41551-023-01143-9',
    abstract: 'A microfluidic chip incorporating iPSC-derived cerebral organoids and vascularoids recapitulates amyloid-β-induced barrier breakdown observed in Alzheimer\'s disease. High-content imaging of 384-chip arrays enables drug screening at throughput incompatible with traditional models; we identify three FDA-approved compounds that restore TEER to healthy levels.',
    keywords: ['organoid-on-chip', 'blood-brain barrier', 'Alzheimer\'s disease', 'iPSC', 'drug screening'],
    type: 'Journal',
  },
  {
    id: 'pub16',
    title: 'Programmable DNA Origami Nanostructures as Precision Drug Carriers',
    authors: ['Fatima Al-Hassan', 'Wei Zhang', 'Kenji Watanabe'],
    journal: 'ACS Central Science',
    year: 2024,
    status: 'Draft',
    citations: 0,
    doi: '',
    abstract: 'We describe a 3D DNA origami barrel capable of encapsulating up to 14 doxorubicin molecules and releasing its cargo in response to a tumour-specific microRNA trigger. In a mouse xenograft model of triple-negative breast cancer, targeted delivery reduces required dose by 8-fold while eliminating off-target cardiotoxicity.',
    keywords: ['DNA origami', 'drug delivery', 'nanostructure', 'cancer therapy', 'programmable matter'],
    type: 'Journal',
  },
  {
    id: 'pub17',
    title: 'Gravitational Wave Astronomy with Third-Generation Detectors: Science Cases for Einstein Telescope',
    authors: ['Marcus Hoffmann', 'Sophie Laurent', 'Liam O\'Brien'],
    journal: 'Living Reviews in Relativity',
    year: 2023,
    status: 'Published',
    citations: 389,
    doi: '10.1007/s41114-023-00042-1',
    abstract: 'We present a comprehensive science case for the Einstein Telescope, evaluating detection rates and parameter-estimation precision for binary mergers, supernovae, stochastic backgrounds, and exotic compact objects. ET is projected to detect 10⁵–10⁶ binary black hole mergers per year, enabling percent-level tests of strong-field general relativity.',
    keywords: ['gravitational waves', 'Einstein Telescope', 'neutron stars', 'black holes', 'general relativity'],
    type: 'Journal',
  },
  {
    id: 'pub18',
    title: 'Federated Learning Under Byzantine Adversaries with Provable Convergence Guarantees',
    authors: ['Raj Patel', 'Hiroshi Nakamura', 'Elena Volkova'],
    journal: 'ICML 2024',
    year: 2024,
    status: 'Published',
    citations: 74,
    doi: '10.48550/arXiv.2404.09218',
    abstract: 'We introduce RobustFed, an aggregation protocol that tolerates up to f Byzantine clients out of n total while achieving the same asymptotic convergence rate as FedAvg in the honest setting. Our analysis yields tight lower bounds on the required fraction of honest clients and demonstrates empirical robustness on CIFAR-100 with 40% malicious participants.',
    keywords: ['federated learning', 'Byzantine robustness', 'distributed optimization', 'privacy-preserving ML'],
    type: 'Conference',
  },
  {
    id: 'pub19',
    title: 'High-Entropy Alloy Catalysts for Green Ammonia Synthesis at Ambient Pressure',
    authors: ['David Park', 'Fatima Al-Hassan', 'Anders Eriksson'],
    journal: 'Nature Catalysis',
    year: 2024,
    status: 'Under Review',
    citations: 0,
    doi: '',
    abstract: 'A combinatorial screening of 2,400 quinary high-entropy alloy compositions identifies a Fe₂₀Co₁₅Ni₂₀Mo₂₀W₂₅ catalyst achieving nitrogen fixation at 25°C and 1 atm with a turnover frequency of 12.4 mmol NH₃ g⁻¹ h⁻¹—300× higher than the Haber-Bosch benchmark at ambient conditions. DFT calculations attribute activity to ensemble-engineered nitrogen adsorption geometry.',
    keywords: ['high-entropy alloys', 'nitrogen fixation', 'green ammonia', 'catalysis', 'sustainable chemistry'],
    type: 'Journal',
  },
  {
    id: 'pub20',
    title: 'Deciphering the Dark Matter Distribution in Dwarf Spheroidal Galaxies via Stellar Kinematics',
    authors: ['Yuki Tanaka', 'Marcus Hoffmann', 'Priya Sharma'],
    journal: 'Monthly Notices of the Royal Astronomical Society',
    year: 2023,
    status: 'Published',
    citations: 112,
    doi: '10.1093/mnras/stad3214',
    abstract: 'Spectroscopic velocities for 8,400 red giant stars in six Milky Way dwarf spheroidals constrain their dark matter density profiles with Bayesian Jeans modelling. All six galaxies favour cored profiles over NFW cusps at 3σ confidence, providing new evidence for self-interacting dark matter with cross-section σ/m ≈ 1 cm² g⁻¹.',
    keywords: ['dark matter', 'dwarf galaxies', 'stellar kinematics', 'self-interacting dark matter'],
    type: 'Journal',
  },
]

// ──────────────────────────────────────────────────────────────
// RESEARCHERS  (15)
// ──────────────────────────────────────────────────────────────
export const researchers: Researcher[] = [
  {
    id: 'r1', name: 'Dr. Sarah Chen', initials: 'SC', color: '#2563EB',
    role: 'Principal Investigator', dept: 'Physics', institution: 'MIT',
    interests: ['Quantum Computing', 'Superconducting Qubits', 'Quantum Error Correction'],
    hIndex: 38, publications: 72, collaborators: 24, citations: 4812,
    email: 'sarah.chen@mit.edu', orcid: '0000-0001-2345-6789',
    status: 'Active', joinDate: '2018-09-01',
  },
  {
    id: 'r2', name: 'Prof. James Wilson', initials: 'JW', color: '#7C3AED',
    role: 'Department Chair', dept: 'Biomedical Engineering', institution: 'Stanford University',
    interests: ['Synthetic Biology', 'Gene Therapy', 'Neural Interfaces'],
    hIndex: 52, publications: 148, collaborators: 41, citations: 11203,
    email: 'j.wilson@stanford.edu', orcid: '0000-0002-3456-7890',
    status: 'Active', joinDate: '2010-01-15',
  },
  {
    id: 'r3', name: 'Dr. Maria Rodriguez', initials: 'MR', color: '#14B8A6',
    role: 'Senior Researcher', dept: 'Molecular Biology', institution: 'ETH Zürich',
    interests: ['CRISPR', 'Epigenomics', 'Single-Cell Genomics'],
    hIndex: 29, publications: 54, collaborators: 19, citations: 3140,
    email: 'm.rodriguez@ethz.ch', orcid: '0000-0003-4567-8901',
    status: 'Active', joinDate: '2019-03-01',
  },
  {
    id: 'r4', name: 'Prof. Hiroshi Nakamura', initials: 'HN', color: '#F59E0B',
    role: 'Professor', dept: 'Electrical Engineering', institution: 'Caltech',
    interests: ['Neuromorphic Computing', 'Memristors', 'Analog AI'],
    hIndex: 44, publications: 103, collaborators: 32, citations: 7654,
    email: 'h.nakamura@caltech.edu', orcid: '0000-0004-5678-9012',
    status: 'Active', joinDate: '2015-08-15',
  },
  {
    id: 'r5', name: 'Dr. Sophie Laurent', initials: 'SL', color: '#EF4444',
    role: 'Research Scientist', dept: 'Earth Sciences', institution: 'Max Planck Institute for Meteorology',
    interests: ['Climate Modelling', 'Ocean Circulation', 'Paleoclimatology'],
    hIndex: 31, publications: 61, collaborators: 27, citations: 4217,
    email: 's.laurent@mpimet.mpg.de', orcid: '0000-0005-6789-0123',
    status: 'Active', joinDate: '2017-11-01',
  },
  {
    id: 'r6', name: 'Dr. Aisha Okonkwo', initials: 'AO', color: '#8B5CF6',
    role: 'Assistant Professor', dept: 'Neuroscience', institution: 'Oxford University',
    interests: ['Connectomics', 'Synaptic Plasticity', 'Neural Circuit Mapping'],
    hIndex: 22, publications: 38, collaborators: 16, citations: 1892,
    email: 'a.okonkwo@ox.ac.uk', orcid: '0000-0006-7890-1234',
    status: 'Active', joinDate: '2021-01-10',
  },
  {
    id: 'r7', name: 'Dr. Wei Zhang', initials: 'WZ', color: '#10B981',
    role: 'Postdoctoral Fellow', dept: 'Condensed Matter Physics', institution: 'MIT',
    interests: ['Topological Materials', 'Moiré Physics', '2D Materials'],
    hIndex: 15, publications: 21, collaborators: 11, citations: 987,
    email: 'w.zhang@mit.edu', orcid: '0000-0007-8901-2345',
    status: 'Active', joinDate: '2022-09-01',
  },
  {
    id: 'r8', name: 'Prof. Anders Eriksson', initials: 'AE', color: '#06B6D4',
    role: 'Professor', dept: 'Atmospheric Science', institution: 'Max Planck Institute for Meteorology',
    interests: ['Machine Learning for Weather', 'Climate Dynamics', 'Extreme Events'],
    hIndex: 47, publications: 119, collaborators: 38, citations: 9341,
    email: 'a.eriksson@mpimet.mpg.de', orcid: '0000-0008-9012-3456',
    status: 'Active', joinDate: '2012-04-01',
  },
  {
    id: 'r9', name: 'Dr. Fatima Al-Hassan', initials: 'FA', color: '#EC4899',
    role: 'Research Scientist', dept: 'Chemical Engineering', institution: 'NIH National Cancer Institute',
    interests: ['DNA Nanotechnology', 'Drug Delivery', 'Nanotoxicology'],
    hIndex: 26, publications: 47, collaborators: 21, citations: 2803,
    email: 'f.alhassan@nci.nih.gov', orcid: '0000-0009-0123-4567',
    status: 'Active', joinDate: '2020-06-15',
  },
  {
    id: 'r10', name: 'Dr. Marcus Hoffmann', initials: 'MH', color: '#6366F1',
    role: 'Associate Professor', dept: 'Theoretical Physics', institution: 'Max Planck Institute for Gravitational Physics',
    interests: ['Gravitational Waves', 'Lattice QCD', 'Computational Physics'],
    hIndex: 35, publications: 79, collaborators: 29, citations: 5678,
    email: 'm.hoffmann@aei.mpg.de', orcid: '0000-0010-1234-5678',
    status: 'Active', joinDate: '2016-07-01',
  },
  {
    id: 'r11', name: 'Dr. Raj Patel', initials: 'RP', color: '#F97316',
    role: 'Research Engineer', dept: 'Computer Science', institution: 'Stanford University',
    interests: ['Federated Learning', 'Trustworthy AI', 'Distributed Systems'],
    hIndex: 19, publications: 33, collaborators: 14, citations: 1456,
    email: 'raj.patel@stanford.edu', orcid: '0000-0011-2345-6789',
    status: 'Active', joinDate: '2021-09-01',
  },
  {
    id: 'r12', name: 'Dr. Elena Volkova', initials: 'EV', color: '#84CC16',
    role: 'Senior Research Scientist', dept: 'Computational Biology', institution: 'ETH Zürich',
    interests: ['Protein Structure', 'Bioinformatics', 'Systems Biology'],
    hIndex: 28, publications: 52, collaborators: 22, citations: 3021,
    email: 'e.volkova@ethz.ch', orcid: '0000-0012-3456-7890',
    status: 'Active', joinDate: '2018-02-01',
  },
  {
    id: 'r13', name: 'Dr. David Park', initials: 'DP', color: '#A855F7',
    role: 'Assistant Professor', dept: 'Materials Science', institution: 'Caltech',
    interests: ['Battery Technology', 'High-Entropy Alloys', 'Nanomaterials'],
    hIndex: 23, publications: 41, collaborators: 17, citations: 2134,
    email: 'd.park@caltech.edu', orcid: '0000-0013-4567-8901',
    status: 'Active', joinDate: '2020-08-15',
  },
  {
    id: 'r14', name: 'Dr. Lena Fischer', initials: 'LF', color: '#0EA5E9',
    role: 'Group Leader', dept: 'Bioengineering', institution: 'ETH Zürich',
    interests: ['Organ-on-Chip', 'Neurodegenerative Disease', 'Stem Cell Biology'],
    hIndex: 24, publications: 44, collaborators: 18, citations: 2567,
    email: 'l.fischer@ethz.ch', orcid: '0000-0014-5678-9012',
    status: 'Active', joinDate: '2019-10-01',
  },
  {
    id: 'r15', name: 'Dr. Priya Sharma', initials: 'PS', color: '#22D3EE',
    role: 'Postdoctoral Researcher', dept: 'Astrophysics', institution: 'Oxford University',
    interests: ['Dark Matter', 'Galaxy Formation', 'Exoplanet Atmospheres'],
    hIndex: 12, publications: 18, collaborators: 9, citations: 634,
    email: 'p.sharma@ox.ac.uk', orcid: '0000-0015-6789-0123',
    status: 'Active', joinDate: '2023-01-15',
  },
]

// ──────────────────────────────────────────────────────────────
// INSTITUTIONS  (10)
// ──────────────────────────────────────────────────────────────
export const institutions: Institution[] = [
  {
    id: 'i1', name: 'MIT', country: 'USA', type: 'University',
    researchers: 312, projects: 87, budget: 245000000,
    status: 'Active', established: 1861, website: 'https://www.mit.edu',
  },
  {
    id: 'i2', name: 'Stanford University', country: 'USA', type: 'University',
    researchers: 289, projects: 94, budget: 312000000,
    status: 'Active', established: 1885, website: 'https://www.stanford.edu',
  },
  {
    id: 'i3', name: 'ETH Zürich', country: 'Switzerland', type: 'University',
    researchers: 198, projects: 63, budget: 178000000,
    status: 'Active', established: 1855, website: 'https://ethz.ch',
  },
  {
    id: 'i4', name: 'Oxford University', country: 'UK', type: 'University',
    researchers: 267, projects: 72, budget: 201000000,
    status: 'Active', established: 1096, website: 'https://www.ox.ac.uk',
  },
  {
    id: 'i5', name: 'Caltech', country: 'USA', type: 'University',
    researchers: 134, projects: 48, budget: 189000000,
    status: 'Active', established: 1891, website: 'https://www.caltech.edu',
  },
  {
    id: 'i6', name: 'NIH National Cancer Institute', country: 'USA', type: 'Government',
    researchers: 421, projects: 156, budget: 650000000,
    status: 'Active', established: 1937, website: 'https://www.cancer.gov',
  },
  {
    id: 'i7', name: 'Max Planck Institute for Meteorology', country: 'Germany', type: 'Research Lab',
    researchers: 89, projects: 31, budget: 67000000,
    status: 'Active', established: 1975, website: 'https://www.mpimet.mpg.de',
  },
  {
    id: 'i8', name: 'Max Planck Institute for Gravitational Physics', country: 'Germany', type: 'Research Lab',
    researchers: 76, projects: 24, budget: 54000000,
    status: 'Active', established: 1995, website: 'https://www.aei.mpg.de',
  },
  {
    id: 'i9', name: 'CERN', country: 'Switzerland', type: 'Research Lab',
    researchers: 1102, projects: 41, budget: 1200000000,
    status: 'Active', established: 1954, website: 'https://home.cern',
  },
  {
    id: 'i10', name: 'Broad Institute', country: 'USA', type: 'Research Lab',
    researchers: 384, projects: 112, budget: 420000000,
    status: 'Active', established: 2004, website: 'https://www.broadinstitute.org',
  },
]

// ──────────────────────────────────────────────────────────────
// PROJECTS  (12)
// ──────────────────────────────────────────────────────────────
export const projects: Project[] = [
  {
    id: 'pr1', name: 'QuantumNet: Distributed Quantum Computing Infrastructure',
    desc: 'Building a distributed quantum computing network spanning three continents, targeting 1000-logical-qubit fault-tolerant computation by 2027.',
    lead: 'Dr. Sarah Chen', institution: 'MIT',
    members: ['Dr. Sarah Chen', 'Dr. Wei Zhang', 'Prof. Hiroshi Nakamura'],
    progress: 68, status: 'On Track',
    start: '2023-01-15', end: '2027-12-31', budget: 18500000,
    milestones: [
      { name: 'Prototype 50-qubit node', date: '2023-09-30', completed: true },
      { name: '5-node network demonstration', date: '2024-06-30', completed: true },
      { name: '100-logical-qubit milestone', date: '2025-06-30', completed: false },
      { name: 'Intercontinental link test', date: '2026-03-31', completed: false },
    ],
  },
  {
    id: 'pr2', name: 'CRISPR Therapeutics Pipeline for Haematological Disorders',
    desc: 'Preclinical and Phase I clinical development of CRISPR-Cas12a base editors targeting sickle cell disease and beta-thalassemia.',
    lead: 'Dr. Maria Rodriguez', institution: 'ETH Zürich',
    members: ['Dr. Maria Rodriguez', 'Prof. James Wilson', 'Dr. Fatima Al-Hassan'],
    progress: 52, status: 'On Track',
    start: '2022-06-01', end: '2026-05-31', budget: 24000000,
    milestones: [
      { name: 'In vitro efficacy validation', date: '2023-03-31', completed: true },
      { name: 'Mouse model safety study', date: '2023-12-31', completed: true },
      { name: 'Non-human primate toxicology', date: '2025-03-31', completed: false },
      { name: 'IND filing submission', date: '2025-12-31', completed: false },
    ],
  },
  {
    id: 'pr3', name: 'NeuromorphAI: Brain-Inspired Computing Hardware Platform',
    desc: 'Developing a wafer-scale neuromorphic chip with 10 billion artificial synapses targeting real-time edge AI inference.',
    lead: 'Prof. Hiroshi Nakamura', institution: 'Caltech',
    members: ['Prof. Hiroshi Nakamura', 'Dr. Raj Patel', 'Dr. Elena Volkova'],
    progress: 81, status: 'Ahead',
    start: '2022-01-01', end: '2025-12-31', budget: 31000000,
    milestones: [
      { name: 'Memristor array tape-out v1', date: '2022-12-31', completed: true },
      { name: '1M-synapse benchmark', date: '2023-09-30', completed: true },
      { name: '1B-synapse wafer demo', date: '2024-09-30', completed: true },
      { name: 'Full platform release', date: '2025-06-30', completed: false },
    ],
  },
  {
    id: 'pr4', name: 'Global Ocean Heat Transport Monitoring Network',
    desc: 'Deploying 500 deep-Argo floats and 12 mooring arrays to measure global ocean heat uptake and circulation changes at weekly resolution.',
    lead: 'Dr. Sophie Laurent', institution: 'Max Planck Institute for Meteorology',
    members: ['Dr. Sophie Laurent', 'Prof. Anders Eriksson', 'Dr. Priya Sharma'],
    progress: 44, status: 'At Risk',
    start: '2023-04-01', end: '2028-03-31', budget: 12000000,
    milestones: [
      { name: 'First 100 floats deployed', date: '2023-12-31', completed: true },
      { name: 'Data assimilation pipeline', date: '2024-06-30', completed: false },
      { name: 'Full array deployment', date: '2025-12-31', completed: false },
      { name: 'First annual synthesis report', date: '2026-06-30', completed: false },
    ],
  },
  {
    id: 'pr5', name: 'Whole-Brain Connectome Atlas: Zebrafish to Mouse',
    desc: 'Extending ExFISH-EM connectomics pipeline to produce a complete synaptic wiring diagram of the mouse cortex.',
    lead: 'Dr. Aisha Okonkwo', institution: 'Oxford University',
    members: ['Dr. Aisha Okonkwo', 'Dr. Lena Fischer', 'Prof. James Wilson'],
    progress: 37, status: 'On Track',
    start: '2024-01-01', end: '2028-12-31', budget: 22500000,
    milestones: [
      { name: 'Zebrafish connectome complete', date: '2024-09-30', completed: true },
      { name: 'Drosophila validation', date: '2025-06-30', completed: false },
      { name: 'Mouse cortical column pilot', date: '2026-06-30', completed: false },
      { name: 'Full mouse atlas release', date: '2028-06-30', completed: false },
    ],
  },
  {
    id: 'pr6', name: 'AI-Guided Climate Tipping Point Early Warning System',
    desc: 'Developing machine learning models to detect early warning signals of climate tipping points using satellite, in-situ and reanalysis data.',
    lead: 'Prof. Anders Eriksson', institution: 'Max Planck Institute for Meteorology',
    members: ['Prof. Anders Eriksson', 'Dr. Sophie Laurent', 'Dr. Raj Patel'],
    progress: 59, status: 'On Track',
    start: '2023-07-01', end: '2026-06-30', budget: 8700000,
    milestones: [
      { name: 'Dataset curation & preprocessing', date: '2023-12-31', completed: true },
      { name: 'Transformer model v1 trained', date: '2024-06-30', completed: true },
      { name: 'Operational prototype deployed', date: '2025-03-31', completed: false },
      { name: 'WMO integration pilot', date: '2026-01-31', completed: false },
    ],
  },
  {
    id: 'pr7', name: 'Next-Generation Li-S Battery for Aviation Electrification',
    desc: 'Engineering carbon-nanotube cathodes and solid-state electrolytes to achieve 600 Wh/kg cells suitable for short-haul electric aircraft.',
    lead: 'Dr. David Park', institution: 'Caltech',
    members: ['Dr. David Park', 'Dr. Fatima Al-Hassan', 'Prof. Hiroshi Nakamura'],
    progress: 48, status: 'At Risk',
    start: '2023-10-01', end: '2027-09-30', budget: 15600000,
    milestones: [
      { name: 'Pouch cell 400 Wh/kg demo', date: '2024-09-30', completed: true },
      { name: 'Solid electrolyte integration', date: '2025-06-30', completed: false },
      { name: '500 Wh/kg prototype', date: '2026-03-31', completed: false },
      { name: 'Aviation qualification test', date: '2027-03-31', completed: false },
    ],
  },
  {
    id: 'pr8', name: 'Federated Clinical Trial Data Platform',
    desc: 'Building a privacy-preserving federated learning infrastructure allowing multi-site clinical trial analysis without raw data sharing.',
    lead: 'Dr. Raj Patel', institution: 'Stanford University',
    members: ['Dr. Raj Patel', 'Dr. Elena Volkova', 'Prof. James Wilson'],
    progress: 73, status: 'Ahead',
    start: '2023-03-01', end: '2025-08-31', budget: 6200000,
    milestones: [
      { name: 'Privacy framework design', date: '2023-09-30', completed: true },
      { name: '5-site pilot deployment', date: '2024-06-30', completed: true },
      { name: 'Regulatory compliance audit', date: '2024-12-31', completed: true },
      { name: 'Platform public release', date: '2025-06-30', completed: false },
    ],
  },
  {
    id: 'pr9', name: 'Einstein Telescope Site Characterisation & Instrumentation',
    desc: 'Seismic, geological, and cryogenic mirror characterisation for the proposed Einstein Telescope site in the Euregio Meuse-Rhine.',
    lead: 'Dr. Marcus Hoffmann', institution: 'Max Planck Institute for Gravitational Physics',
    members: ['Dr. Marcus Hoffmann', 'Dr. Priya Sharma', 'Dr. Sophie Laurent'],
    progress: 62, status: 'On Track',
    start: '2022-09-01', end: '2026-08-31', budget: 19000000,
    milestones: [
      { name: 'Seismic noise baseline measurement', date: '2023-06-30', completed: true },
      { name: 'Cryogenic mirror testbed', date: '2024-06-30', completed: true },
      { name: 'Site report to EU Commission', date: '2025-03-31', completed: false },
      { name: 'Full instrumentation TDR', date: '2026-03-31', completed: false },
    ],
  },
  {
    id: 'pr10', name: 'Precision Oncology with Single-Cell Multi-Omics',
    desc: 'Profiling 500,000 tumour and microenvironment cells across 12 cancer types to build a multimodal atlas guiding personalised therapy selection.',
    lead: 'Dr. Maria Rodriguez', institution: 'ETH Zürich',
    members: ['Dr. Maria Rodriguez', 'Dr. Lena Fischer', 'Dr. Aisha Okonkwo'],
    progress: 29, status: 'Delayed',
    start: '2024-03-01', end: '2028-02-28', budget: 28000000,
    milestones: [
      { name: 'Sample collection protocol approved', date: '2024-06-30', completed: true },
      { name: '50k cells pilot atlas', date: '2025-03-31', completed: false },
      { name: 'Computational analysis pipeline v1', date: '2025-09-30', completed: false },
      { name: 'Public data release v1', date: '2026-12-31', completed: false },
    ],
  },
  {
    id: 'pr11', name: 'Programmable Nanomedicine for Targeted Immunotherapy',
    desc: 'Designing and testing DNA origami nanocarriers that activate T-cell responses specifically within the tumour microenvironment.',
    lead: 'Dr. Fatima Al-Hassan', institution: 'NIH National Cancer Institute',
    members: ['Dr. Fatima Al-Hassan', 'Dr. Maria Rodriguez', 'Prof. James Wilson'],
    progress: 55, status: 'On Track',
    start: '2023-08-01', end: '2026-07-31', budget: 9800000,
    milestones: [
      { name: 'Nanocarrier library synthesis', date: '2024-02-29', completed: true },
      { name: 'In vitro T-cell activation assay', date: '2024-09-30', completed: true },
      { name: 'In vivo efficacy (mouse)', date: '2025-06-30', completed: false },
      { name: 'Toxicology study completion', date: '2026-01-31', completed: false },
    ],
  },
  {
    id: 'pr12', name: 'Galaxy Dark Matter Mapping with Euclid Space Telescope',
    desc: 'Analysing Euclid weak-lensing and spectroscopic data to produce the highest-resolution dark matter map of 10 billion light-years of large-scale structure.',
    lead: 'Dr. Priya Sharma', institution: 'Oxford University',
    members: ['Dr. Priya Sharma', 'Dr. Marcus Hoffmann', 'Dr. Sophie Laurent'],
    progress: 18, status: 'On Track',
    start: '2024-06-01', end: '2029-05-31', budget: 14000000,
    milestones: [
      { name: 'Euclid Q1 data access granted', date: '2024-09-30', completed: true },
      { name: 'Shape measurement pipeline validated', date: '2025-06-30', completed: false },
      { name: 'Year-1 lensing map release', date: '2026-06-30', completed: false },
      { name: 'Dark matter power spectrum paper', date: '2027-12-31', completed: false },
    ],
  },
]

// ──────────────────────────────────────────────────────────────
// CONFERENCES  (10)
// ──────────────────────────────────────────────────────────────
export const conferences: Conference[] = [
  {
    id: 'c1', name: 'International Conference on Quantum Computing (ICQC 2025)',
    location: 'Vienna, Austria', date: '2025-09-15', deadline: '2025-04-30',
    status: 'Open', submissions: 412, attendees: 1800,
    website: 'https://icqc2025.org',
    topics: ['Quantum Error Correction', 'Quantum Algorithms', 'Quantum Hardware', 'Quantum Networking'],
  },
  {
    id: 'c2', name: 'CRISPR & Genome Editing World Congress 2025',
    location: 'San Diego, CA, USA', date: '2025-10-07', deadline: '2025-05-15',
    status: 'Open', submissions: 287, attendees: 2200,
    website: 'https://crispr-congress.com',
    topics: ['Base Editing', 'Prime Editing', 'In Vivo Delivery', 'Clinical Applications'],
  },
  {
    id: 'c3', name: 'NeurIPS 2025',
    location: 'New Orleans, LA, USA', date: '2025-12-08', deadline: '2025-05-23',
    status: 'Closed', submissions: 15234, attendees: 16000,
    website: 'https://neurips.cc/2025',
    topics: ['Deep Learning', 'Reinforcement Learning', 'Generative Models', 'AI Safety', 'Neuromorphic AI'],
  },
  {
    id: 'c4', name: 'American Geophysical Union Fall Meeting 2025',
    location: 'Washington D.C., USA', date: '2025-12-15', deadline: '2025-08-06',
    status: 'Open', submissions: 22000, attendees: 25000,
    website: 'https://www.agu.org/fall-meeting',
    topics: ['Climate Change', 'Ocean Science', 'Atmospheric Science', 'Geophysics', 'Planetary Science'],
  },
  {
    id: 'c5', name: 'ICML 2025',
    location: 'Sydney, Australia', date: '2025-07-13', deadline: '2025-02-06',
    status: 'Closed', submissions: 11320, attendees: 12000,
    website: 'https://icml.cc/2025',
    topics: ['Machine Learning Theory', 'Federated Learning', 'Causal Inference', 'Optimization'],
  },
  {
    id: 'c6', name: 'Biophysical Society Annual Meeting 2026',
    location: 'Seattle, WA, USA', date: '2026-02-28', deadline: '2025-11-01',
    status: 'Upcoming', submissions: 0, attendees: 7000,
    website: 'https://www.biophysics.org/annual-meeting',
    topics: ['Structural Biology', 'Single-Molecule Methods', 'Membrane Biophysics', 'Protein Dynamics'],
  },
  {
    id: 'c7', name: 'European Conference on Gravitational Wave Astronomy (ECGWA 2025)',
    location: 'Sardinia, Italy', date: '2025-11-03', deadline: '2025-07-31',
    status: 'Open', submissions: 198, attendees: 600,
    website: 'https://ecgwa2025.eu',
    topics: ['Binary Mergers', 'Multi-Messenger Astronomy', 'Data Analysis', 'Third-Generation Detectors'],
  },
  {
    id: 'c8', name: 'Society for Neuroscience Annual Meeting (SfN 2025)',
    location: 'Chicago, IL, USA', date: '2025-10-25', deadline: '2025-06-12',
    status: 'Open', submissions: 18000, attendees: 30000,
    website: 'https://www.sfn.org/meetings/neuroscience',
    topics: ['Neural Circuits', 'Computational Neuroscience', 'Neurological Disease', 'Brain-Computer Interfaces'],
  },
  {
    id: 'c9', name: 'Materials Research Society Fall Meeting 2025',
    location: 'Boston, MA, USA', date: '2025-12-01', deadline: '2025-06-30',
    status: 'Open', submissions: 6400, attendees: 7500,
    website: 'https://www.mrs.org/fall2025',
    topics: ['Energy Materials', 'Nanomaterials', 'Biomaterials', '2D Materials', 'Quantum Materials'],
  },
  {
    id: 'c10', name: 'International Astronomical Union General Assembly 2027',
    location: 'Cape Town, South Africa', date: '2027-08-07', deadline: '2027-01-15',
    status: 'Upcoming', submissions: 0, attendees: 3500,
    website: 'https://www.iau.org/ga2027',
    topics: ['Dark Matter', 'Exoplanets', 'Stellar Astrophysics', 'Cosmology', 'Radio Astronomy'],
  },
]

// ──────────────────────────────────────────────────────────────
// REVIEWS  (15)
// ──────────────────────────────────────────────────────────────
export const reviews: Review[] = [
  {
    id: 'rev1', paperId: 'ext-p101',
    paperTitle: 'Variational Quantum Eigensolver with Noise-Adaptive Ansatz',
    reviewer: 'Dr. Sarah Chen', assignedDate: '2025-06-01', dueDate: '2025-07-15',
    status: 'Completed', priority: 'High', score: 7,
    feedback: 'Technically sound. The noise-adaptive ansatz shows a clear advantage on near-term hardware. Minor revisions needed regarding benchmarking against classical baselines.',
    journal: 'Physical Review X',
  },
  {
    id: 'rev2', paperId: 'ext-p102',
    paperTitle: 'Off-target Analysis of Cas9 Variants in Human Primary Cells',
    reviewer: 'Dr. Maria Rodriguez', assignedDate: '2025-06-10', dueDate: '2025-07-25',
    status: 'In Progress', priority: 'High', score: null, feedback: null,
    journal: 'Nature Biotechnology',
  },
  {
    id: 'rev3', paperId: 'ext-p103',
    paperTitle: 'Spiking Neural Network Training via STDP on FPGA',
    reviewer: 'Prof. Hiroshi Nakamura', assignedDate: '2025-05-20', dueDate: '2025-07-05',
    status: 'Overdue', priority: 'Medium', score: null, feedback: null,
    journal: 'IEEE Transactions on Neural Networks',
  },
  {
    id: 'rev4', paperId: 'ext-p104',
    paperTitle: 'Stratospheric Aerosol Injection: Regional Climate Impacts',
    reviewer: 'Dr. Sophie Laurent', assignedDate: '2025-06-15', dueDate: '2025-08-01',
    status: 'Pending', priority: 'Medium', score: null, feedback: null,
    journal: 'Geophysical Research Letters',
  },
  {
    id: 'rev5', paperId: 'ext-p105',
    paperTitle: 'AlphaFold3 Accuracy on Multimeric Protein Complexes',
    reviewer: 'Dr. Elena Volkova', assignedDate: '2025-06-05', dueDate: '2025-07-20',
    status: 'Completed', priority: 'High', score: 9,
    feedback: 'Excellent systematic benchmark. The comparison with crystal structures is rigorous. Recommend accept after addressing the discussion of disordered regions.',
    journal: 'Nature Structural & Molecular Biology',
  },
  {
    id: 'rev6', paperId: 'ext-p106',
    paperTitle: 'Siamese Networks for Cross-Modal Scientific Image Retrieval',
    reviewer: 'Dr. Raj Patel', assignedDate: '2025-07-01', dueDate: '2025-08-15',
    status: 'Pending', priority: 'Low', score: null, feedback: null,
    journal: 'ICML 2025',
  },
  {
    id: 'rev7', paperId: 'ext-p107',
    paperTitle: 'Ocean Carbon Uptake Under Climate Intervention Scenarios',
    reviewer: 'Prof. Anders Eriksson', assignedDate: '2025-06-20', dueDate: '2025-08-05',
    status: 'In Progress', priority: 'Medium', score: null, feedback: null,
    journal: 'Nature Climate Change',
  },
  {
    id: 'rev8', paperId: 'ext-p108',
    paperTitle: 'Synaptic Tagging and Capture in Hippocampal CA1 Circuits',
    reviewer: 'Dr. Aisha Okonkwo', assignedDate: '2025-05-15', dueDate: '2025-06-30',
    status: 'Completed', priority: 'High', score: 8,
    feedback: 'Strong experimental evidence for synaptic tagging. The optogenetic controls are well-designed. Revisions requested on statistics for the calcium imaging data.',
    journal: 'Neuron',
  },
  {
    id: 'rev9', paperId: 'ext-p109',
    paperTitle: 'Solid-State NMR Characterisation of Lithium-Ion Conductor Interfaces',
    reviewer: 'Dr. David Park', assignedDate: '2025-07-05', dueDate: '2025-08-20',
    status: 'Pending', priority: 'Medium', score: null, feedback: null,
    journal: 'Journal of the American Chemical Society',
  },
  {
    id: 'rev10', paperId: 'ext-p110',
    paperTitle: 'iPSC-Derived Hepatocytes for Drug-Induced Liver Injury Screening',
    reviewer: 'Dr. Lena Fischer', assignedDate: '2025-06-25', dueDate: '2025-08-10',
    status: 'In Progress', priority: 'High', score: null, feedback: null,
    journal: 'Cell Reports Medicine',
  },
  {
    id: 'rev11', paperId: 'ext-p111',
    paperTitle: 'Post-Newtonian Waveform Models for Eccentric Binary Systems',
    reviewer: 'Dr. Marcus Hoffmann', assignedDate: '2025-05-28', dueDate: '2025-07-12',
    status: 'Completed', priority: 'High', score: 8,
    feedback: 'Waveform model is technically rigorous and well-benchmarked against NR. Recommend publication with minor revisions concerning the high-eccentricity regime.',
    journal: 'Physical Review D',
  },
  {
    id: 'rev12', paperId: 'ext-p112',
    paperTitle: 'Differential Privacy Guarantees in Language Model Fine-tuning',
    reviewer: 'Dr. Raj Patel', assignedDate: '2025-06-30', dueDate: '2025-08-14',
    status: 'Pending', priority: 'Medium', score: null, feedback: null,
    journal: 'NeurIPS 2025',
  },
  {
    id: 'rev13', paperId: 'ext-p113',
    paperTitle: 'JWST Photometric Redshifts for z > 10 Galaxy Candidates',
    reviewer: 'Dr. Priya Sharma', assignedDate: '2025-06-18', dueDate: '2025-08-03',
    status: 'In Progress', priority: 'Medium', score: null, feedback: null,
    journal: 'The Astrophysical Journal',
  },
  {
    id: 'rev14', paperId: 'ext-p114',
    paperTitle: 'Lipid Nanoparticle Formulations for CNS mRNA Delivery',
    reviewer: 'Dr. Fatima Al-Hassan', assignedDate: '2025-05-10', dueDate: '2025-06-24',
    status: 'Overdue', priority: 'High', score: null, feedback: null,
    journal: 'ACS Nano',
  },
  {
    id: 'rev15', paperId: 'ext-p115',
    paperTitle: 'Topological Invariants of Non-Hermitian Hamiltonians',
    reviewer: 'Dr. Wei Zhang', assignedDate: '2025-07-08', dueDate: '2025-08-22',
    status: 'Pending', priority: 'Low', score: null, feedback: null,
    journal: 'Physical Review Research',
  },
]

// ──────────────────────────────────────────────────────────────
// EVENTS  (8)
// ──────────────────────────────────────────────────────────────
export const events: Event[] = [
  {
    id: 'ev1', title: 'Quantum Computing Bootcamp 2025',
    type: 'Workshop', date: '2025-08-12', location: 'MIT Building 26, Cambridge MA',
    attendees: 34, maxAttendees: 40, registered: true,
    description: 'A three-day intensive workshop on quantum circuit design, error mitigation, and cloud-based quantum hardware access. Hands-on sessions using IBM Quantum and IonQ systems.',
  },
  {
    id: 'ev2', title: 'CRISPR Ethics and Governance Seminar',
    type: 'Seminar', date: '2025-09-03', location: 'Zurich University Main Hall, Zürich',
    attendees: 87, maxAttendees: 120, registered: false,
    description: 'Expert panel on regulatory frameworks for germline genome editing, intellectual property in CRISPR therapeutics, and patient access equity. Featuring speakers from WHO, EMA, and leading bioethics centres.',
  },
  {
    id: 'ev3', title: 'NeurIPS 2025 Social & Poster Preview',
    type: 'Conference', date: '2025-12-08', location: 'Ernest N. Morial Convention Center, New Orleans',
    attendees: 15800, maxAttendees: 16000, registered: true,
    description: 'Annual flagship machine learning conference. This session covers the main poster sessions on deep learning theory, LLMs, and AI safety alongside invited talks from top researchers.',
  },
  {
    id: 'ev4', title: 'Climate Tipping Points Webinar Series — Episode 4',
    type: 'Webinar', date: '2025-08-20', location: 'Online (Zoom)',
    attendees: 412, maxAttendees: 1000, registered: true,
    description: 'Episode 4 focuses on early warning signals in the Atlantic Meridional Overturning Circulation and Greenland Ice Sheet. Hosted by the Max Planck Institute for Meteorology.',
  },
  {
    id: 'ev5', title: 'Oxford Neuroscience Symposium 2025',
    type: 'Conference', date: '2025-10-14', location: 'Andrew Wiles Building, Oxford',
    attendees: 210, maxAttendees: 300, registered: false,
    description: 'Annual gathering of Oxford-affiliated neuroscientists covering connectomics, optogenetics, and neurological disease. Includes a special session on open-access brain atlases.',
  },
  {
    id: 'ev6', title: 'Materials for Energy Storage Workshop',
    type: 'Workshop', date: '2025-09-22', location: 'Caltech Beckman Institute, Pasadena CA',
    attendees: 61, maxAttendees: 80, registered: true,
    description: 'Two-day workshop on next-generation battery chemistries and supercapacitors. Includes lab tours and live demonstrations of operando electrochemical characterisation techniques.',
  },
  {
    id: 'ev7', title: 'Bioinformatics Data Analysis with Python — Live Tutorial',
    type: 'Webinar', date: '2025-08-05', location: 'Online (Gather.Town)',
    attendees: 278, maxAttendees: 500, registered: true,
    description: 'Hands-on tutorial covering single-cell RNA-seq analysis with Scanpy, spatial transcriptomics with Squidpy, and multi-omics integration using MOFA+. Participants need a laptop with Python 3.11.',
  },
  {
    id: 'ev8', title: 'Gravitational Wave Data Analysis School',
    type: 'Workshop', date: '2025-10-06', location: 'AEI Hannover, Germany',
    attendees: 45, maxAttendees: 50, registered: false,
    description: 'Ten-day school covering matched-filter searches, Bayesian parameter estimation, and machine learning pipelines for LIGO-Virgo-KAGRA data. Applications from PhD students and postdocs preferred.',
  },
]

// ──────────────────────────────────────────────────────────────
// AUDIT LOGS  (20)
// ──────────────────────────────────────────────────────────────
export const auditLogs: AuditLog[] = [
  { id: 'al1', user: 'Dr. Sarah Chen', action: 'LOGIN', resource: 'Authentication', timestamp: '2025-07-28T08:14:32Z', type: 'Info', ip: '18.204.31.7', details: 'Successful login via SSO (MIT Touchstone).' },
  { id: 'al2', user: 'Prof. James Wilson', action: 'PUBLICATION_SUBMIT', resource: 'Publications', timestamp: '2025-07-28T09:02:11Z', type: 'Info', ip: '171.64.15.22', details: 'Submitted "Reinforcement Learning for Autonomous Robotic Surgery" to Science Robotics.' },
  { id: 'al3', user: 'Alex Thompson', action: 'USER_ROLE_CHANGE', resource: 'Users', timestamp: '2025-07-28T09:45:00Z', type: 'Warning', ip: '10.0.0.5', details: 'Changed role of user u12 (Kenji Watanabe) from Researcher to Institution Admin.' },
  { id: 'al4', user: 'Dr. Maria Rodriguez', action: 'DATA_EXPORT', resource: 'Publications', timestamp: '2025-07-28T10:18:55Z', type: 'Info', ip: '82.130.100.45', details: 'Exported 54 publications to CSV for annual reporting.' },
  { id: 'al5', user: 'Unknown', action: 'FAILED_LOGIN', resource: 'Authentication', timestamp: '2025-07-28T10:33:44Z', type: 'Critical', ip: '185.220.101.24', details: 'Five consecutive failed login attempts for account e.volkova@ethz.ch from Tor exit node. Account temporarily locked.' },
  { id: 'al6', user: 'Prof. Hiroshi Nakamura', action: 'PROJECT_UPDATE', resource: 'Projects', timestamp: '2025-07-28T11:05:22Z', type: 'Info', ip: '131.215.8.44', details: 'Updated milestone "1B-synapse wafer demo" status to completed for project NeuromorphAI.' },
  { id: 'al7', user: 'Alex Thompson', action: 'SYSTEM_BACKUP', resource: 'System', timestamp: '2025-07-28T12:00:00Z', type: 'Info', ip: '10.0.0.5', details: 'Scheduled full database backup completed. 4.2 GB stored to S3 us-east-1.' },
  { id: 'al8', user: 'Dr. Raj Patel', action: 'API_KEY_GENERATE', resource: 'API', timestamp: '2025-07-28T13:22:11Z', type: 'Warning', ip: '171.64.25.90', details: 'New API key generated for federated-platform service account. Previous key revoked.' },
  { id: 'al9', user: 'Dr. Aisha Okonkwo', action: 'REVIEW_ASSIGNED', resource: 'Reviews', timestamp: '2025-07-28T14:01:38Z', type: 'Info', ip: '163.1.148.15', details: 'Review for "Synaptic Tagging and Capture in Hippocampal CA1 Circuits" marked as Completed with score 8.' },
  { id: 'al10', user: 'Dr. Sophie Laurent', action: 'CONFERENCE_REGISTER', resource: 'Conferences', timestamp: '2025-07-28T14:45:09Z', type: 'Info', ip: '136.172.0.33', details: 'Registered for AGU Fall Meeting 2025. Payment processed via institutional purchase order.' },
  { id: 'al11', user: 'Alex Thompson', action: 'PERMISSION_CHANGE', resource: 'System', timestamp: '2025-07-28T15:10:00Z', type: 'Warning', ip: '10.0.0.5', details: 'Granted GDPR data-erasure permission to user u2 (Prof. James Wilson) at Stanford admin request.' },
  { id: 'al12', user: 'Dr. Elena Volkova', action: 'ACCOUNT_UNLOCK', resource: 'Authentication', timestamp: '2025-07-28T15:30:00Z', type: 'Info', ip: '82.130.100.46', details: 'Account e.volkova@ethz.ch unlocked after identity verification via institutional helpdesk ticket #ETH-48821.' },
  { id: 'al13', user: 'Dr. Fatima Al-Hassan', action: 'FILE_UPLOAD', resource: 'Publications', timestamp: '2025-07-28T16:02:47Z', type: 'Info', ip: '137.187.5.12', details: 'Uploaded revised manuscript PDF (v3) for "Programmable DNA Origami Nanostructures as Precision Drug Carriers".' },
  { id: 'al14', user: 'Prof. Anders Eriksson', action: 'PROJECT_CREATE', resource: 'Projects', timestamp: '2025-07-28T16:44:23Z', type: 'Info', ip: '136.172.1.80', details: 'Created new sub-project "AMOC Tipping Point Forecast Module" under project AI-Guided Climate Tipping Point Early Warning System.' },
  { id: 'al15', user: 'Alex Thompson', action: 'DEPENDENCY_UPDATE', resource: 'System', timestamp: '2025-07-28T17:00:00Z', type: 'Warning', ip: '10.0.0.5', details: 'Updated 14 npm dependencies including CVE-2025-3881 (critical XSS in marked@4.3.0). Deployment queued.' },
  { id: 'al16', user: 'Dr. Marcus Hoffmann', action: 'PUBLICATION_CITE', resource: 'Publications', timestamp: '2025-07-29T08:30:15Z', type: 'Info', ip: '194.94.34.81', details: 'Citation import from ADS: 12 new citing articles identified for "Gravitational Wave Astronomy with Third-Generation Detectors".' },
  { id: 'al17', user: 'Dr. Lena Fischer', action: 'COLLABORATOR_INVITE', resource: 'Researchers', timestamp: '2025-07-29T09:15:44Z', type: 'Info', ip: '82.130.101.12', details: 'Invitation sent to Dr. Benedikt Müller (EMBL Heidelberg) to join Organoid-on-Chip sub-project.' },
  { id: 'al18', user: 'Unknown', action: 'API_RATE_LIMIT', resource: 'API', timestamp: '2025-07-29T10:00:01Z', type: 'Critical', ip: '45.33.32.156', details: '5,000 API requests/min threshold exceeded from IP 45.33.32.156. IP blocked for 1 hour. Possible credential stuffing attack.' },
  { id: 'al19', user: 'Dr. Wei Zhang', action: 'PREPRINT_SUBMIT', resource: 'Publications', timestamp: '2025-07-29T11:22:08Z', type: 'Info', ip: '18.204.31.9', details: 'Preprint "Anomalous Hall Effect in Moiré Heterostructures at 50 mK" submitted to arXiv cond-mat.mes-hall.' },
  { id: 'al20', user: 'Alex Thompson', action: 'LOGOUT', resource: 'Authentication', timestamp: '2025-07-29T17:59:59Z', type: 'Info', ip: '10.0.0.5', details: 'Admin session terminated after 8-hour inactivity timeout. Session logs archived.' },
]

// ──────────────────────────────────────────────────────────────
// DEPARTMENTS  (8)
// ──────────────────────────────────────────────────────────────
export const departments: Department[] = [
  { id: 'd1', name: 'Physics', head: 'Prof. John Doyle', institution: 'MIT', researchers: 48, projects: 14, budget: 32000000, publications: 187 },
  { id: 'd2', name: 'Biomedical Engineering', head: 'Prof. James Wilson', institution: 'Stanford University', researchers: 41, projects: 18, budget: 45000000, publications: 212 },
  { id: 'd3', name: 'Molecular Biology', head: 'Prof. Ruedi Aebersold', institution: 'ETH Zürich', researchers: 35, projects: 11, budget: 27000000, publications: 156 },
  { id: 'd4', name: 'Electrical Engineering', head: 'Prof. Hiroshi Nakamura', institution: 'Caltech', researchers: 29, projects: 9, budget: 38000000, publications: 143 },
  { id: 'd5', name: 'Earth Sciences', head: 'Prof. Bjorn Stevens', institution: 'Max Planck Institute for Meteorology', researchers: 22, projects: 8, budget: 18000000, publications: 98 },
  { id: 'd6', name: 'Neuroscience', head: 'Prof. Peter Somogyi', institution: 'Oxford University', researchers: 37, projects: 12, budget: 29000000, publications: 174 },
  { id: 'd7', name: 'Computer Science', head: 'Prof. Fei-Fei Li', institution: 'Stanford University', researchers: 53, projects: 21, budget: 51000000, publications: 289 },
  { id: 'd8', name: 'Cancer Biology', head: 'Dr. Harold Varmus', institution: 'NIH National Cancer Institute', researchers: 64, projects: 27, budget: 94000000, publications: 341 },
]

// ──────────────────────────────────────────────────────────────
// USERS  (20)
// ──────────────────────────────────────────────────────────────
export const users: User[] = [
  { id: 'u1', name: 'Dr. Sarah Chen', email: 'sarah.chen@mit.edu', role: 'Researcher', institution: 'MIT', status: 'Active', lastLogin: '2025-07-28T08:14:32Z', joinDate: '2018-09-01', permissions: ['read:publications', 'write:publications', 'read:projects', 'write:projects'] },
  { id: 'u2', name: 'Prof. James Wilson', email: 'j.wilson@stanford.edu', role: 'Institution Admin', institution: 'Stanford University', status: 'Active', lastLogin: '2025-07-27T14:22:00Z', joinDate: '2010-01-15', permissions: ['read:all', 'write:all', 'admin:institution', 'export:data'] },
  { id: 'u3', name: 'Dr. Maria Rodriguez', email: 'm.rodriguez@ethz.ch', role: 'Reviewer', institution: 'ETH Zürich', status: 'Active', lastLogin: '2025-07-28T10:18:55Z', joinDate: '2019-03-01', permissions: ['read:publications', 'write:reviews', 'read:conferences'] },
  { id: 'u4', name: 'Alex Thompson', email: 'a.thompson@scientific.app', role: 'System Admin', institution: 'Scientific Platform', status: 'Active', lastLogin: '2025-07-29T09:00:00Z', joinDate: '2020-01-01', permissions: ['read:all', 'write:all', 'admin:system', 'admin:users', 'export:all'] },
  { id: 'u5', name: 'Prof. Hiroshi Nakamura', email: 'h.nakamura@caltech.edu', role: 'Researcher', institution: 'Caltech', status: 'Active', lastLogin: '2025-07-28T11:05:22Z', joinDate: '2015-08-15', permissions: ['read:publications', 'write:publications', 'read:projects', 'write:projects'] },
  { id: 'u6', name: 'Dr. Sophie Laurent', email: 's.laurent@mpimet.mpg.de', role: 'Researcher', institution: 'Max Planck Institute for Meteorology', status: 'Active', lastLogin: '2025-07-28T14:45:09Z', joinDate: '2017-11-01', permissions: ['read:publications', 'write:publications', 'read:projects'] },
  { id: 'u7', name: 'Dr. Aisha Okonkwo', email: 'a.okonkwo@ox.ac.uk', role: 'Researcher', institution: 'Oxford University', status: 'Active', lastLogin: '2025-07-28T14:01:38Z', joinDate: '2021-01-10', permissions: ['read:publications', 'write:publications', 'write:reviews'] },
  { id: 'u8', name: 'Dr. Wei Zhang', email: 'w.zhang@mit.edu', role: 'Researcher', institution: 'MIT', status: 'Active', lastLogin: '2025-07-29T11:22:08Z', joinDate: '2022-09-01', permissions: ['read:publications', 'write:publications', 'read:projects'] },
  { id: 'u9', name: 'Prof. Anders Eriksson', email: 'a.eriksson@mpimet.mpg.de', role: 'Institution Admin', institution: 'Max Planck Institute for Meteorology', status: 'Active', lastLogin: '2025-07-28T16:44:23Z', joinDate: '2012-04-01', permissions: ['read:all', 'write:all', 'admin:institution'] },
  { id: 'u10', name: 'Dr. Fatima Al-Hassan', email: 'f.alhassan@nci.nih.gov', role: 'Researcher', institution: 'NIH National Cancer Institute', status: 'Active', lastLogin: '2025-07-28T16:02:47Z', joinDate: '2020-06-15', permissions: ['read:publications', 'write:publications', 'read:projects', 'write:projects'] },
  { id: 'u11', name: 'Dr. Marcus Hoffmann', email: 'm.hoffmann@aei.mpg.de', role: 'Reviewer', institution: 'Max Planck Institute for Gravitational Physics', status: 'Active', lastLogin: '2025-07-29T08:30:15Z', joinDate: '2016-07-01', permissions: ['read:publications', 'write:reviews', 'read:conferences'] },
  { id: 'u12', name: 'Dr. Kenji Watanabe', email: 'k.watanabe@caltech.edu', role: 'Institution Admin', institution: 'Caltech', status: 'Active', lastLogin: '2025-07-26T10:00:00Z', joinDate: '2020-03-01', permissions: ['read:all', 'write:all', 'admin:institution', 'export:data'] },
  { id: 'u13', name: 'Dr. Raj Patel', email: 'raj.patel@stanford.edu', role: 'Researcher', institution: 'Stanford University', status: 'Active', lastLogin: '2025-07-28T13:22:11Z', joinDate: '2021-09-01', permissions: ['read:publications', 'write:publications', 'read:projects', 'write:projects'] },
  { id: 'u14', name: 'Dr. Elena Volkova', email: 'e.volkova@ethz.ch', role: 'Reviewer', institution: 'ETH Zürich', status: 'Active', lastLogin: '2025-07-28T15:30:00Z', joinDate: '2018-02-01', permissions: ['read:publications', 'write:reviews', 'read:conferences'] },
  { id: 'u15', name: 'Dr. David Park', email: 'd.park@caltech.edu', role: 'Researcher', institution: 'Caltech', status: 'Active', lastLogin: '2025-07-25T09:15:00Z', joinDate: '2020-08-15', permissions: ['read:publications', 'write:publications', 'read:projects', 'write:projects'] },
  { id: 'u16', name: 'Dr. Lena Fischer', email: 'l.fischer@ethz.ch', role: 'Researcher', institution: 'ETH Zürich', status: 'Active', lastLogin: '2025-07-29T09:15:44Z', joinDate: '2019-10-01', permissions: ['read:publications', 'write:publications', 'read:projects', 'write:projects'] },
  { id: 'u17', name: 'Dr. Priya Sharma', email: 'p.sharma@ox.ac.uk', role: 'Researcher', institution: 'Oxford University', status: 'Active', lastLogin: '2025-07-28T12:00:00Z', joinDate: '2023-01-15', permissions: ['read:publications', 'write:publications', 'read:projects'] },
  { id: 'u18', name: 'Dr. Yuki Tanaka', email: 'y.tanaka@caltech.edu', role: 'Researcher', institution: 'Caltech', status: 'Inactive', lastLogin: '2025-05-10T08:00:00Z', joinDate: '2019-06-01', permissions: ['read:publications', 'write:publications'] },
  { id: 'u19', name: 'Dr. Liam O\'Brien', email: 'l.obrien@ox.ac.uk', role: 'Researcher', institution: 'Oxford University', status: 'Active', lastLogin: '2025-07-22T11:30:00Z', joinDate: '2020-10-01', permissions: ['read:publications', 'write:publications', 'read:projects'] },
  { id: 'u20', name: 'Ms. Clara Novak', email: 'c.novak@scientific.app', role: 'System Admin', institution: 'Scientific Platform', status: 'Pending', lastLogin: '', joinDate: '2025-07-25', permissions: ['read:system'] },
]

// ──────────────────────────────────────────────────────────────
// CITATIONS  (15)
// ──────────────────────────────────────────────────────────────
export const citations: Citation[] = [
  { id: 'cit1', paperTitle: 'Fault-Tolerant Quantum Computing via Surface Code Concatenation', citedBy: 'Scalable Quantum Networks Using Modular Superconducting Nodes', journal: 'Nature', year: 2025, authors: ['T. Rudolph', 'A. Ekert'], count: 47 },
  { id: 'cit2', paperTitle: 'CRISPR-Cas12a Base Editing for In Vivo Correction of Sickle Cell Mutations', citedBy: 'Prime Editing Corrects Beta-Thalassemia in Humanised Mice', journal: 'Cell', year: 2025, authors: ['D.R. Liu', 'A. Anzalone'], count: 63 },
  { id: 'cit3', paperTitle: 'Atlantic Meridional Overturning Circulation Slowdown', citedBy: 'Tipping Point Cascades in the Earth System', journal: 'Nature Climate Change', year: 2025, authors: ['T. Lenton', 'J. Rockström'], count: 112 },
  { id: 'cit4', paperTitle: 'Neuromorphic Computing with Memristive Synapses at Femtojoule Energy Scales', citedBy: 'Phase-Change Memory Synapses for Continual Learning', journal: 'Advanced Materials', year: 2025, authors: ['G. Burr', 'I. Boybat'], count: 38 },
  { id: 'cit5', paperTitle: 'Transformer-Based Weather Forecasting at Kilometre Scale', citedBy: 'Probabilistic Medium-Range Forecasting with Diffusion Models', journal: 'Nature', year: 2025, authors: ['S. Rasp', 'N. Thuerey'], count: 89 },
  { id: 'cit6', paperTitle: 'Whole-Brain Connectome Mapping with Expansion Microscopy', citedBy: 'Spatial Transcriptomics of the Adult Zebrafish Brain', journal: 'Science', year: 2024, authors: ['J. Bhatt', 'C. Bhatt'], count: 52 },
  { id: 'cit7', paperTitle: 'Deep Learning Prediction of Protein-Protein Interaction Surfaces', citedBy: 'Cryo-EM Validation of Computationally Predicted Antigen-Antibody Complexes', journal: 'Nature Structural & Molecular Biology', year: 2025, authors: ['K. Bhaskara', 'V. Bhaskara'], count: 21 },
  { id: 'cit8', paperTitle: 'Topological Superconductivity in Twisted Bilayer Graphene', citedBy: 'Josephson Junction Arrays in Moiré Superconductors', journal: 'Physical Review Letters', year: 2025, authors: ['P. Kim', 'B. Andrei'], count: 34 },
  { id: 'cit9', paperTitle: 'Carbon Nanotube Forest Electrodes for Lithium-Sulfur Batteries', citedBy: 'Selenium-Sulfur Composite Cathodes for High-Rate Li-S Batteries', journal: 'Advanced Energy Materials', year: 2024, authors: ['L. Nazar', 'X. Li'], count: 29 },
  { id: 'cit10', paperTitle: 'Exoplanet Atmosphere Characterisation with JWST NIRSpec', citedBy: 'A Rocky Planet with a Secondary Atmosphere in the Habitable Zone', journal: 'Astrophysical Journal', year: 2025, authors: ['S. Seager', 'J. Winn'], count: 18 },
  { id: 'cit11', paperTitle: 'Organoid-on-Chip Model Recapitulates Blood-Brain Barrier Dysfunction', citedBy: 'Vascularised Liver Organoids for Hepatitis B Drug Screening', journal: 'Nature Biomedical Engineering', year: 2025, authors: ['H. Clevers', 'A. Huch'], count: 41 },
  { id: 'cit12', paperTitle: 'Lattice QCD Calculation of the Proton Charge Radius', citedBy: 'Electron-Proton Scattering and the Proton Structure at Low Q²', journal: 'Physical Review D', year: 2024, authors: ['C. Alexandrou', 'G. Bali'], count: 23 },
  { id: 'cit13', paperTitle: 'Gravitational Wave Astronomy with Third-Generation Detectors', citedBy: 'Population Inference for Neutron Star Mergers with ET and CE', journal: 'Physical Review D', year: 2025, authors: ['M. Mapelli', 'S. Vitale'], count: 57 },
  { id: 'cit14', paperTitle: 'Federated Learning Under Byzantine Adversaries', citedBy: 'Communication-Efficient Robust Aggregation for Heterogeneous Networks', journal: 'NeurIPS 2025', year: 2025, authors: ['V. Smith', 'A. Ghosh'], count: 14 },
  { id: 'cit15', paperTitle: 'Scalable Synthesis of Perovskite Quantum Dots', citedBy: 'Blue Perovskite LEDs Exceeding 30% External Quantum Efficiency', journal: 'Nature Photonics', year: 2025, authors: ['H. Zeng', 'E. Sargent'], count: 36 },
]

// ──────────────────────────────────────────────────────────────
// NOTIFICATIONS  (10)
// ──────────────────────────────────────────────────────────────
export const notifications: Notification[] = [
  { id: 'n1', title: 'Review Assignment', message: 'You have been assigned to review "Variational Quantum Eigensolver with Noise-Adaptive Ansatz" for Physical Review X. Due date: 15 July 2025.', type: 'info', time: '2025-07-28T08:30:00Z', read: true },
  { id: 'n2', title: 'Publication Accepted', message: '"Reinforcement Learning for Autonomous Robotic Surgery" has been accepted by Science Robotics. Congratulations!', type: 'success', time: '2025-07-27T14:00:00Z', read: true },
  { id: 'n3', title: 'Review Overdue', message: 'Your review for "Spiking Neural Network Training via STDP on FPGA" (IEEE TNNLS) was due on 5 July 2025. Please submit as soon as possible.', type: 'warning', time: '2025-07-28T06:00:00Z', read: false },
  { id: 'n4', title: 'Failed Login Attempts', message: 'Multiple failed login attempts detected on account e.volkova@ethz.ch from an unrecognised IP. Account has been temporarily locked.', type: 'error', time: '2025-07-28T10:33:44Z', read: false },
  { id: 'n5', title: 'Conference Deadline Reminder', message: 'The submission deadline for ICQC 2025 is in 30 days (30 April 2025). You have 1 draft paper eligible for submission.', type: 'info', time: '2025-07-26T09:00:00Z', read: true },
  { id: 'n6', title: 'Project Milestone Completed', message: 'Milestone "1B-synapse wafer demo" in project NeuromorphAI has been marked as completed by Prof. Hiroshi Nakamura.', type: 'success', time: '2025-07-28T11:05:22Z', read: false },
  { id: 'n7', title: 'System Maintenance Scheduled', message: 'Scientific platform will be unavailable on Saturday 2 August 2025 from 02:00–06:00 UTC for scheduled security patching.', type: 'warning', time: '2025-07-25T12:00:00Z', read: true },
  { id: 'n8', title: 'New Citation Detected', message: 'Your paper "Gravitational Wave Astronomy with Third-Generation Detectors" received 12 new citations this week. Total citations: 389.', type: 'info', time: '2025-07-29T08:30:15Z', read: false },
  { id: 'n9', title: 'Collaboration Invitation', message: 'Dr. Lena Fischer has invited you to collaborate on project "Organoid-on-Chip: Alzheimer\'s Therapy Screening Phase II". Review and accept or decline.', type: 'info', time: '2025-07-29T09:15:44Z', read: false },
  { id: 'n10', title: 'API Rate Limit Breach', message: 'A potential credential stuffing attack was detected and blocked from IP 45.33.32.156. Security team has been notified. Review audit logs for details.', type: 'error', time: '2025-07-29T10:00:01Z', read: false },
]
