export const researchers = [
  { id: 1, name: 'Dr. Sarah Chen', title: 'Associate Professor', department: 'Computer Science', institution: 'MIT', avatar: 'SC', skills: ['Machine Learning', 'NLP', 'Data Mining'], interests: ['AI Ethics', 'Federated Learning'], publications: 42, projects: 3, conferences: 12, collaborators: 18, email: 'schen@mit.edu', phone: '+1 617-253-0001', bio: 'Specializes in large-scale machine learning systems and natural language processing with a focus on fairness and interpretability.', hIndex: 19, citations: 2840 },
  { id: 2, name: 'Prof. James Okafor', title: 'Full Professor', department: 'Biomedical Engineering', institution: 'Stanford University', avatar: 'JO', skills: ['Genomics', 'Bioinformatics', 'CRISPR'], interests: ['Gene Therapy', 'Precision Medicine'], publications: 87, projects: 5, conferences: 22, collaborators: 31, email: 'jokafor@stanford.edu', phone: '+1 650-723-0002', bio: 'Pioneering research in CRISPR-based therapies and computational genomics for rare disease treatment.', hIndex: 34, citations: 8120 },
  { id: 3, name: 'Dr. Elena Vasquez', title: 'Research Scientist', department: 'Physics', institution: 'Caltech', avatar: 'EV', skills: ['Quantum Computing', 'Condensed Matter', 'Spectroscopy'], interests: ['Quantum Error Correction', 'Topological Materials'], publications: 29, projects: 2, conferences: 9, collaborators: 14, email: 'evasquez@caltech.edu', phone: '+1 626-395-0003', bio: 'Working on the intersection of quantum information theory and condensed matter physics.', hIndex: 11, citations: 1150 },
  { id: 4, name: 'Dr. Marcus Webb', title: 'Assistant Professor', department: 'Environmental Science', institution: 'UC Berkeley', avatar: 'MW', skills: ['Climate Modeling', 'Remote Sensing', 'GIS'], interests: ['Carbon Sequestration', 'Ocean Acidification'], publications: 21, projects: 4, conferences: 8, collaborators: 22, email: 'mwebb@berkeley.edu', phone: '+1 510-642-0004', bio: 'Developing high-resolution climate models to predict regional impacts of global warming.', hIndex: 9, citations: 640 },
  { id: 5, name: 'Prof. Aisha Nkosi', title: 'Distinguished Professor', department: 'Sociology', institution: 'University of Chicago', avatar: 'AN', skills: ['Quantitative Research', 'Survey Methods', 'Urban Studies'], interests: ['Inequality', 'Health Disparities'], publications: 63, projects: 6, conferences: 18, collaborators: 27, email: 'ankosi@uchicago.edu', phone: '+1 773-702-0005', bio: 'Interdisciplinary scholar examining structural determinants of urban health and economic mobility.', hIndex: 27, citations: 4200 },
  { id: 6, name: 'Dr. Raj Patel', title: 'Senior Research Fellow', department: 'Materials Science', institution: 'Carnegie Mellon University', avatar: 'RP', skills: ['Nanomaterials', 'Surface Chemistry', 'TEM'], interests: ['Battery Technology', 'Photovoltaics'], publications: 38, projects: 3, conferences: 14, collaborators: 19, email: 'rpatel@cmu.edu', phone: '+1 412-268-0006', bio: 'Engineering next-generation energy storage materials using bottom-up nanofabrication approaches.', hIndex: 15, citations: 1980 },
  { id: 7, name: 'Dr. Hana Müller', title: 'Postdoctoral Researcher', department: 'Cognitive Science', institution: 'Johns Hopkins University', avatar: 'HM', skills: ['fMRI', 'Cognitive Neuroscience', 'Python'], interests: ['Decision Making', 'Memory Consolidation'], publications: 14, projects: 2, conferences: 7, collaborators: 11, email: 'hmuller@jhu.edu', phone: '+1 410-516-0007', bio: 'Investigating the neural substrates of episodic memory using multivariate fMRI analysis.', hIndex: 6, citations: 320 },
  { id: 8, name: 'Prof. Li Wei', title: 'Professor', department: 'Economics', institution: 'Yale University', avatar: 'LW', skills: ['Econometrics', 'Game Theory', 'Policy Analysis'], interests: ['International Trade', 'Labor Markets'], publications: 55, projects: 4, conferences: 20, collaborators: 24, email: 'lwei@yale.edu', phone: '+1 203-432-0008', bio: 'Empirical economist studying the effects of globalization on labor market outcomes in developing economies.', hIndex: 22, citations: 3560 },
];

export const publications = [
  { id: 1, title: 'Federated Learning with Differential Privacy for Biomedical Data Sharing', authors: [1, 2], type: 'Journal', venue: 'Nature Machine Intelligence', year: 2024, status: 'Published', citations: 127, doi: '10.1038/s42256-024-0001', abstract: 'We present a novel framework for privacy-preserving federated learning applied to biomedical datasets across multiple institutions.', keywords: ['federated learning', 'differential privacy', 'biomedical AI'], pages: '1–14' },
  { id: 2, title: 'Quantum Error Correction Using Topological Codes on Near-Term Devices', authors: [3], type: 'Journal', venue: 'Physical Review Letters', year: 2024, status: 'Published', citations: 43, doi: '10.1103/PhysRevLett.132.010501', abstract: 'We demonstrate topological error correction on a 27-qubit superconducting processor with record logical error rates.', keywords: ['quantum computing', 'error correction', 'topological codes'], pages: '010501' },
  { id: 3, title: 'High-Resolution Regional Climate Projections Under SSP5-8.5 Scenario', authors: [4], type: 'Journal', venue: 'Nature Climate Change', year: 2023, status: 'Published', citations: 89, doi: '10.1038/s41558-023-0125', abstract: 'A dynamically downscaled climate model ensemble producing 4 km resolution projections for North America through 2100.', keywords: ['climate modeling', 'downscaling', 'SSP scenarios'], pages: '88–97' },
  { id: 4, title: 'CRISPR-Cas9 Genome Editing Efficiency in Primary Human T Cells', authors: [2], type: 'Journal', venue: 'Cell', year: 2024, status: 'Submitted', citations: 0, doi: '', abstract: 'We characterize factors governing CRISPR editing efficiency in primary T cells and develop optimized delivery protocols.', keywords: ['CRISPR', 'T cells', 'genome editing'], pages: '' },
  { id: 5, title: 'Urban Neighborhood Effects on Cardiovascular Outcomes: A Multi-City Study', authors: [5], type: 'Journal', venue: 'JAMA Internal Medicine', year: 2023, status: 'Published', citations: 201, doi: '10.1001/jamainternmed.2023.0189', abstract: 'Using multi-level modeling, we identify neighborhood-level determinants of cardiovascular disease incidence across 15 U.S. cities.', keywords: ['urban health', 'cardiovascular disease', 'health disparities'], pages: '455–467' },
  { id: 6, title: 'Solid-State Electrolytes for High-Energy-Density Lithium Batteries', authors: [6], type: 'Conference', venue: 'ACS Energy Letters', year: 2024, status: 'Published', citations: 38, doi: '10.1021/acsenergylett.4c00123', abstract: 'We synthesize a new class of halide solid-state electrolytes with ionic conductivity exceeding 10 mS/cm at room temperature.', keywords: ['solid-state battery', 'electrolyte', 'lithium'], pages: '1234–1242' },
  { id: 7, title: 'Neural Correlates of Prospective Memory Encoding During Natural Behavior', authors: [7], type: 'Journal', venue: 'Journal of Neuroscience', year: 2023, status: 'Published', citations: 22, doi: '10.1523/JNEUROSCI.1234-23', abstract: 'Using ecological momentary fMRI, we identify hippocampal-prefrontal circuits critical for real-world prospective memory formation.', keywords: ['fMRI', 'prospective memory', 'hippocampus'], pages: '3344–3356' },
  { id: 8, title: 'Global Value Chains and Labor Market Polarization in Emerging Economies', authors: [8], type: 'Journal', venue: 'American Economic Review', year: 2024, status: 'Draft', citations: 0, doi: '', abstract: 'We provide causal evidence that GVC integration leads to wage polarization by task content in 28 developing countries.', keywords: ['global value chains', 'labor markets', 'trade'], pages: '' },
  { id: 9, title: 'Transformer Architectures for Low-Resource Scientific Text Classification', authors: [1], type: 'Conference', venue: 'ACL 2024', year: 2024, status: 'Published', citations: 56, doi: '10.18653/v1/2024.acl-main.001', abstract: 'We propose domain-adaptive pre-training strategies for biomedical and chemical text classification with limited labeled data.', keywords: ['NLP', 'transformers', 'scientific text'], pages: '1–13' },
  { id: 10, title: 'Photovoltaic Efficiency Enhancement via Plasmonic Nanostructure Integration', authors: [6, 3], type: 'Journal', venue: 'Advanced Energy Materials', year: 2023, status: 'Archived', citations: 74, doi: '10.1002/aenm.202300456', abstract: 'We demonstrate 31.2% conversion efficiency in perovskite solar cells using embedded gold nanorod arrays.', keywords: ['photovoltaics', 'plasmonics', 'perovskite'], pages: '2300456' },
  { id: 11, title: 'Income Inequality and Political Participation in OECD Countries', authors: [5, 8], type: 'Report', venue: 'Brookings Institution', year: 2024, status: 'Submitted', citations: 0, doi: '', abstract: 'Cross-national panel analysis of how Gini coefficient changes predict voter turnout and political engagement over 30 years.', keywords: ['inequality', 'political participation', 'OECD'], pages: '' },
];

export const institutions = [
  { id: 1, name: 'Massachusetts Institute of Technology', type: 'University', country: 'USA', researchers: 312, publications: 1840, status: 'Active', established: 1861 },
  { id: 2, name: 'Stanford University', type: 'University', country: 'USA', researchers: 289, publications: 2120, status: 'Active', established: 1885 },
  { id: 3, name: 'California Institute of Technology', type: 'University', country: 'USA', researchers: 178, publications: 940, status: 'Active', established: 1891 },
  { id: 4, name: 'University of California, Berkeley', type: 'University', country: 'USA', researchers: 423, publications: 2560, status: 'Active', established: 1868 },
  { id: 5, name: 'University of Chicago', type: 'University', country: 'USA', researchers: 201, publications: 1120, status: 'Active', established: 1890 },
  { id: 6, name: 'Carnegie Mellon University', type: 'University', country: 'USA', researchers: 167, publications: 890, status: 'Active', established: 1900 },
  { id: 7, name: 'Johns Hopkins University', type: 'University', country: 'USA', researchers: 234, publications: 1340, status: 'Active', established: 1876 },
  { id: 8, name: 'Max Planck Institute', type: 'Research Institute', country: 'Germany', researchers: 98, publications: 620, status: 'Active', established: 1911 },
  { id: 9, name: 'European Research Council', type: 'Funding Body', country: 'Belgium', researchers: 0, publications: 0, status: 'Active', established: 2007 },
];

export const projects = [
  { id: 1, name: 'FedBio: Privacy-Preserving Biomedical AI', pi: 'Dr. Sarah Chen', institutions: ['MIT', 'Stanford University'], funding: 'NIH R01', status: 'Active', team: 8, start: '2023-01', end: '2026-12', budget: '$2.4M' },
  { id: 2, name: 'QuantumSafe: Topological Quantum Error Correction', pi: 'Dr. Elena Vasquez', institutions: ['Caltech', 'MIT'], funding: 'DARPA', status: 'Active', team: 5, start: '2022-06', end: '2025-05', budget: '$1.8M' },
  { id: 3, name: 'ClimateScope: Sub-Regional Adaptation Planning Tool', pi: 'Dr. Marcus Webb', institutions: ['UC Berkeley', 'University of Chicago'], funding: 'NSF', status: 'Active', team: 11, start: '2023-09', end: '2027-08', budget: '$3.1M' },
  { id: 4, name: 'GenEdit-T: Optimizing CRISPR Delivery in T-Cell Therapies', pi: 'Prof. James Okafor', institutions: ['Stanford University', 'Johns Hopkins University'], funding: 'NIH P01', status: 'Pending', team: 14, start: '2024-07', end: '2029-06', budget: '$5.6M' },
  { id: 5, name: 'SolidState-Li: Scalable Solid Electrolyte Manufacturing', pi: 'Dr. Raj Patel', institutions: ['Carnegie Mellon University', 'Caltech'], funding: 'DOE', status: 'Completed', team: 7, start: '2021-01', end: '2024-12', budget: '$1.2M' },
];

export const conferences = [
  { id: 1, name: 'International Conference on Machine Learning (ICML 2025)', dates: 'Jul 18–24, 2025', location: 'Vienna, Austria', organizer: 'IMLS', field: 'Machine Learning', participants: 8400, status: 'Upcoming', virtual: false, description: 'Premier venue for research on all aspects of machine learning.' },
  { id: 2, name: 'American Physical Society March Meeting 2025', dates: 'Mar 17–21, 2025', location: 'Anaheim, CA', organizer: 'APS', field: 'Physics', participants: 12000, status: 'Upcoming', virtual: false, description: 'The world\'s largest physics meeting covering condensed matter, quantum information, and more.' },
  { id: 3, name: 'Annual Conference on Association for Computational Linguistics (ACL 2024)', dates: 'Aug 11–16, 2024', location: 'Bangkok, Thailand', organizer: 'ACL', field: 'NLP', participants: 4200, status: 'Past', virtual: false, description: 'The flagship conference in natural language processing and computational linguistics.' },
  { id: 4, name: 'American Geophysical Union Fall Meeting 2024', dates: 'Dec 9–13, 2024', location: 'Washington, D.C.', organizer: 'AGU', field: 'Earth Science', participants: 25000, status: 'Past', virtual: false, description: 'Earth and space science gathering drawing researchers from 100+ countries.' },
  { id: 5, name: 'NeurIPS 2024', dates: 'Dec 10–15, 2024', location: 'Virtual', organizer: 'NeurIPS Foundation', field: 'Machine Learning', participants: 16000, status: 'Past', virtual: true, description: 'Neural information processing systems — leading venue for deep learning research.' },
  { id: 6, name: 'Society for Neuroscience Annual Meeting 2025', dates: 'Oct 25–29, 2025', location: 'San Diego, CA', organizer: 'SfN', field: 'Neuroscience', participants: 30000, status: 'Upcoming', virtual: false, description: 'Largest neuroscience conference covering all aspects of brain research.' },
];

export const auditLogs = [
  { id: 1, timestamp: '2024-07-28 09:14:32', user: 'Dr. Sarah Chen', action: 'Publication Created', target: 'Federated Learning with DP...', ip: '18.212.44.91', result: 'Success' },
  { id: 2, timestamp: '2024-07-28 09:02:11', user: 'admin@scna.edu', action: 'User Role Updated', target: 'Dr. Marcus Webb → Institution Admin', ip: '10.0.1.5', result: 'Success' },
  { id: 3, timestamp: '2024-07-27 16:45:00', user: 'Prof. James Okafor', action: 'Report Exported', target: 'Publication Report Q2 2024', ip: '171.66.3.22', result: 'Success' },
  { id: 4, timestamp: '2024-07-27 14:22:55', user: 'unknown@external.com', action: 'Login Attempt', target: 'Auth endpoint', ip: '45.33.32.156', result: 'Failed' },
  { id: 5, timestamp: '2024-07-27 11:08:17', user: 'Dr. Elena Vasquez', action: 'Publication Status Updated', target: 'Quantum Error Correction... → Published', ip: '131.215.55.10', result: 'Success' },
  { id: 6, timestamp: '2024-07-26 17:33:44', user: 'Prof. Aisha Nkosi', action: 'Researcher Profile Updated', target: 'Dr. Hana Müller — Skills', ip: '128.135.11.2', result: 'Success' },
  { id: 7, timestamp: '2024-07-26 15:01:29', user: 'system', action: 'DOI Batch Resolution', target: '14 publications resolved', ip: 'internal', result: 'Success' },
  { id: 8, timestamp: '2024-07-26 09:45:12', user: 'admin@scna.edu', action: 'Institution Added', target: 'Max Planck Institute', ip: '10.0.1.5', result: 'Success' },
  { id: 9, timestamp: '2024-07-25 22:11:08', user: 'bot@scraper.net', action: 'Login Attempt', target: 'Auth endpoint', ip: '198.51.100.22', result: 'Failed' },
  { id: 10, timestamp: '2024-07-25 14:30:00', user: 'Dr. Raj Patel', action: 'Data Export', target: 'Researcher Directory CSV', ip: '128.2.210.42', result: 'Success' },
];

export const pubTrend = [
  { year: '2019', count: 28 },
  { year: '2020', count: 34 },
  { year: '2021', count: 41 },
  { year: '2022', count: 55 },
  { year: '2023', count: 67 },
  { year: '2024', count: 52 },
];

export const deptPubs = [
  { dept: 'Computer Science', pubs: 89 },
  { dept: 'Biomedical Eng.', pubs: 124 },
  { dept: 'Physics', pubs: 62 },
  { dept: 'Environ. Science', pubs: 48 },
  { dept: 'Sociology', pubs: 71 },
  { dept: 'Materials Sci.', pubs: 55 },
  { dept: 'Economics', pubs: 83 },
];

export const collabGrowth = [
  { month: 'Jan', value: 12 },
  { month: 'Feb', value: 15 },
  { month: 'Mar', value: 14 },
  { month: 'Apr', value: 19 },
  { month: 'May', value: 22 },
  { month: 'Jun', value: 25 },
  { month: 'Jul', value: 28 },
];

export const citations = [
  { id: 1, title: 'Privacy-Preserving Machine Learning: A Survey', authors: 'Zhang, Y. et al.', year: 2024, venue: 'IEEE TPAMI', doi: '10.1109/TPAMI.2024.0001' },
  { id: 2, title: 'Advances in Federated Optimization', authors: 'Reddi, S. et al.', year: 2023, venue: 'ICLR 2023', doi: '10.1234/iclr.2023.0045' },
  { id: 3, title: 'Differential Privacy in Deep Learning', authors: 'Abadi, M. et al.', year: 2023, venue: 'NeurIPS 2023', doi: '10.1234/neurips.2023.0087' },
  { id: 4, title: 'Secure Aggregation in Distributed ML', authors: 'Bonawitz, K. et al.', year: 2024, venue: 'CCS 2024', doi: '10.1145/ccs.2024.0019' },
  { id: 5, title: 'Federated Learning in Healthcare: Challenges and Opportunities', authors: 'Rieke, N. et al.', year: 2023, venue: 'npj Digital Medicine', doi: '10.1038/s41746-023-0034' },
  { id: 6, title: 'Communication-Efficient Federated Learning Algorithms', authors: 'McMahan, B. et al.', year: 2024, venue: 'JMLR', doi: '10.1234/jmlr.2024.0011' },
];
