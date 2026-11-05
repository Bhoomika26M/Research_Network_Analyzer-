import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from src.models.user import User
from src.models.publication import Publication
from src.models.project import Project
from src.models.conference import Conference
from src.models.citation import Citation
from src.models.audit import AuditLog
from src.core.security import get_password_hash
from src.core.config import settings

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Seed data — the canonical demo dataset. Row order matters: publication ids,
# researcher ids, project members, conference presentations, and citation
# source/target ids are referenced positionally, so keep the arrays ordered
# (publications 1-15, researchers 1-10) and never reorder existing entries.
# All demo accounts share the password "password123".
# ---------------------------------------------------------------------------

INITIAL_USERS = [
    {
        "name": "Dr. Sarah Chen",
        "initials": "SC",
        "email": "s.chen@mit.edu",
        "hashed_password": None,  # set below
        "institution": "MIT",
        "department": "CSAIL",
        "role": "researcher",
        "bio": "Dr. Chen specializes in graph neural networks, federated learning, and quantum-classical hybrid algorithms. Her work on protein interaction prediction using geometric deep learning has been widely cited across computational biology and AI research communities. She leads the Network Intelligence Lab at MIT CSAIL.",
        "skills": ["Graph Neural Networks", "Federated Learning", "Quantum Computing", "Computer Vision", "Distributed Systems"],
        "interests": ["AI for Drug Discovery", "Privacy-Preserving ML", "Scientific Knowledge Graphs", "Computational Neuroscience"],
        "publications_ids": [1, 2, 3, 4, 5, 6],
        "h_index": 24,
        "citations_total": 3142,
    },
    {
        "name": "Dr. Emma Torres",
        "initials": "ET",
        "email": "e.torres@ox.ac.uk",
        "hashed_password": None,
        "institution": "University of Oxford",
        "department": "Department of Computer Science",
        "role": "researcher",
        "bio": "Dr. Torres focuses on privacy-preserving computation and federated learning. She has pioneered techniques for cross-silo federated learning with strong differential privacy guarantees and is a leading voice in responsible AI research.",
        "skills": ["Differential Privacy", "Federated Learning", "Cryptography", "Machine Learning", "Data Ethics"],
        "interests": ["Responsible AI", "Cross-Institutional Collaboration", "Privacy Law & Technology", "Secure Multi-Party Computation"],
        "publications_ids": [2, 7, 8],
        "h_index": 18,
        "citations_total": 2210,
    },
    {
        "name": "Prof. James Okafor",
        "initials": "JO",
        "email": "j.okafor@cambridge.ac.uk",
        "hashed_password": None,
        "institution": "University of Cambridge",
        "department": "Department of Engineering",
        "role": "reviewer",
        "bio": "Professor Okafor is an expert in high-performance computing and distributed systems. His work on petascale machine learning has enabled new breakthroughs in scientific simulation and data analysis at massive scale.",
        "skills": ["High-Performance Computing", "Distributed Systems", "Parallel Algorithms", "Supercomputing", "Scientific Computing"],
        "interests": ["Exascale Systems", "Climate Modelling", "Large-Scale Graph Analytics", "Green Computing"],
        "publications_ids": [4, 9, 10],
        "h_index": 31,
        "citations_total": 5820,
    },
    {
        "name": "Dr. Yuki Tanaka",
        "initials": "YT",
        "email": "y.tanaka@u-tokyo.ac.jp",
        "hashed_password": None,
        "institution": "University of Tokyo",
        "department": "Graduate School of Informatics",
        "role": "researcher",
        "bio": "Dr. Tanaka works at the intersection of AI and climate science, developing neural network approaches for climate model emulation and extreme weather prediction. She collaborates internationally through the Climate-AI consortium.",
        "skills": ["Climate Modelling", "Neural Networks", "Time Series Analysis", "Scientific ML", "Python"],
        "interests": ["Climate Change Mitigation", "AI for Science", "Ensemble Methods", "Uncertainty Quantification"],
        "publications_ids": [11, 12],
        "h_index": 14,
        "citations_total": 987,
    },
    {
        "name": "Dr. Amir Khan",
        "initials": "AK",
        "email": "a.khan@ethz.ch",
        "hashed_password": None,
        "institution": "ETH Zürich",
        "department": "Department of Computer Science",
        "role": "researcher",
        "bio": "Dr. Khan specialises in secure computation and privacy-preserving machine learning. His patents on privacy-preserving distributed ML form the basis of commercial deployments in healthcare and finance.",
        "skills": ["Secure Computation", "Cryptography", "Machine Learning", "Privacy Engineering", "Rust"],
        "interests": ["Healthcare AI", "Financial Technology", "Zero-Knowledge Proofs", "Hardware Security"],
        "publications_ids": [2, 6, 13],
        "h_index": 16,
        "citations_total": 1540,
    },
    {
        "name": "Dr. Priya Sharma",
        "initials": "PS",
        "email": "p.sharma@iitb.ac.in",
        "hashed_password": None,
        "institution": "IIT Bombay",
        "department": "Department of Computer Science & Engineering",
        "role": "researcher",
        "bio": "Dr. Sharma investigates large language models applied to biochemical property prediction. Her interdisciplinary work bridges NLP and chemistry, with applications in drug discovery and materials science.",
        "skills": ["Large Language Models", "NLP", "Biochemistry", "Drug Discovery", "Deep Learning"],
        "interests": ["AI for Drug Discovery", "Protein Language Models", "Materials Informatics", "Generative AI"],
        "publications_ids": [14, 15],
        "h_index": 9,
        "citations_total": 624,
    },
    {
        "name": "Dr. Marco Novak",
        "initials": "MN",
        "email": "m.novak@epfl.ch",
        "hashed_password": None,
        "institution": "EPFL",
        "department": "School of Computer and Communication Sciences",
        "role": "researcher",
        "bio": "Dr. Novak works on molecular property prediction using deep learning. His thesis at ETH Zürich introduced a new graph-transformer architecture for chemical compound modelling.",
        "skills": ["Graph Transformers", "Molecular Modelling", "Deep Learning", "Cheminformatics", "PyTorch"],
        "interests": ["Green Chemistry", "Automated Drug Design", "Graph Representation Learning"],
        "publications_ids": [6],
        "h_index": 5,
        "citations_total": 180,
    },
    {
        "name": "Dr. Lena Kovacs",
        "initials": "LK",
        "email": "l.kovacs@tum.de",
        "hashed_password": None,
        "institution": "Technical University of Munich",
        "department": "Department of Informatics",
        "role": "researcher",
        "bio": "Dr. Kovacs focuses on quantum computing and its intersection with classical machine learning. She is developing quantum-enhanced optimisation algorithms for combinatorial problems in logistics and biology.",
        "skills": ["Quantum Computing", "Quantum-Classical Hybrid", "Optimisation", "Algorithms", "Qiskit"],
        "interests": ["Quantum Advantage", "Variational Quantum Algorithms", "Combinatorial Optimisation"],
        "publications_ids": [3, 10],
        "h_index": 11,
        "citations_total": 830,
    },
    {
        "name": "Prof. Raj Patel",
        "initials": "RP",
        "email": "r.patel@stanford.edu",
        "hashed_password": None,
        "institution": "Stanford University",
        "department": "Department of Physics",
        "role": "researcher",
        "bio": "Professor Patel is a physicist and computer scientist working on quantum error correction. His research combines theoretical physics with practical ML decoders to enable fault-tolerant quantum computation.",
        "skills": ["Quantum Error Correction", "Physics", "Machine Learning", "Information Theory", "MATLAB"],
        "interests": ["Fault-Tolerant Quantum Computing", "Topological Codes", "Quantum Information Science"],
        "publications_ids": [3],
        "h_index": 27,
        "citations_total": 4310,
    },
    {
        "name": "Dr. Sofia Reyes",
        "initials": "SR",
        "email": "s.reyes@berkeley.edu",
        "hashed_password": None,
        "institution": "UC Berkeley",
        "department": "EECS",
        "role": "researcher",
        "bio": "Dr. Reyes develops algorithms for large-scale graph partitioning and distributed graph computation. Her tools are used in production at several tech companies for social network analysis and scientific simulation.",
        "skills": ["Graph Algorithms", "Distributed Computing", "Systems Programming", "C++", "Parallel Computing"],
        "interests": ["Large-Scale Graph Analytics", "Systems for ML", "Open Source Software"],
        "publications_ids": [4, 9],
        "h_index": 12,
        "citations_total": 1120,
    },
    {
        "name": "MIT Admin",
        "initials": "MA",
        "email": "admin@mit.edu",
        "hashed_password": None,
        "institution": "MIT",
        "department": "Office of Research Administration",
        "role": "institution",
        "bio": "MIT Administration oversees research output, institutional partnerships, and faculty coordination.",
        "skills": ["Administration", "Research Policy"],
        "interests": ["Institutional Collaboration"],
        "publications_ids": [],
        "h_index": 12,
        "citations_total": 540,
    },
    {
        "name": "System Root",
        "initials": "SR",
        "email": "sysadmin@scicollab.io",
        "hashed_password": None,
        "institution": "SciCollab Platform",
        "department": "Platform Engineering",
        "role": "admin",
        "bio": "System administrator responsible for platform health and security audits.",
        "skills": ["Platform Engineering", "Cybersecurity"],
        "interests": ["System Reliability"],
        "publications_ids": [],
        "h_index": 40,
        "citations_total": 9000,
    },
]

INITIAL_PUBLICATIONS = [
    {
        "title": "Graph Neural Networks for Protein Interaction Prediction at Scale",
        "authors": ["Chen, S.", "Torres, E.", "Tanaka, Y."],
        "abstract": "We present a scalable geometric deep learning framework for predicting protein-protein interactions from structural data. Our method achieves state-of-the-art results on five standard benchmarks and scales to proteome-wide prediction with linear time complexity. We introduce a novel attention mechanism that captures long-range residue dependencies.",
        "journal": "Nature Methods",
        "year": 2024,
        "type": "Journal",
        "status": "Published",
        "doi": "10.1038/s41592-024-02234-7",
        "citations": 142,
        "volume": "21",
        "issue": "4",
        "pages": "312–325",
    },
    {
        "title": "Federated Learning with Differential Privacy Guarantees for Sensitive Medical Data",
        "authors": ["Chen, S.", "Khan, A.", "Torres, E."],
        "abstract": "We propose FedDP, a federated learning framework with rigorous differential privacy guarantees tailored for sensitive medical data across hospital networks. Our approach decouples privacy accounting from the optimisation procedure, enabling tighter privacy bounds without sacrificing model accuracy.",
        "journal": "ICML 2024",
        "year": 2024,
        "type": "Conference",
        "status": "Published",
        "doi": "10.5555/3692070.3692219",
        "citations": 38,
        "pages": "4821–4840",
    },
    {
        "title": "Quantum Error Correction via Machine Learning Decoders",
        "authors": ["Chen, S.", "Patel, R.", "Kovacs, L."],
        "abstract": "This paper introduces a neural network-based decoder for the surface code that outperforms minimum-weight perfect matching in the presence of realistic noise models. We demonstrate sub-threshold error rates on a 49-qubit planar code with a recurrent graph neural network decoder trained on synthetic syndrome data.",
        "journal": "Physical Review X",
        "year": 2023,
        "type": "Journal",
        "status": "Published",
        "doi": "10.1103/PhysRevX.13.041041",
        "citations": 21,
        "volume": "13",
        "issue": "4",
        "pages": "041041",
    },
    {
        "title": "Large-Scale Graph Partitioning for Distributed Scientific Computing",
        "authors": ["Chen, S.", "Okafor, J.", "Reyes, S."],
        "abstract": "We present a distributed graph partitioning algorithm that achieves near-optimal edge cuts at the scale of trillion-edge graphs. Our implementation on the Frontier supercomputer demonstrates 87% parallel efficiency at 10,000 nodes and enables new classes of graph-based simulations in computational biology.",
        "journal": "SC24 — Supercomputing 2024",
        "year": 2024,
        "type": "Conference",
        "status": "Under Review",
        "doi": None,
        "citations": 0,
        "pages": "Pending",
    },
    {
        "title": "Privacy-Preserving Graph Analytics: A Comprehensive Survey",
        "authors": ["Chen, S."],
        "abstract": "This survey covers the state of the art in privacy-preserving graph analytics, including local differential privacy, cryptographic approaches, and federated graph learning. We provide a taxonomy of threat models, a comparison of 42 recent methods, and open research challenges.",
        "journal": "ACM Computing Surveys",
        "year": 2023,
        "type": "Journal",
        "status": "Published",
        "doi": "10.1145/3586166",
        "citations": 89,
        "volume": "56",
        "issue": "3",
        "pages": "1–38",
    },
    {
        "title": "Deep Learning for Molecular Property Prediction Using Graph Transformers",
        "authors": ["Chen, S.", "Novak, M.", "Khan, A."],
        "abstract": "We introduce MolGT, a graph transformer architecture for molecular property prediction that integrates 3D geometric features with topological graph structure. MolGT achieves new state-of-the-art results on 12 out of 14 MoleculeNet tasks, with a particularly strong improvement on quantum chemistry benchmarks.",
        "journal": "Journal of Chemical Information and Modeling",
        "year": 2024,
        "type": "Journal",
        "status": "Draft",
        "doi": None,
        "citations": 0,
    },
    {
        "title": "Machine Learning in Network Science: Theory and Applications",
        "authors": ["Chen, S.", "Okafor, J.", "Torres, E."],
        "abstract": "A comprehensive graduate-level textbook covering the mathematical foundations and practical applications of machine learning techniques in network science. Topics include spectral graph theory, graph representation learning, temporal networks, and knowledge graphs.",
        "journal": "Cambridge University Press",
        "year": 2023,
        "type": "Book",
        "status": "Published",
        "doi": "10.1017/9781009284349",
        "citations": 112,
        "pages": "480",
    },
    {
        "title": "Systems and Methods for Privacy-Preserving Distributed Machine Learning",
        "authors": ["Chen, S.", "Khan, A."],
        "abstract": "A patent covering novel cryptographic techniques for privacy-preserving distributed machine learning, including secure aggregation protocols and verifiable computation methods that maintain model utility while providing provable privacy guarantees.",
        "journal": "US Patent Office",
        "year": 2024,
        "type": "Patent",
        "status": "Published",
        "doi": None,
        "citations": 0,
        "pages": "US11,847,422 B2",
    },
    {
        "title": "Federated Graph Neural Networks for Scientific Discovery",
        "authors": ["Okafor, J.", "Reyes, S.", "Chen, S."],
        "abstract": "A technical report detailing the architecture and deployment considerations for federated GNN systems in scientific computing environments. Covers data partitioning strategies, communication compression, and privacy-utility trade-offs in distributed training scenarios.",
        "journal": "MIT Technical Reports",
        "year": 2024,
        "type": "Report",
        "status": "Published",
        "doi": None,
        "citations": 4,
        "pages": "MIT-CSAIL-TR-2024-018",
    },
    {
        "title": "Distributed Machine Learning at Petascale",
        "authors": ["Okafor, J.", "Kovacs, L.", "Reyes, S."],
        "abstract": "We demonstrate end-to-end training of a 100-billion parameter model on 8,192 GPUs across 1,024 nodes, achieving 91% weak scaling efficiency. Our pipeline combines model, data, and tensor parallelism with a novel gradient accumulation schedule that eliminates idle time across heterogeneous network topologies.",
        "journal": "SC23 — Supercomputing 2023",
        "year": 2023,
        "type": "Conference",
        "status": "Published",
        "doi": "10.1145/3581784.3607078",
        "citations": 67,
        "pages": "1–14",
    },
    {
        "title": "Climate Model Calibration Using Ensemble Neural Networks",
        "authors": ["Tanaka, Y.", "Okafor, J."],
        "abstract": "We develop an ensemble of neural networks to calibrate climate model outputs, reducing systematic biases in temperature and precipitation projections. Our approach improves RMSE by 34% over standard post-processing on the CMIP6 ensemble for the 2015–2100 projection period.",
        "journal": "Geophysical Research Letters",
        "year": 2024,
        "type": "Journal",
        "status": "Published",
        "doi": "10.1029/2024GL107823",
        "citations": 23,
        "volume": "51",
        "issue": "8",
        "pages": "e2024GL107823",
    },
    {
        "title": "Extreme Weather Prediction via Hybrid Physics-ML Models",
        "authors": ["Tanaka, Y."],
        "abstract": "This study integrates physical constraints into a machine learning model for predicting extreme weather events 7–14 days ahead. The physics-informed loss function ensures conservation of mass and energy while allowing flexible data-driven pattern recognition for rare events.",
        "journal": "Nature Climate Change",
        "year": 2024,
        "type": "Journal",
        "status": "Under Review",
        "doi": None,
        "citations": 0,
    },
    {
        "title": "Zero-Knowledge Proofs for Verifiable Federated Learning",
        "authors": ["Khan, A.", "Torres, E."],
        "abstract": "We introduce ZK-Fed, a protocol that enables participants in a federated learning round to prove correctness of their gradient updates without revealing private training data. Our construction uses succinct non-interactive arguments of knowledge and adds only 8% computational overhead.",
        "journal": "IEEE Symposium on Security and Privacy",
        "year": 2024,
        "type": "Conference",
        "status": "Published",
        "doi": "10.1109/SP54263.2024.00089",
        "citations": 31,
        "pages": "1200–1217",
    },
    {
        "title": "Large Language Models for Biochemical Property Prediction",
        "authors": ["Sharma, P.", "Torres, E."],
        "abstract": "We fine-tune large language models pre-trained on chemical text to predict ADMET properties of drug-like molecules. Despite having no explicit 3D structural information, our model achieves competitive performance with graph neural networks, suggesting that chemical language encodes implicit structural information.",
        "journal": "Journal of Medicinal Chemistry",
        "year": 2024,
        "type": "Journal",
        "status": "Published",
        "doi": "10.1021/acs.jmedchem.4c00312",
        "citations": 19,
        "volume": "67",
        "issue": "11",
        "pages": "9142–9158",
    },
    {
        "title": "Benchmarking Protein Language Models on Structure Prediction Tasks",
        "authors": ["Sharma, P.", "Kovacs, L."],
        "abstract": "A systematic benchmark comparing eight protein language models on secondary structure prediction, solubility estimation, and thermostability regression. We identify architectural factors that correlate with strong performance and provide recommendations for practitioners choosing protein language models.",
        "journal": "Bioinformatics",
        "year": 2023,
        "type": "Journal",
        "status": "Published",
        "doi": "10.1093/bioinformatics/btad691",
        "citations": 45,
        "volume": "39",
        "issue": "12",
        "pages": "btad691",
    },
]

INITIAL_PROJECTS = [
    {
        "title": "FedGraph: Privacy-Preserving Graph Learning",
        "description": "A cross-institutional research project developing federated learning frameworks for graph-structured scientific data. Partners include MIT, Oxford, and ETH Zürich. The project aims to enable collaborative model training across institutions without sharing raw data.",
        "status": "Active",
        "pi": "Dr. Sarah Chen",
        "members": [1, 2, 5],
        "startDate": "2023-03-01",
        "endDate": "2025-12-31",
        "tags": ["Federated Learning", "Graph Neural Networks", "Privacy"],
    },
    {
        "title": "Quantum Biological Networks",
        "description": "An interdisciplinary project studying quantum effects in biological networks, combining quantum computing simulation with biological network analysis. Explores quantum coherence in photosynthesis and protein folding dynamics.",
        "status": "Active",
        "pi": "Dr. Emma Torres",
        "members": [2, 8, 9],
        "startDate": "2023-07-01",
        "endDate": "2025-06-30",
        "tags": ["Quantum Computing", "Biology", "Network Analysis"],
    },
    {
        "title": "Climate-AI Early Warning Systems",
        "description": "International collaboration building AI-powered early warning systems for climate extremes. Partners span MIT, University of Tokyo, and Cambridge. The system integrates multiple climate models with deep learning to provide 14-day probabilistic forecasts.",
        "status": "Active",
        "pi": "Dr. Yuki Tanaka",
        "members": [4, 3, 10],
        "startDate": "2024-01-15",
        "tags": ["Climate Science", "Deep Learning", "Forecasting", "International"],
    },
    {
        "title": "Petascale Drug Discovery Pipeline",
        "description": "A completed project that built a distributed computing pipeline for virtual screening of billion-compound libraries. The pipeline ran on three supercomputers simultaneously and identified 47 novel drug candidates for antibiotic-resistant bacteria.",
        "status": "Completed",
        "pi": "Prof. James Okafor",
        "members": [3, 6, 7],
        "startDate": "2022-06-01",
        "endDate": "2023-12-31",
        "tags": ["Drug Discovery", "HPC", "Bioinformatics"],
    },
    {
        "title": "Secure Scientific Data Marketplace",
        "description": "A paused initiative to build a privacy-preserving marketplace for scientific datasets, allowing institutions to monetise data assets without exposing sensitive information. Uses secure multi-party computation and zero-knowledge proofs.",
        "status": "Paused",
        "pi": "Dr. Amir Khan",
        "members": [5, 1, 2],
        "startDate": "2023-09-01",
        "tags": ["Data Privacy", "Marketplace", "Cryptography"],
    },
]

INITIAL_CONFERENCES = [
    {
        "name": "Conference on Neural Information Processing Systems",
        "shortName": "NeurIPS 2024",
        "location": "Vancouver, Canada",
        "startDate": "2024-12-10",
        "endDate": "2024-12-15",
        "type": "International",
        "website": "https://neurips.cc/2024",
        "presentations": [1, 5],
    },
    {
        "name": "International Conference on Machine Learning",
        "shortName": "ICML 2024",
        "location": "Vienna, Austria",
        "startDate": "2024-07-21",
        "endDate": "2024-07-27",
        "type": "International",
        "website": "https://icml.cc/2024",
        "presentations": [2, 13],
    },
    {
        "name": "International Conference on Learning Representations",
        "shortName": "ICLR 2025",
        "location": "Singapore",
        "startDate": "2025-04-24",
        "endDate": "2025-04-28",
        "type": "International",
        "website": "https://iclr.cc/2025",
        "presentations": [7],
    },
    {
        "name": "IEEE/CVF Conference on Computer Vision and Pattern Recognition",
        "shortName": "CVPR 2024",
        "location": "Seattle, USA",
        "startDate": "2024-06-17",
        "endDate": "2024-06-21",
        "type": "International",
        "website": "https://cvpr.thecvf.com/2024",
        "presentations": [14],
    },
    {
        "name": "AAAI Conference on Artificial Intelligence",
        "shortName": "AAAI 2025",
        "location": "Philadelphia, USA",
        "startDate": "2025-02-25",
        "endDate": "2025-03-04",
        "type": "International",
        "website": "https://aaai.org/aaai25",
        "presentations": [9, 15],
    },
]

INITIAL_CITATIONS = [
    {
        "sourcePubId": 2,
        "targetPubId": 1,
        "year": 2024,
        "context": "Building on the GNN framework introduced by Chen et al. for protein interaction, we adapt the architecture to federated settings.",
    },
    {
        "sourcePubId": 3,
        "targetPubId": 1,
        "year": 2023,
        "context": "The geometric deep learning approach by Chen et al. inspired our representation of quantum state graphs.",
    },
    {
        "sourcePubId": 5,
        "targetPubId": 1,
        "year": 2023,
        "context": "Chen et al.'s work on protein interaction prediction exemplifies privacy challenges in graph analytics.",
    },
    {
        "sourcePubId": 9,
        "targetPubId": 2,
        "year": 2024,
        "context": "The FedDP framework by Chen et al. is integrated into our federated GNN system as the privacy module.",
    },
    {
        "sourcePubId": 10,
        "targetPubId": 4,
        "year": 2023,
        "context": "Our distributed ML system leverages the graph partitioning algorithm presented in the companion paper.",
    },
    {
        "sourcePubId": 13,
        "targetPubId": 2,
        "year": 2024,
        "context": "We extend the privacy model of FedDP with verifiable computation via ZK proofs.",
    },
    {
        "sourcePubId": 14,
        "targetPubId": 7,
        "year": 2024,
        "context": "The textbook by Chen et al. provides the theoretical background for our network science methodology.",
    },
    {
        "sourcePubId": 11,
        "targetPubId": 10,
        "year": 2024,
        "context": "Climate data is partitioned using techniques adapted from Okafor et al.'s petascale distributed ML work.",
    },
    {
        "sourcePubId": 15,
        "targetPubId": 14,
        "year": 2023,
        "context": "Our benchmark methodology follows the approach established by Sharma & Torres for property prediction.",
    },
    {
        "sourcePubId": 6,
        "targetPubId": 5,
        "year": 2024,
        "context": "MolGT addresses privacy challenges identified in Chen's privacy-preserving graph analytics survey.",
    },
]

INITIAL_AUDIT_LOGS = [
    {
        "actor": "Dr. Sarah Chen",
        "action": "Uploaded publication \"Large-Scale Graph Partitioning for Distributed Scientific Computing\"",
        "target": "Publication #4",
        "timestamp": "2026-08-03 14:32:11",
        "ip": "18.101.24.82",
        "category": "Data",
    },
    {
        "actor": "MIT Admin",
        "action": "Onboarded 8 new researchers to CS Department",
        "target": "User Group: CS Department",
        "timestamp": "2026-08-03 14:01:44",
        "ip": "18.104.12.3",
        "category": "Admin",
    },
    {
        "actor": "Security System",
        "action": "BLOCKED: 3 failed login attempts from external IP",
        "target": "Account: j.okafor@cam.ac.uk",
        "timestamp": "2026-08-03 13:47:22",
        "ip": "192.168.1.254",
        "category": "Auth",
    },
    {
        "actor": "Dr. Yuki Tanaka",
        "action": "Updated institutional affiliation to University of Tokyo",
        "target": "Researcher Profile #4",
        "timestamp": "2026-08-03 12:55:09",
        "ip": "133.11.45.7",
        "category": "Data",
    },
    {
        "actor": "System",
        "action": "Automated backup job completed — 847 records archived",
        "target": "Database Snapshot v2026-08-03",
        "timestamp": "2026-08-03 11:30:00",
        "ip": "10.0.0.1",
        "category": "Admin",
    },
    {
        "actor": "Dr. Amir Khan",
        "action": "Changed publication status: Draft → Under Review",
        "target": "Publication #6",
        "timestamp": "2026-08-03 10:14:57",
        "ip": "82.14.99.201",
        "category": "Data",
    },
    {
        "actor": "Stanford Admin",
        "action": "Exported Q3 collaboration report (PDF, 2.4MB)",
        "target": "Report: Q3 Collaboration 2025",
        "timestamp": "2026-08-03 09:42:31",
        "ip": "171.64.77.11",
        "category": "Export",
    },
    {
        "actor": "Security System",
        "action": "WARNING: Unusual API access pattern detected",
        "target": "Account: j.okafor@cam.ac.uk",
        "timestamp": "2026-08-03 09:15:18",
        "ip": "203.45.99.12",
        "category": "Auth",
    },
    {
        "actor": "Dr. Emma Torres",
        "action": "Created cross-institution project \"Quantum Biological Networks\" with 4 collaborators",
        "target": "Project #2",
        "timestamp": "2026-08-02 18:33:42",
        "ip": "163.1.103.22",
        "category": "Data",
    },
    {
        "actor": "System",
        "action": "Scheduled maintenance window completed successfully",
        "target": "Platform Services",
        "timestamp": "2026-08-02 23:00:01",
        "ip": "10.0.0.1",
        "category": "Admin",
    },
    {
        "actor": "Security System",
        "action": "Token rotation completed for 3,847 active sessions",
        "target": "All Active Sessions",
        "timestamp": "2026-08-02 17:20:15",
        "ip": "10.0.0.2",
        "category": "Auth",
    },
    {
        "actor": "Dr. Priya Sharma",
        "action": "Deleted draft publication \"Untitled Draft 3\"",
        "target": "Publication Draft (deleted)",
        "timestamp": "2026-08-02 16:05:08",
        "ip": "14.139.34.11",
        "category": "Data",
    },
    {
        "actor": "Prof. James Okafor",
        "action": "Exported publication list as Excel spreadsheet",
        "target": "Publications Report 2026",
        "timestamp": "2026-08-02 14:20:45",
        "ip": "131.111.80.3",
        "category": "Export",
    },
    {
        "actor": "MIT Admin",
        "action": "Added Dr. Marco Novak to FedGraph project team",
        "target": "Project #1",
        "timestamp": "2026-08-02 11:38:20",
        "ip": "18.104.12.3",
        "category": "Admin",
    },
    {
        "actor": "Dr. Sarah Chen",
        "action": "Submitted grant proposal for NSF AI Institute",
        "target": "Grant Application: NSF-AI-2026",
        "timestamp": "2026-08-01 16:45:00",
        "ip": "18.101.24.82",
        "category": "Data",
    },
    {
        "actor": "Dr. Lena Kovacs",
        "action": "Updated h-index and citation count from Google Scholar sync",
        "target": "Researcher Profile #8",
        "timestamp": "2026-08-01 10:15:33",
        "ip": "84.178.120.55",
        "category": "Data",
    },
    {
        "actor": "System",
        "action": "DOI verification batch completed — 13 DOIs validated",
        "target": "Publication DOI Registry",
        "timestamp": "2026-08-01 03:00:00",
        "ip": "10.0.0.1",
        "category": "Admin",
    },
    {
        "actor": "Dr. Amir Khan",
        "action": "User login from new device (verified via 2FA)",
        "target": "Account: a.khan@ethz.ch",
        "timestamp": "2026-07-31 08:22:17",
        "ip": "82.14.99.201",
        "category": "Auth",
    },
    {
        "actor": "Reviewer: Prof. Raj Patel",
        "action": "Submitted review decision: Accept with Minor Revisions",
        "target": "Publication #12",
        "timestamp": "2026-07-31 17:05:44",
        "ip": "171.64.12.89",
        "category": "Data",
    },
    {
        "actor": "System",
        "action": "Nightly citation count sync from CrossRef API — 47 publications updated",
        "target": "Citation Registry",
        "timestamp": "2026-07-31 01:00:00",
        "ip": "10.0.0.1",
        "category": "Admin",
    },
]


async def init_db(db: AsyncSession) -> None:
    # Seed Users
    res = await db.execute(select(User))
    if not res.scalars().first():
        logger.info("Seeding Users...")
        password_hash = get_password_hash(settings.SEED_USER_PASSWORD)
        for u_data in INITIAL_USERS:
            data = dict(u_data)
            data["hashed_password"] = password_hash
            db.add(User(**data))
        await db.flush()

    # Seed Publications
    res = await db.execute(select(Publication))
    if not res.scalars().first():
        logger.info("Seeding Publications...")
        for p in INITIAL_PUBLICATIONS:
            db.add(Publication(**p))
        await db.flush()

    # Seed Projects
    res = await db.execute(select(Project))
    if not res.scalars().first():
        logger.info("Seeding Projects...")
        for prj in INITIAL_PROJECTS:
            db.add(Project(**prj))
        await db.flush()

    # Seed Conferences
    res = await db.execute(select(Conference))
    if not res.scalars().first():
        logger.info("Seeding Conferences...")
        for c in INITIAL_CONFERENCES:
            db.add(Conference(**c))
        await db.flush()

    # Seed Citations
    res = await db.execute(select(Citation))
    if not res.scalars().first():
        logger.info("Seeding Citations...")
        for cit in INITIAL_CITATIONS:
            db.add(Citation(**cit))
        await db.flush()

    # Seed Audit Logs
    res = await db.execute(select(AuditLog))
    if not res.scalars().first():
        logger.info("Seeding Audit Logs...")
        for al in INITIAL_AUDIT_LOGS:
            db.add(AuditLog(**al))

    await db.commit()
    logger.info("Database seeding complete.")
