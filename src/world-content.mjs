export const papers = [
  {
    title:
      'Playlist Generation from Titles: Transformers vs. Large Language Models',
    venue: 'ACM Transactions on Recommender Systems',
    date: '2026-11-06',
    doi: '10.1145/3859880',
    record: 9010,
  },
  {
    title: 'A Language Model-Based Playlist Generation Recommender System',
    venue: 'ACM RecSys 2025',
    date: '2025-09-07',
    doi: '10.1145/3705328.3748053',
    record: 8304,
    pdf: 'Main_Conference',
  },
  {
    title: 'Interactive Playlist Generation from Titles',
    venue: 'ACM RecSys 2025',
    date: '2025-09-07',
    doi: '10.1145/3705328.3759336',
    record: 8318,
    pdf: 'Demo_Track',
    demo: true,
  },
]
export const authorList = [
  'Enzo Charolois-Pasqua',
  'Eléa Vellard',
  'Youssra Rebboud',
  'Pasquale Lisena',
  'Raphaël Troncy',
]
export const portfolioSource =
  'https://github.com/Nazzar02/enzo-charolois.github.io/blob/8f77747/index.html'
export const copy = {
  en: {
    banking: {
      lead: 'Testing FX options and following discrepancies across financial applications, within a project team in Geneva.',
      section: 'Field notes',
      title: 'Where does the first difference appear?',
      paragraphs: [
        [
          'Fenixys · Union Bancaire Privée',
          'As a Banking Technology Consultant with Fenixys, I work on assignment at UBP in Geneva as a junior Murex consultant. My work spans FX options test cases, booking-model checks, instrument setup and non-regression testing.',
        ],
        [
          'Across applications',
          'A discrepancy in a downstream view can originate earlier in the trade lifecycle. I compare observations in Murex, Kondor+ and other relevant sources, document the first divergence and retest with the project team. That also applies to market data and risk reconciliation.',
        ],
        [
          'smartTrade Technologies',
          'Earlier work at smartTrade included investigating production issues using logs and FIX messages, coordinating client project follow-up and developing internal Python tools.',
        ],
      ],
      label: 'Synthetic case study',
      demo: 'Trace the first mismatch.',
      instruction:
        'Follow ticket FX‑042 through four fictional checkpoints. Compare the recorded expiry with the original instruction.',
      picks: ['Capture', 'Map', 'Value', 'Report'],
      cap: [
        'Source instruction',
        'Field translation',
        'Valuation input',
        'Reporting copy',
      ],
      findings: [
        'The original instruction sets the expiry to 18 June. Use it as the reference for the next checkpoint.',
        'The mapping step copies the expiry correctly. The pair and amount also match the instruction.',
        'First divergence. The valuation input carries 19 June while the instruction and mapping output both carry 18 June.',
        'The reporting copy carries the same later expiry as valuation. The discrepancy is already present upstream.',
      ],
      fields: [
        'Currency pair',
        'Notional',
        'Expected expiry',
        'Recorded expiry',
      ],
      match: 'Aligned',
      mismatch: 'Different expiry',
      date: ['18 Jun 2027', '19 Jun 2027'],
      safe: 'All field values, checkpoints and subsystem names in this exercise are fictional.',
    },
    research: {
      lead: 'Three peer-reviewed papers on a small question with an open-ended answer. Which tracks belong under a title?',
      section: 'Research notes',
      title: 'Start with a few words.',
      paragraphs: [
        [
          'From student project to journal',
          'The work began as a collaborative student project at EURECOM. My involvement continued alongside full-time banking employment. Two RecSys contributions appeared in 2025, followed by a journal article in 2026.',
        ],
        [
          'From titles to tracks',
          'The team grouped playlists in an embedding space, fine-tuned a transformer and used title similarity to retrieve candidate tracks. The journal article explores voting and language-model ranking.',
        ],
      ],
      label: 'Illustrative visualization',
      demo: 'A neighbourhood of titles.',
      instruction:
        'Choose a seed title. Each point has two invented coordinates. The lines connect the seed to its three closest titles by cosine similarity.',
      ranking: 'Nearest titles',
      similarity: 'Cosine similarity',
      pubs: 'Publications',
      published: 'Published',
      record: 'Institutional record',
      pdf: 'Conference PDF',
      demoLink: 'EURECOM playlist prototype',
      note: 'The coordinates are illustrative. The published system uses learned representations and recommends tracks.',
      equal:
        'The two first-listed authors share equal contribution on the conference papers.',
    },
    engineering: {
      lead: 'Tools for inspecting configurations, retrieving technical knowledge and exploring a working recommendation model.',
      label: 'Project anatomy',
      demo: 'Environment similarity dashboard.',
      instruction:
        'Follow the configuration comparison from a practical question to an inspectable result.',
      tabs: ['Problem', 'Approach', 'Architecture', 'Output', 'Evidence'],
      panels: [
        [
          'Before an upgrade',
          'Which existing environments most closely resemble the one about to change? Reading configurations individually made it hard to see relationships across a collection.',
        ],
        [
          'Choose a distance',
          'At smartTrade, I evaluated machine-learning and language-processing approaches, then worked with a custom weighted distance to represent configuration differences.',
        ],
        [
          'From comparison to a map',
          'Weighted comparisons feed a multidimensional scaling (MDS) view. K-means groups offer a second way to inspect relationships in the same collection.',
        ],
        [
          'Make neighbours visible',
          'The dashboard provides an interactive view of related client environments for upgrade preparation. The diagram here shows the processing stages.',
        ],
        [
          'Public project description',
          'The original portfolio describes the comparison method, MDS, clustering and dashboard. Client configurations stay within their original environment.',
        ],
      ],
      stages: [
        'Configurations',
        'Weighted distance',
        'MDS and K-means',
        'Dashboard',
      ],
      source: 'Original project account',
      section: 'Selected work',
      title: 'Two other applied projects.',
      paragraphs: [
        [
          'Internal knowledge assistant · smartTrade',
          'I contributed to an internal retrieval-augmented generation tool for technical knowledge. The project combined embeddings, structured retrieval and Python-oriented workflows.',
        ],
        [
          'Playlist generation prototype · EURECOM',
          'Our collaborative research demo turns a free-form title into a playlist. The demonstration paper and public prototype document the work.',
        ],
      ],
      prototype: 'Open the playlist prototype',
    },
    about: {
      lead: 'I’m Enzo Charolois, a Banking Technology Consultant in Geneva. I like to follow a system far enough to explain why it behaves the way it does.',
      title: 'A path through engineering.',
      label: 'Education & experience',
      paragraphs: [
        [
          '2022–2025 · Mines Saint-Étienne',
          'I studied computer science and engineering, including embedded systems. That breadth still shapes the questions I ask when software meets a real workflow.',
        ],
        [
          '2024 · Siemens Healthineers',
          'At OpenIT Studio, I worked on prototypes, turning user requirements into testable product concepts.',
        ],
        [
          '2024–2025 · EURECOM',
          'A double degree in AI and cybersecurity brought me into collaborative research on playlist recommendation. That work continued beyond graduation.',
        ],
        [
          'smartTrade Technologies',
          'I worked on banking technology delivery, production investigations and internal tools, including a dashboard for comparing client environments.',
        ],
        [
          'Geneva · Fenixys for UBP',
          'Today I work within a project team on a banking technology assignment, bringing functional testing and technical investigation together.',
        ],
      ],
      contact: 'Get in touch.',
      downloads: 'CVs & contact',
      cv: ['AI-focused CV', 'Delivery-focused CV'],
      portrait: 'Portrait of Enzo Charolois',
      bio: 'About Enzo',
    },
  },
  fr: {
    banking: {
      lead: 'Tester les options de change et remonter les écarts entre applications financières, au sein d’une équipe projet à Genève.',
      section: 'Notes de terrain',
      title: 'Où apparaît le premier écart ?',
      paragraphs: [
        [
          'Fenixys · Union Bancaire Privée',
          'Consultant en technologies bancaires chez Fenixys, j’interviens à l’UBP à Genève comme consultant Murex junior. Je conçois et exécute des tests sur les options de change, vérifie les modèles de saisie et le paramétrage des instruments, et mène des tests de non-régression.',
        ],
        [
          'D’une application à l’autre',
          'Un écart visible en aval peut provenir d’une étape antérieure du cycle de vie. Je rapproche les observations dans Murex, Kondor+ et les sources pertinentes, documente la première divergence et reteste avec l’équipe projet. Cette démarche vaut aussi pour les données de marché et les rapprochements de risque.',
        ],
        [
          'smartTrade Technologies',
          'Chez smartTrade, j’ai étudié des incidents de production à partir de journaux et de messages FIX, participé au suivi de projets clients et développé des outils internes en Python.',
        ],
      ],
      label: 'Cas entièrement fictif',
      demo: 'Retrouver le premier écart.',
      instruction:
        'Suivez le ticket FX‑042 à travers quatre étapes fictives. Comparez l’échéance enregistrée à celle de l’instruction initiale.',
      picks: ['Saisie', 'Conversion', 'Valorisation', 'Rapport'],
      cap: [
        'Instruction initiale',
        'Traduction des champs',
        'Données de valorisation',
        'Copie de reporting',
      ],
      findings: [
        'L’instruction initiale fixe l’échéance au 18 juin. Elle sert de référence pour les étapes suivantes.',
        'La conversion conserve l’échéance. La paire de devises et le montant correspondent aussi à l’instruction.',
        'Premier écart. La valorisation utilise le 19 juin, alors que l’instruction et la conversion indiquent le 18 juin.',
        'Le rapport reprend l’échéance de valorisation. L’écart existait donc déjà à l’étape précédente.',
      ],
      fields: [
        'Paire de devises',
        'Montant nominal',
        'Échéance attendue',
        'Échéance enregistrée',
      ],
      match: 'Concordance',
      mismatch: 'Échéance différente',
      date: ['18 juin 2027', '19 juin 2027'],
      safe: 'Les valeurs, les étapes et les noms de sous-systèmes de cet exercice sont fictifs.',
    },
    research: {
      lead: 'Trois publications évaluées par les pairs autour d’une question ouverte. Quels morceaux correspondent au titre d’une playlist ?',
      section: 'Notes de recherche',
      title: 'Partir de quelques mots.',
      paragraphs: [
        [
          'Du projet étudiant à l’article de revue',
          'Notre travail a commencé à EURECOM par un projet étudiant collectif. J’ai poursuivi cette recherche en parallèle d’un emploi à temps plein en technologies bancaires. Deux contributions à RecSys sont parues en 2025, puis un article de revue en 2026.',
        ],
        [
          'Du titre aux morceaux',
          'L’équipe a regroupé des playlists dans un espace vectoriel, affiné un transformeur puis utilisé la similarité des titres pour retrouver des morceaux candidats. L’article de revue étudie le classement par vote et par modèle de langage.',
        ],
      ],
      label: 'Visualisation illustrative',
      demo: 'Des titres dans un même voisinage.',
      instruction:
        'Choisissez un titre de départ. Chaque point possède deux coordonnées fictives. Les lignes le relient aux trois titres les plus proches selon la similarité cosinus.',
      ranking: 'Titres les plus proches',
      similarity: 'Similarité cosinus',
      pubs: 'Publications',
      published: 'Parution',
      record: 'Notice institutionnelle',
      pdf: 'PDF de la conférence',
      demoLink: 'Prototype de playlists EURECOM',
      note: 'Les coordonnées sont illustratives. Le système publié utilise des représentations apprises et recommande des morceaux.',
      equal:
        'Les deux auteurs cités en tête ont contribué à parts égales aux articles de conférence.',
    },
    engineering: {
      lead: 'Des outils pour examiner des configurations, retrouver des connaissances techniques et explorer un modèle de recommandation.',
      label: 'Anatomie d’un projet',
      demo: 'Comparer des environnements.',
      instruction:
        'Suivez la comparaison de configurations, de la question initiale au résultat consultable.',
      tabs: ['Problème', 'Démarche', 'Architecture', 'Résultat', 'Sources'],
      panels: [
        [
          'Avant une mise à niveau',
          'Quels environnements existants ressemblent le plus à celui que l’on va modifier ? Une lecture individuelle des configurations faisait difficilement ressortir les ressemblances.',
        ],
        [
          'Définir une distance',
          'Chez smartTrade, j’ai évalué des approches d’apprentissage automatique et de traitement du langage avant de travailler avec une distance pondérée adaptée aux écarts de configuration.',
        ],
        [
          'De la comparaison à la carte',
          'Les comparaisons pondérées alimentent une projection par positionnement multidimensionnel (MDS). Les groupes issus de K-means offrent une autre lecture des relations dans la collection.',
        ],
        [
          'Rendre les voisins visibles',
          'Le tableau de bord permet d’explorer les environnements clients apparentés pour préparer une mise à niveau. Le schéma présente les étapes du traitement.',
        ],
        [
          'Description publique du projet',
          'Le portfolio d’origine décrit la méthode de comparaison, la projection MDS, le regroupement et le tableau de bord. Les configurations clients restent dans leur environnement d’origine.',
        ],
      ],
      stages: [
        'Configurations',
        'Distance pondérée',
        'MDS et K-means',
        'Tableau de bord',
      ],
      source: 'Présentation initiale du projet',
      section: 'Autres réalisations',
      title: 'Deux autres projets appliqués.',
      paragraphs: [
        [
          'Assistant documentaire interne · smartTrade',
          'J’ai contribué à un outil interne de génération augmentée par la recherche documentaire. Il combinait représentations vectorielles, recherche structurée et traitements en Python.',
        ],
        [
          'Génération de playlists · EURECOM',
          'Notre démonstrateur collectif transforme un titre libre en playlist. L’article de démonstration et le prototype public documentent ce travail.',
        ],
      ],
      prototype: 'Ouvrir le prototype de playlists',
    },
    about: {
      lead: 'Je suis Enzo Charolois, consultant en technologies bancaires à Genève. J’aime suivre le fonctionnement d’un système jusqu’à pouvoir expliquer son comportement.',
      title: 'Un parcours d’ingénieur.',
      label: 'Formation et expérience',
      paragraphs: [
        [
          '2022–2025 · Mines Saint-Étienne',
          'J’ai étudié l’informatique et les sciences de l’ingénieur, notamment les systèmes embarqués. Cette formation nourrit toujours ma façon d’aborder les usages concrets du logiciel.',
        ],
        [
          '2024 · Siemens Healthineers',
          'Au sein d’OpenIT Studio, j’ai réalisé des prototypes en traduisant des besoins utilisateurs en concepts testables.',
        ],
        [
          '2024–2025 · EURECOM',
          'Un double diplôme en IA et cybersécurité m’a conduit à un projet collectif sur la recommandation de playlists. Ce travail s’est poursuivi après le diplôme.',
        ],
        [
          'smartTrade Technologies',
          'J’ai participé à des projets en technologies bancaires, étudié des incidents de production et développé des outils internes, dont un tableau de comparaison d’environnements clients.',
        ],
        [
          'Genève · Fenixys pour l’UBP',
          'Aujourd’hui, au sein d’une équipe projet bancaire, mon travail associe tests fonctionnels et investigation technique.',
        ],
      ],
      contact: 'Échanger.',
      downloads: 'CV et contact',
      cv: ['CV orienté IA', 'CV orienté suivi de projet'],
      portrait: 'Portrait d’Enzo Charolois',
      bio: 'À propos d’Enzo',
    },
  },
}
