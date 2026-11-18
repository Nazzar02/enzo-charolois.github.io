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
export const authors = [
  'Enzo Charolois-Pasqua',
  'Eléa Vellard',
  'Youssra Rebboud',
  'Pasquale Lisena',
  'Raphaël Troncy',
]
export const exportProject =
  'https://github.com/Nazzar02/swiss-data-insights/tree/06ba474d850ce062358cb1fb54c330118ce47e05/projects/swiss_global_exports_video'
export const playlistPrototype =
  'https://playlist-recommendation.tools.eurecom.fr/'
export const genevaPhotoSource =
  'https://commons.wikimedia.org/wiki/File:Pont_de_la_Machine_Cr%C3%A9puscule_Panorama_Gen%C3%A8ve_BLS.jpg'
export const copy = {
  fr: {
    banking: {
      title: 'Les systèmes du <em>marché des changes.</em>',
      intro:
        'À Genève, je suis en mission pour Fenixys comme consultant Murex junior au sein d’une équipe projet de l’Union Bancaire Privée. J’interviens sur les systèmes de marché, avec un périmètre centré sur le change (FX), y compris les options de change (FXO). Je prépare les tests, documente les écarts et vérifie les corrections avec l’équipe.',
      credit: 'Pont de la Machine, Genève · Benh, CC BY-SA 3.0',
      source: 'Wikimedia Commons',
      alt: 'Le pont de la Machine et les quais de Genève au crépuscule, avec leurs lumières reflétées sur le Rhône.',
      current: 'Mission à Genève',
      role: 'Consultant en technologies bancaires',
      assignment: 'Fenixys · Union Bancaire Privée',
      work: [
        [
          'Tester les opérations de change',
          'Je prépare et exécute des scénarios sur le FX et le FXO. Ils couvrent la saisie, le paramétrage des instruments et le comportement des opérations au fil de leur cycle de vie. Les tests de non-régression permettent à l’équipe de s’assurer que les cas déjà validés fonctionnent toujours après un changement.',
        ],
        [
          'Retrouver l’origine d’un écart',
          'Quand Murex et Kondor+ présentent des valeurs différentes, je compare les observations aux étapes successives. Je documente le premier écart pour que l’équipe puisse reprendre l’enquête au bon endroit, puis je reteste après correction. Ces rapprochements portent aussi sur les données de marché et le risque.',
        ],
      ],
      previous: 'Expérience précédente',
      previousTitle: 'smartTrade Technologies',
      previousText:
        'Chez smartTrade, je m’appuyais sur les journaux applicatifs et les messages FIX pour étudier des incidents de production. Je participais aussi au suivi de projets clients et développais des outils internes en Python.',
    },
    research: {
      title: 'Un projet étudiant. <em>Trois publications.</em>',
      intro:
        'Mon premier projet de recherche a commencé à EURECOM. Avec mes coauteurs, nous avons cherché à recommander des morceaux à partir d’un titre de playlist. Nous avons publié deux articles à RecSys, puis un article de revue. J’ai poursuivi cette collaboration en parallèle de mon emploi à temps plein dans les technologies bancaires.',
      credit: 'Article de recherche, RecSys 2025',
      source: 'Lire le PDF',
      alt: 'Première page de l’article de recherche RecSys, avec le titre et les cinq coauteurs.',
      method: 'Du titre aux morceaux',
      methodText:
        'Nous avons regroupé les playlists selon leur contenu, puis affiné un transformeur sur ces groupes. Pour un nouveau titre, le modèle recherche les titres proches afin de proposer des morceaux. L’article de revue compare ensuite deux façons de les classer, par vote et par modèle de langage.',
      publications: 'Publications',
      equal:
        'Pour les deux articles de conférence, les deux premiers signataires ont contribué à parts égales.',
      record: 'Notice EURECOM',
      pdf: 'Article en PDF',
      prototype: 'Essayer le prototype EURECOM',
    },
    engineering: {
      title: 'Des données aux <em>outils métier.</em>',
      intro:
        'Pour Swiss Data Insights, j’ai mis en images les exportations suisses à partir des tableaux de la douane. Chez smartTrade, j’ai travaillé sur deux autres outils pour comparer des configurations clients et retrouver une réponse dans la documentation.',
      watch: 'Voir le film',
      videoCredit: '35 s · Texte en anglais',
      project: 'Swiss Data Insights',
      feature: 'Les exportations suisses en 35 secondes',
      featureText:
        'J’ai utilisé les tableaux de l’Office fédéral de la douane et de la sécurité des frontières pour relier la Suisse à ses principaux marchés. Le film présente le total de 2025 et les quinze premières destinations de 2024. Les États-Unis arrivent en tête (18,6 % des exportations de marchandises), devant l’Allemagne (14,7 %) et la Slovénie (9,3 %).',
      featureLink: 'Voir le projet et ses sources',
      other: 'Autres projets',
      projects: [
        [
          'smartTrade Technologies',
          'Comparer les environnements clients',
          'Avant une mise à niveau, quels environnements se ressemblent le plus ? J’ai travaillé sur une distance pondérée entre configurations. Le tableau de bord associe une projection multidimensionnelle (MDS) et un regroupement par K-means pour explorer ces ressemblances.',
        ],
        [
          'smartTrade Technologies',
          'Retrouver la documentation technique',
          'J’ai contribué à un assistant documentaire interne en Python. La recherche par représentations vectorielles permettait de retrouver des passages pertinents avant la génération d’une réponse.',
        ],
        [
          'EURECOM',
          'Générer une playlist',
          'Avec mes coauteurs, nous avons réalisé un prototype qui reçoit un titre libre et propose une sélection musicale. Son fonctionnement est décrit dans notre article de démonstration à RecSys.',
        ],
      ],
      researchLink: 'Lire la publication',
    },
    about: {
      title: 'Enzo <em>Charolois.</em>',
      intro:
        'Je suis consultant en technologies bancaires à Genève. J’aime remonter le fil d’une opération, d’une recommandation musicale ou d’une ligne de code jusqu’à pouvoir expliquer ce qui se passe.',
      portrait: 'Enzo Charolois en costume bleu et cravate.',
      titlePath: 'Mon parcours',
      contact: 'Me contacter',
      timeline: [
        [
          'Aujourd’hui',
          'Fenixys · Union Bancaire Privée',
          'Consultant en technologies bancaires',
          'À Genève, au sein d’une équipe projet, je teste les systèmes de change (FX et FXO) et rapproche les données de plusieurs applications.',
        ],
        [
          'Poste précédent',
          'smartTrade Technologies',
          'Technologies bancaires',
          'J’ai étudié des incidents de production, participé au suivi de projets clients et développé des outils internes, dont un tableau de bord de comparaison des configurations.',
        ],
        [
          '2024–2025',
          'EURECOM',
          'Double diplôme en IA et cybersécurité',
          'C’est là que j’ai commencé, avec mes coauteurs, nos recherches sur la recommandation de playlists. Notre collaboration s’est poursuivie après le diplôme.',
        ],
        [
          '2024',
          'Siemens Healthineers',
          'Stage en prototypage',
          'Au sein d’OpenIT Studio, j’ai traduit des besoins utilisateurs en prototypes que l’équipe pouvait tester.',
        ],
        [
          '2022–2025',
          'Mines Saint-Étienne',
          'Formation d’ingénieur en informatique',
          'J’y ai étudié l’informatique et les systèmes embarqués.',
        ],
      ],
    },
  },
  en: {
    banking: {
      title: 'The systems behind <em>foreign exchange.</em>',
      intro:
        'In Geneva, I work for Fenixys as a junior Murex consultant on assignment with a project team at Union Bancaire Privée. My work focuses on foreign exchange systems across FX and FX options (FXO). I prepare tests, document differences between applications and verify fixes with the project team.',
      credit: 'Pont de la Machine, Geneva · Benh, CC BY-SA 3.0',
      source: 'Wikimedia Commons',
      alt: 'Twilight at the Pont de la Machine, with lights from the Geneva waterfront reflected in the Rhône.',
      current: 'Geneva assignment',
      role: 'Banking Technology Consultant',
      assignment: 'Fenixys · Union Bancaire Privée',
      work: [
        [
          'Testing foreign exchange trades',
          'I design and run FX and FXO scenarios covering booking, instrument configuration and trade behaviour throughout the lifecycle. Regression tests help the team check that previously validated cases still work after a change.',
        ],
        [
          'Tracing a discrepancy',
          'When Murex and Kondor+ show different values, I compare observations at successive stages. I document the first divergence so the team can pick up the investigation there, then retest after a fix. This reconciliation work also covers market data and risk.',
        ],
      ],
      previous: 'Previous experience',
      previousTitle: 'smartTrade Technologies',
      previousText:
        'At smartTrade I used application logs and FIX messages to investigate production incidents. I also supported client project follow-up and built internal Python tools.',
    },
    research: {
      title: 'One student project. <em>Three publications.</em>',
      intro:
        'My first research project started at EURECOM. My coauthors and I explored whether we could recommend music from a playlist title alone. We published two RecSys papers and a journal article. I continued the collaboration alongside my full-time work in banking technology.',
      credit: 'Research paper, RecSys 2025',
      source: 'Read the PDF',
      alt: 'Opening page of the RecSys research paper with its title and five coauthors.',
      method: 'From titles to tracks',
      methodText:
        'We grouped playlists by their contents, then fine-tuned a transformer on those groups. Given a new title, the model retrieves similar titles to find candidate tracks. The journal article compares two ways of ranking them, voting and language-model ranking.',
      publications: 'Publications',
      equal:
        'The first two listed authors contributed equally to each of the conference papers.',
      record: 'EURECOM record',
      pdf: 'Paper PDF',
      prototype: 'Try the EURECOM prototype',
    },
    engineering: {
      title: 'Working with <em>data and tools.</em>',
      intro:
        'For Swiss Data Insights, I turned customs tables into a short film about Swiss exports. At smartTrade, I worked on tools for comparing client configurations and finding answers in technical documentation.',
      watch: 'Watch the film',
      videoCredit: '35 sec · Swiss Data Insights',
      project: 'Swiss Data Insights',
      feature: 'Swiss exports in 35 seconds',
      featureText:
        'I used tables from the Federal Office for Customs and Border Security to connect Switzerland with its main export markets. The film shows the 2025 total and the fifteen largest markets in 2024. The United States was the largest market (18.6% of goods exports), followed by Germany (14.7%) and Slovenia (9.3%).',
      featureLink: 'View the project and sources',
      other: 'Other projects',
      projects: [
        [
          'smartTrade Technologies',
          'Comparing client environments',
          'Which existing environments most closely resemble one about to be upgraded? I worked with a weighted distance between configurations. The dashboard combines multidimensional scaling (MDS) and K-means clustering to explore those relationships.',
        ],
        [
          'smartTrade Technologies',
          'Retrieving technical documentation',
          'I contributed to an internal Python knowledge assistant. Vector search retrieved relevant passages from technical documentation before a response was generated.',
        ],
        [
          'EURECOM',
          'Generating a playlist',
          'My coauthors and I built a prototype that accepts a free-form title and recommends music. Our RecSys demonstration paper documents how it works.',
        ],
      ],
      researchLink: 'Read the publication',
    },
    about: {
      title: 'Enzo <em>Charolois.</em>',
      intro:
        'I’m a Banking Technology Consultant in Geneva. I like following a trade, a music recommendation or a line of code far enough to explain what is happening.',
      portrait: 'Enzo Charolois wearing a blue suit and tie.',
      titlePath: 'My background',
      contact: 'Get in touch',
      timeline: [
        [
          'Present',
          'Fenixys · Union Bancaire Privée',
          'Banking Technology Consultant',
          'In a Geneva project team, I test foreign exchange systems (FX and FXO) and reconcile data across financial applications.',
        ],
        [
          'Previous role',
          'smartTrade Technologies',
          'Banking technology',
          'I investigated production incidents, supported client project follow-up and developed internal tools, including a dashboard for comparing configurations.',
        ],
        [
          '2024–2025',
          'EURECOM',
          'Double degree in AI and cybersecurity',
          'My coauthors and I began our playlist recommendation research here. Our collaboration continued after graduation.',
        ],
        [
          '2024',
          'Siemens Healthineers',
          'Prototyping internship',
          'At OpenIT Studio, I turned user requirements into prototypes the team could test.',
        ],
        [
          '2022–2025',
          'Mines Saint-Étienne',
          'Engineering degree in computer science',
          'I studied computer science and embedded systems.',
        ],
      ],
    },
  },
}
