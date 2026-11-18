(() => {
  const pageShell = document.querySelector('.page-shell');
  if (!pageShell) {
    return;
  }

  const body = document.body;
  const prefersReducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const interactiveCardSelector = '.case-study, .experience-entry, .education-card, .capability-card, .resource-panel, .contact-panel';
  const primaryKinds = new Set(['featured', 'experience', 'education']);
  const searchThreshold = 0.24;
  const relatedThreshold = 0.32;
  const focusModeDuration = 2800;
  const helperBubbleDelay = 4600;
  const helperBubbleDuration = 2000;
  const stopWords = new Set(['a', 'an', 'and', 'the', 'or', 'to', 'of', 'in', 'on', 'for', 'de', 'la', 'le', 'les', 'et', 'du', 'des', 'where', 'did', 'you', 'your', 'me', 'about', 'show', 'tell', 'what', 'which', 'who', 'is', 'are', 'was', 'were', 'do', 'does', 'be', 'can', 'i', 'my', 'with']);
  const languageIntentTerms = ['french', 'english', 'german', 'spanish', 'bilingual', 'language', 'languages', 'communication', 'communicate', 'fluent', 'native', 'multilingual'];
  const documentIntentTerms = ['cv', 'resume', 'paper', 'papers', 'publication', 'publications', 'certificate', 'certificates', 'credential', 'credentials', 'toeic', 'badge', 'document', 'documents'];
  const contactIntentTerms = ['contact', 'email', 'linkedin', 'reach out', 'get in touch', 'message'];
  const learningIntentTerms = ['where did you learn', 'learn', 'learned', 'learning', 'study', 'studied', 'studying', 'education', 'training', 'trained', 'degree', 'master', 'post master', 'school', 'university', 'formation'];

  const uiCopy = {
    en: {
      button_label: 'Open Skill Finder',
      panel_eyebrow: 'Robot shortcut',
      panel_title: 'Skill Finder',
      panel_body: 'Type a skill or topic and jump to the most relevant part of the current portfolio.',
      input_label: 'Search the portfolio',
      input_placeholder: 'Try AI, LLM, SQL, finance, project management, recommender systems...',
      submit_label: 'Find',
      close_label: 'Close',
      empty_title: 'Ask about a topic',
      empty_body: 'Examples: AI, LLM, SQL, finance, project management, recommender systems, cybersecurity.',
      no_match_title: 'No strong match yet',
      no_match_body: 'Try one of the suggested topics or use a broader keyword.',
      top_match: 'Top match',
      related_matches: 'Also relevant',
      jump_label: 'Jump to match',
      confidence_suffix: 'match',
      kind_featured: 'Featured work',
      kind_experience: 'Experience',
      kind_education: 'Education',
      kind_skills: 'Skills',
      kind_documents: 'Documents',
      kind_contact: 'Contact',
      examples: ['AI', 'LLM', 'SQL', 'finance', 'project management', 'recommender systems', 'cybersecurity']
    },
    fr: {
      button_label: 'Ouvrir le Skill Finder',
      panel_eyebrow: 'Raccourci robot',
      panel_title: 'Skill Finder',
      panel_body: 'Tapez une competence ou un sujet pour aller vers la partie la plus pertinente du portfolio actuel.',
      input_label: 'Chercher dans le portfolio',
      input_placeholder: 'Essayez IA, LLM, SQL, finance, gestion de projet, recommandation...',
      submit_label: 'Chercher',
      close_label: 'Fermer',
      empty_title: 'Posez un sujet',
      empty_body: 'Exemples : IA, LLM, SQL, finance, gestion de projet, recommandation, cybersecurity.',
      no_match_title: 'Pas de match fort pour le moment',
      no_match_body: 'Essayez un sujet suggere ou un mot-cle plus large.',
      top_match: 'Meilleur match',
      related_matches: 'Autres pistes',
      jump_label: 'Aller au match',
      confidence_suffix: 'match',
      kind_featured: 'Selection',
      kind_experience: 'Experience',
      kind_education: 'Formation',
      kind_skills: 'Competences',
      kind_documents: 'Documents',
      kind_contact: 'Contact',
      examples: ['IA', 'LLM', 'SQL', 'finance', 'gestion de projet', 'recommandation', 'cybersecurity']
    }
  };

  const conceptAliases = {
    ai: ['ai', 'ia', 'artificial intelligence', 'intelligence artificielle', 'applied ai', 'generative ai', 'genai'],
    llm: ['llm', 'llms', 'large language model', 'large language models', 'language model', 'language models', 'transformer'],
    nlp: ['nlp', 'natural language processing', 'text processing'],
    rag: ['rag', 'retrieval augmented generation', 'knowledge assistant', 'knowledge retrieval', 'semantic search', 'retrieval'],
    'machine-learning': ['machine learning', 'ml', 'predictive modeling'],
    'deep-learning': ['deep learning', 'dl', 'neural network', 'neural networks', 'transformers'],
    'recommender-systems': ['recommender systems', 'recommendation', 'recommendation systems', 'recsys', 'playlist recommendation', 'ranking'],
    sql: ['sql', 'database', 'databases', 'querying', 'data querying'],
    python: ['python', 'python tooling', 'automation scripts'],
    finance: ['finance', 'financial', 'banking', 'swiss banking', 'fx', 'trading'],
    'project-management': ['project management', 'project manager', 'it project manager', 'delivery management', 'gestion de projet', 'coordination de projet'],
    delivery: ['delivery', 'implementation', 'client delivery', 'execution', 'operations'],
    troubleshooting: ['troubleshooting', 'production support', 'incident analysis', 'debugging', 'logs', 'fix'],
    cybersecurity: ['cybersecurity', 'cyber security', 'security', 'cybersecurite', 'securite', 'infosec', 'cryptography'],
    prototype: ['prototype', 'prototyping', 'prototype development', 'product concept'],
    'design-thinking': ['design thinking', 'product thinking', 'user oriented design'],
    leadership: ['leadership', 'team leadership', 'organizational leadership', 'stakeholder communication', 'strategy'],
    product: ['product', 'product minded', 'requirements'],
    research: ['research', 'publication', 'paper', 'conference', 'demo'],
    'embedded-systems': ['embedded systems', 'systems engineering', 'technical systems'],
    engineering: ['engineering', 'engineer', 'computer science'],
    c: ['c', 'c language'],
    cplusplus: ['c++', 'cpp', 'c plus plus', 'cplusplus'],
    csharp: ['c#', 'c sharp', 'csharp'],
    'r-language': ['r', 'r language', 'rlang'],
    documents: ['documents', 'document', 'cv', 'resume', 'paper', 'certificate', 'credential'],
    contact: ['contact', 'email', 'linkedin', 'reach out'],
    languages: ['languages', 'language', 'communication', 'bilingual', 'english', 'french', 'german', 'spanish']
  };

  const protectedTokens = new Set(['ai', 'ml', 'llm', 'nlp', 'rag', 'sql', 'c', 'r', 'cplusplus', 'csharp', 'python', 'genai']);
  const manualStemMap = {
    management: 'manage',
    manager: 'manage',
    managers: 'manage',
    managing: 'manage',
    recommendation: 'recommend',
    recommendations: 'recommend',
    recommender: 'recommend',
    recommenders: 'recommend',
    learning: 'learn',
    learned: 'learn',
    studies: 'study',
    studied: 'study',
    studying: 'study',
    engineering: 'engineer'
  };
  const technicalConcepts = new Set(['ai', 'llm', 'nlp', 'rag', 'machine-learning', 'deep-learning', 'recommender-systems', 'sql', 'python', 'c', 'cplusplus', 'csharp', 'r-language', 'cybersecurity']);
  const targetDefinitions = [
    {
      id: 'rag-assistant',
      selector: '[data-skill-target="rag-assistant"]',
      sectionId: 'featured',
      kind: 'featured',
      sourceGroup: 'primary',
      concepts: ['ai', 'llm', 'rag', 'python'],
      keywords: ['internal rag knowledge assistant', 'embeddings', 'structured retrieval', 'knowledge base', 'semantic search', 'business facing ai'],
      titleAliases: ['rag assistant', 'knowledge assistant', 'llm assistant'],
      weight: 1.1
    },
    {
      id: 'similarity-dashboard',
      selector: '[data-skill-target="similarity-dashboard"]',
      sectionId: 'featured',
      kind: 'featured',
      sourceGroup: 'primary',
      concepts: ['ai', 'finance', 'delivery', 'nlp'],
      keywords: ['client environment similarity', 'similarity dashboard', 'weighted distance metric', 'k means', 'mds', 'configuration analysis', 'upgrade analysis', 'banking'],
      titleAliases: ['similarity dashboard', 'client similarity dashboard'],
      weight: 1.05
    },
    {
      id: 'playlist-recommendation',
      selector: '[data-skill-target="playlist-recommendation"]',
      sectionId: 'featured',
      kind: 'featured',
      sourceGroup: 'primary',
      concepts: ['ai', 'recommender-systems', 'research', 'deep-learning'],
      keywords: ['transformer based playlist recommendation', 'transformers', 'semantic grouping', 'ranking logic', 'acm recsys', 'publication'],
      titleAliases: ['recommender systems', 'recommendation systems', 'playlist recommendation'],
      weight: 1.08
    },
    {
      id: 'smarttrade-delivery',
      selector: '[data-skill-target="smarttrade-delivery"]',
      sectionId: 'experience',
      kind: 'experience',
      sourceGroup: 'primary',
      concepts: ['finance', 'project-management', 'delivery', 'sql', 'python', 'troubleshooting'],
      keywords: ['smarttrade technologies', 'swiss banking', 'client delivery support', 'project coordination', 'production investigation', 'fix analysis', 'jira', 'confluence', 'implementation', 'integration', 'stakeholders'],
      titleAliases: ['project manager', 'it project manager', 'project management'],
      weight: 1.12
    },
    {
      id: 'siemens-prototyping',
      selector: '[data-skill-target="siemens-prototyping"]',
      sectionId: 'experience',
      kind: 'experience',
      sourceGroup: 'primary',
      concepts: ['prototype', 'design-thinking', 'cybersecurity', 'product'],
      keywords: ['siemens healthineers', 'prototype developer', 'innovation', 'requirements', 'user oriented prototypes', 'healthcare'],
      titleAliases: ['prototype developer'],
      weight: 1.02
    },
    {
      id: 'jmp-leadership',
      selector: '[data-skill-target="jmp-leadership"]',
      sectionId: 'experience',
      kind: 'experience',
      sourceGroup: 'primary',
      concepts: ['leadership', 'project-management', 'delivery'],
      keywords: ['vice president', 'strategy', 'partnerships', 'organizational responsibility', 'team continuity', 'management'],
      titleAliases: ['vice president', 'leadership'],
      weight: 1.01
    },
    {
      id: 'eurecom-ai-cybersecurity',
      selector: '[data-skill-target="eurecom-ai-cybersecurity"]',
      sectionId: 'education',
      kind: 'education',
      sourceGroup: 'primary',
      concepts: ['ai', 'cybersecurity', 'llm', 'machine-learning', 'deep-learning'],
      keywords: ['eurecom', 'post master double degree', 'top 10 percent distinction', 'advanced training', 'international environment', 'security'],
      titleAliases: ['artificial intelligence', 'ai cybersecurity'],
      weight: 1.1
    },
    {
      id: 'mines-engineering',
      selector: '[data-skill-target="mines-engineering"]',
      sectionId: 'education',
      kind: 'education',
      sourceGroup: 'primary',
      concepts: ['engineering', 'embedded-systems', 'leadership'],
      keywords: ['mines saint etienne', 'master of engineering', 'technical problem solving', 'promotion representative'],
      titleAliases: ['computer science', 'engineering'],
      weight: 0.96
    },
    {
      id: 'skills-ai-ml',
      selector: '[data-skill-target="skills-ai-ml"]',
      sectionId: 'skills',
      kind: 'skills',
      sourceGroup: 'skills-summary',
      concepts: ['ai', 'llm', 'rag', 'recommender-systems', 'machine-learning', 'deep-learning'],
      keywords: ['applied ai', 'ai and ml', 'recommender systems', 'clustering'],
      weight: 0.9
    },
    {
      id: 'skills-software-data',
      selector: '[data-skill-target="skills-software-data"]',
      sectionId: 'skills',
      kind: 'skills',
      sourceGroup: 'skills-summary',
      concepts: ['sql', 'python', 'delivery', 'troubleshooting', 'prototype'],
      keywords: ['software and data', 'production support', 'integration', 'prototype development'],
      weight: 0.9
    },
    {
      id: 'skills-delivery-pm',
      selector: '[data-skill-target="skills-delivery-pm"]',
      sectionId: 'skills',
      kind: 'skills',
      sourceGroup: 'skills-summary',
      concepts: ['project-management', 'delivery', 'design-thinking', 'leadership'],
      keywords: ['delivery and pm', 'project coordination', 'stakeholder communication', 'client context', 'execution'],
      weight: 0.9
    },
    {
      id: 'skills-languages',
      selector: '[data-skill-target="skills-languages"]',
      sectionId: 'skills',
      kind: 'skills',
      sourceGroup: 'skills-language',
      concepts: ['languages'],
      keywords: ['french', 'english', 'spanish', 'german', 'bilingual', 'communication'],
      titleAliases: ['languages', 'bilingual'],
      weight: 0.96
    },
    {
      id: 'documents-cvs',
      selector: '[data-skill-target="documents-cvs"]',
      sectionId: 'documents',
      kind: 'documents',
      sourceGroup: 'documents',
      concepts: ['documents'],
      keywords: ['cv', 'resume', 'curriculum vitae', 'ai focused cv', 'project delivery focused cv'],
      weight: 0.92
    },
    {
      id: 'documents-publications',
      selector: '[data-skill-target="documents-publications"]',
      sectionId: 'documents',
      kind: 'documents',
      sourceGroup: 'documents',
      concepts: ['documents', 'research', 'recommender-systems'],
      keywords: ['publications', 'main conference paper', 'demo track paper', 'acm digital library', 'live demo'],
      weight: 0.96
    },
    {
      id: 'documents-credentials',
      selector: '[data-skill-target="documents-credentials"]',
      sectionId: 'documents',
      kind: 'documents',
      sourceGroup: 'documents',
      concepts: ['documents', 'project-management'],
      keywords: ['credentials', 'toeic', 'project management certificate', 'digital business certificate', 'open badge'],
      weight: 0.9
    },
    {
      id: 'documents-links',
      selector: '[data-skill-target="documents-links"]',
      sectionId: 'documents',
      kind: 'documents',
      sourceGroup: 'documents',
      concepts: ['documents', 'contact', 'research'],
      keywords: ['external links', 'linkedin profile', 'acm links', 'demo links'],
      weight: 0.88
    },
    {
      id: 'contact-direct',
      selector: '[data-skill-target="contact-direct"]',
      sectionId: 'contact',
      kind: 'contact',
      sourceGroup: 'contact',
      concepts: ['contact', 'documents'],
      keywords: ['email', 'linkedin', 'open ai cv', 'open pm cv', 'role discussions', 'direct outreach'],
      weight: 0.9
    }
  ];

  const conceptTokenMap = buildConceptTokenMap();

  let items = [];
  let vocabulary = new Set();
  let fab = null;
  let overlay = null;
  let panel = null;
  let quickExamples = null;
  let form = null;
  let input = null;
  let results = null;
  let isOpen = false;
  let lastQuery = '';
  let helperShowTimer = null;
  let helperHideTimer = null;
  let focusClearTimer = null;
  let hasShownHelperHint = false;

  function getLanguage() {
    return document.documentElement.lang === 'fr' ? 'fr' : 'en';
  }

  function copyFor(key) {
    const language = getLanguage();
    return uiCopy[language][key] ?? uiCopy.en[key];
  }

  function canonicalizeTechnicalTerms(value = '') {
    return value
      .replace(/c\+\+/gi, ' cplusplus ')
      .replace(/\bcpp\b/gi, ' cplusplus ')
      .replace(/c#/gi, ' csharp ')
      .replace(/\bc\s+plus\s+plus\b/gi, ' cplusplus ')
      .replace(/\bc\s+sharp\b/gi, ' csharp ')
      .replace(/\br\s+language\b/gi, ' rlanguage ')
      .replace(/\bgen\s*ai\b/gi, ' genai ')
      .replace(/\bcyber\s+security\b/gi, ' cybersecurity ');
  }

  function normalizeText(value = '') {
    return canonicalizeTechnicalTerms(String(value || '')
      .toLowerCase()
      .normalize('NFKD'))
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/&/g, ' and ')
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function normalizeQuery(value = '') {
    return normalizeText(value)
      .replace(/\bllms\b/g, 'llm')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function tokenize(value = '') {
    return normalizeText(value).split(' ').filter(Boolean);
  }

  function stem(token = '') {
    const normalized = normalizeText(token);
    if (!normalized) {
      return '';
    }

    if (manualStemMap[normalized]) {
      return manualStemMap[normalized];
    }

    if (protectedTokens.has(normalized) || normalized.length <= 2) {
      return normalized;
    }

    return normalized.replace(/(ing|ers|er|ed|ions|ion|ies|es|s)$/i, (suffix) => (suffix.toLowerCase() === 'ies' ? 'y' : ''));
  }

  function toStemSet(tokens) {
    const set = new Set();
    tokens.forEach((token) => {
      const normalized = stem(token);
      if (normalized) {
        set.add(normalized);
      }
    });
    return set;
  }

  function uniqueTextValues(values = []) {
    const texts = [];
    const seen = new Set();

    values.forEach((value) => {
      const clean = String(value || '').replace(/\s+/g, ' ').trim();
      const normalized = normalizeText(clean);
      if (!normalized || seen.has(normalized)) {
        return;
      }

      seen.add(normalized);
      texts.push(clean);
    });

    return texts;
  }

  function collectFieldTexts(root, selector) {
    if (!root) {
      return [];
    }

    return uniqueTextValues([...root.querySelectorAll(selector)].map((node) => collectText(node)));
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function editDistance(a, b) {
    const rows = a.length + 1;
    const cols = b.length + 1;
    const matrix = Array.from({ length: rows }, (_, rowIndex) => [rowIndex]);

    for (let columnIndex = 1; columnIndex < cols; columnIndex += 1) {
      matrix[0][columnIndex] = columnIndex;
    }

    for (let rowIndex = 1; rowIndex < rows; rowIndex += 1) {
      for (let columnIndex = 1; columnIndex < cols; columnIndex += 1) {
        if (a[rowIndex - 1] === b[columnIndex - 1]) {
          matrix[rowIndex][columnIndex] = matrix[rowIndex - 1][columnIndex - 1];
        } else {
          matrix[rowIndex][columnIndex] = 1 + Math.min(
            matrix[rowIndex - 1][columnIndex],
            matrix[rowIndex][columnIndex - 1],
            matrix[rowIndex - 1][columnIndex - 1]
          );
        }
      }
    }

    return matrix[a.length][b.length];
  }

  function trigrams(term) {
    const wrapped = `^${term}$`;
    const grams = [];
    for (let index = 0; index < wrapped.length - 2; index += 1) {
      grams.push(wrapped.slice(index, index + 3));
    }
    return grams;
  }

  function vectorize(text) {
    const tokens = tokenize(text).map(stem).filter(Boolean);
    const grams = tokens.flatMap(trigrams);
    const vector = new Map();

    [...tokens, ...grams].forEach((token) => {
      vector.set(token, (vector.get(token) || 0) + 1);
    });

    const length = Math.hypot(...vector.values());
    return { vector, length };
  }

  function cosine(a, b) {
    let dot = 0;
    a.vector.forEach((value, key) => {
      dot += value * (b.vector.get(key) || 0);
    });
    return a.length && b.length ? dot / (a.length * b.length) : 0;
  }

  function countOverlap(left, right) {
    let count = 0;
    left.forEach((token) => {
      if (right.has(token)) {
        count += 1;
      }
    });
    return count;
  }

  function escapeHtml(value = '') {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function collectText(node) {
    return node?.textContent?.replace(/\s+/g, ' ').trim() || '';
  }

  function summarize(text, maxLength = 185) {
    const clean = text.replace(/\s+/g, ' ').trim();
    if (clean.length <= maxLength) {
      return clean;
    }
    return `${clean.slice(0, maxLength - 1).trimEnd()}...`;
  }

  function uniquePhrases(values) {
    const phrases = [];
    const seen = new Set();

    values.forEach((value) => {
      const normalized = normalizeText(value);
      if (!normalized || seen.has(normalized)) {
        return;
      }
      seen.add(normalized);
      phrases.push(normalized);
    });

    return phrases;
  }

  function buildConceptTokenMap() {
    const map = new Map();

    Object.entries(conceptAliases).forEach(([concept, aliases]) => {
      [concept.replace(/-/g, ' '), ...aliases].forEach((alias) => {
        tokenize(alias).forEach((token) => {
          const normalized = stem(token);
          if (!normalized || (normalized.length <= 2 && !protectedTokens.has(normalized))) {
            return;
          }
          if (!map.has(normalized)) {
            map.set(normalized, new Set());
          }
          map.get(normalized).add(concept);
        });
      });
    });

    return map;
  }

  function buildItem(definition) {
    const element = document.querySelector(definition.selector);
    const section = document.getElementById(definition.sectionId);

    if (!element || !section) {
      return null;
    }

    const titleNode = element.querySelector('h3') || section.querySelector('h2');
    const title = collectText(titleNode) || definition.id;
    const sectionTitle = collectText(section.querySelector('h2')) || definition.sectionId;
    const labelSelector = '.case-tag, .case-org, .experience-org, .experience-date, .education-label, .mini-label, .badge-link, .resource-link, .contact-line, dt, strong';
    const labelTexts = collectFieldTexts(element, labelSelector);
    const bodyTexts = uniqueTextValues(
      [...element.querySelectorAll('p, li, dd')]
        .filter((node) => !node.matches(labelSelector))
        .map((node) => collectText(node))
    );
    const bodyCopy = bodyTexts.join(' ');
    const conceptPhrases = (definition.concepts || []).flatMap((concept) => [concept.replace(/-/g, ' '), ...(conceptAliases[concept] || [])]);
    const titlePhrases = uniquePhrases([title, ...(definition.titleAliases || [])]);
    const labelPhrases = uniquePhrases([...labelTexts, sectionTitle]);
    const keywordPhrases = uniquePhrases([...(definition.keywords || []), ...conceptPhrases]);
    const titleTokens = toStemSet(titlePhrases.flatMap((phrase) => tokenize(phrase)));
    const labelTokens = toStemSet(labelPhrases.flatMap((phrase) => tokenize(phrase)));
    const keywordTokens = toStemSet(keywordPhrases.flatMap((phrase) => tokenize(phrase)));
    const bodyTokens = toStemSet(bodyTexts.flatMap((phrase) => tokenize(phrase)));
    const contentTokens = new Set([...titleTokens, ...labelTokens, ...keywordTokens, ...bodyTokens]);
    const vector = vectorize(`${titlePhrases.join(' ')} ${titlePhrases.join(' ')} ${labelPhrases.join(' ')} ${keywordPhrases.join(' ')} ${bodyCopy}`);

    return {
      ...definition,
      element,
      section,
      title,
      sectionTitle,
      body: bodyCopy,
      titlePhrases,
      labelPhrases,
      keywordPhrases,
      conceptSet: new Set(definition.concepts || []),
      titleTokens,
      labelTokens,
      keywordTokens,
      bodyTokens,
      contentTokens,
      exactTitleTokens: new Set(titlePhrases.flatMap((phrase) => tokenize(phrase))),
      exactLabelTokens: new Set(labelPhrases.flatMap((phrase) => tokenize(phrase))),
      exactKeywordTokens: new Set(keywordPhrases.flatMap((phrase) => tokenize(phrase))),
      exactBodyTokens: new Set(bodyTexts.flatMap((phrase) => tokenize(phrase))),
      normalizedTitle: normalizeText(title),
      vector
    };
  }

  function rebuildIndex() {
    items = targetDefinitions.map(buildItem).filter(Boolean);
    vocabulary = new Set();

    items.forEach((item) => {
      [
        item.titleTokens,
        item.labelTokens,
        item.keywordTokens,
        item.bodyTokens,
        item.contentTokens
      ].forEach((tokenSet) => {
        tokenSet.forEach((token) => vocabulary.add(token));
      });

      [
        item.exactTitleTokens,
        item.exactLabelTokens,
        item.exactKeywordTokens,
        item.exactBodyTokens
      ].forEach((tokenSet) => {
        tokenSet.forEach((token) => {
          const normalized = stem(token);
          if (normalized) {
            vocabulary.add(normalized);
          }
        });
      });
    });

    Object.entries(conceptAliases).forEach(([concept, aliases]) => {
      tokenize(concept.replace(/-/g, ' ')).forEach((token) => vocabulary.add(stem(token)));
      aliases.forEach((alias) => {
        tokenize(alias).forEach((token) => vocabulary.add(stem(token)));
      });
    });
  }

  function correctTypos(tokens) {
    return tokens.map((token) => {
      const baseToken = normalizeText(token);
      const normalized = stem(baseToken);
      if (!normalized) {
        return baseToken || token;
      }

      if (protectedTokens.has(baseToken) || baseToken.length <= 2 || vocabulary.has(normalized)) {
        return baseToken || token;
      }

      let bestCandidate = normalized;
      let bestDistance = Infinity;

      vocabulary.forEach((candidate) => {
        if (Math.abs(candidate.length - normalized.length) > 2) {
          return;
        }

        const distance = editDistance(normalized, candidate);
        if (distance < bestDistance) {
          bestDistance = distance;
          bestCandidate = candidate;
        }
      });

      const threshold = normalized.length <= 4 ? 1 : 2;
      return bestDistance <= threshold ? bestCandidate : baseToken;
    });
  }

  function detectConcepts(normalizedQuery, correctedTokens) {
    const concepts = new Set();
    const haystack = ` ${normalizedQuery} `;
    const queryExactTokens = new Set(correctedTokens.map((token) => normalizeText(token)));
    const queryStemTokens = toStemSet(correctedTokens);

    Object.entries(conceptAliases).forEach(([concept, aliases]) => {
      const variants = uniquePhrases([concept.replace(/-/g, ' '), ...aliases]);
      if (!variants.length) {
        return;
      }

      if (variants.some((value) => haystack.includes(` ${value} `))) {
        concepts.add(concept);
        return;
      }

      const multiTokenAliasMatch = variants.some((variant) => {
        const aliasTokens = toStemSet(tokenize(variant));
        if (aliasTokens.size <= 1) {
          return false;
        }

        return (countOverlap(aliasTokens, queryStemTokens) / aliasTokens.size) === 1;
      });

      if (multiTokenAliasMatch) {
        concepts.add(concept);
        return;
      }

      const singleTokenAliasMatch = variants.some((variant) => {
        const aliasTokens = tokenize(variant);
        return aliasTokens.length === 1 && queryExactTokens.has(aliasTokens[0]);
      });

      if (singleTokenAliasMatch) {
        concepts.add(concept);
      }
    });

    return concepts;
  }

  function expandTokens(correctedTokens, concepts) {
    const expanded = new Set(correctedTokens.map(stem).filter(Boolean));

    concepts.forEach((concept) => {
      tokenize(concept.replace(/-/g, ' ')).forEach((token) => expanded.add(stem(token)));
      (conceptAliases[concept] || []).forEach((alias) => {
        tokenize(alias).forEach((token) => expanded.add(stem(token)));
      });
    });

    return expanded;
  }

  function matchesIntentTerms(normalizedQuery, stemmedTokens, terms) {
    const haystack = ` ${normalizedQuery} `;

    return terms.some((term) => {
      const normalizedTerm = normalizeText(term);
      if (!normalizedTerm) {
        return false;
      }

      if (normalizedTerm.includes(' ')) {
        return haystack.includes(` ${normalizedTerm} `);
      }

      return stemmedTokens.has(stem(normalizedTerm));
    });
  }

  function detectIntent(normalizedQuery, correctedTokens) {
    const correctedTokenSet = toStemSet(correctedTokens);
    const language = matchesIntentTerms(normalizedQuery, correctedTokenSet, languageIntentTerms);
    const documents = matchesIntentTerms(normalizedQuery, correctedTokenSet, documentIntentTerms);
    const contact = matchesIntentTerms(normalizedQuery, correctedTokenSet, contactIntentTerms);
    const learning = matchesIntentTerms(normalizedQuery, correctedTokenSet, learningIntentTerms);

    let mode = 'general';
    if (contact) {
      mode = 'contact';
    } else if (documents) {
      mode = 'documents';
    } else if (language) {
      mode = 'language';
    }

    return {
      mode,
      language,
      documents,
      contact,
      learning
    };
  }

  function overlapRatio(queryTokens, fieldTokens) {
    if (!queryTokens.size || !fieldTokens.size) {
      return 0;
    }

    return countOverlap(queryTokens, fieldTokens) / queryTokens.size;
  }

  function phraseRelationshipScore(queryPhrase, itemPhrase) {
    if (!queryPhrase || !itemPhrase) {
      return 0;
    }

    if (queryPhrase === itemPhrase) {
      return 1;
    }

    const queryWords = tokenize(queryPhrase);
    const itemWords = tokenize(itemPhrase);
    const queryTokens = toStemSet(queryWords);
    const itemTokens = toStemSet(itemWords);
    if (!queryTokens.size || !itemTokens.size) {
      return 0;
    }

    const overlap = countOverlap(queryTokens, itemTokens) / queryTokens.size;

    if ((itemPhrase.includes(queryPhrase) || queryPhrase.includes(itemPhrase)) && Math.min(queryWords.length, itemWords.length) >= 2) {
      return overlap === 1 ? 0.92 : 0.82;
    }

    if (overlap === 1) {
      return Math.abs(queryWords.length - itemWords.length) <= 1 ? 0.84 : 0.72;
    }

    if (queryWords.length >= 2 && overlap >= 0.75) {
      return 0.64;
    }

    return 0;
  }

  function phraseMatchScore(queryPhrases, itemPhrases) {
    let best = 0;

    queryPhrases.forEach((queryPhrase) => {
      itemPhrases.forEach((itemPhrase) => {
        best = Math.max(best, phraseRelationshipScore(queryPhrase, itemPhrase));
      });
    });

    return best;
  }

  function fieldTokenScore(query, exactFieldTokens, stemFieldTokens) {
    const exactScore = overlapRatio(query.exactTokenSet, exactFieldTokens);
    const stemScore = overlapRatio(query.correctedTokenSet, stemFieldTokens);
    const shortScore = query.shortExactTokens.size ? overlapRatio(query.shortExactTokens, exactFieldTokens) : 0;

    if (query.shortExactTokens.size) {
      return clamp((shortScore * 0.34) + (exactScore * 0.36) + (stemScore * 0.3), 0, 1);
    }

    return clamp((exactScore * 0.58) + (stemScore * 0.42), 0, 1);
  }

  function shortTokenEvidenceScore(query, item) {
    if (!query.shortExactTokens.size) {
      return 0;
    }

    return Math.max(
      overlapRatio(query.shortExactTokens, item.exactTitleTokens),
      overlapRatio(query.shortExactTokens, item.exactLabelTokens),
      overlapRatio(query.shortExactTokens, item.exactKeywordTokens),
      overlapRatio(query.shortExactTokens, item.exactBodyTokens)
    );
  }

  function prepareQuery(rawQuery) {
    const normalized = normalizeQuery(rawQuery);
    if (!normalized || (normalized.length < 2 && !protectedTokens.has(normalized))) {
      return null;
    }

    const rawTokens = tokenize(normalized);
    const baseTokens = rawTokens.filter((token) => protectedTokens.has(token) || !stopWords.has(token));
    if (!baseTokens.length) {
      return null;
    }

    const correctedTokens = correctTypos(baseTokens);
    const exactTokenSet = new Set(correctedTokens.map((token) => normalizeText(token)));
    const correctedTokenSet = toStemSet(correctedTokens);
    const concepts = detectConcepts(normalized, correctedTokens);
    const expandedTokens = expandTokens(correctedTokens, concepts);
    const intent = detectIntent(normalized, correctedTokens);
    const corePhrase = correctedTokens.join(' ');
    const queryPhrases = uniquePhrases([
      normalized,
      corePhrase,
      ...Array.from(concepts).flatMap((concept) => [concept.replace(/-/g, ' '), ...(conceptAliases[concept] || [])])
    ]);
    const shortExactTokens = new Set([...exactTokenSet].filter((token) => protectedTokens.has(token) || token.length <= 3));
    const technical = Array.from(concepts).some((concept) => technicalConcepts.has(concept))
      || [...exactTokenSet].some((token) => protectedTokens.has(token));
    const roleFocused = concepts.has('project-management')
      || normalized.includes('project manager')
      || normalized.includes('project management')
      || normalized.includes('delivery management');

    return {
      raw: rawQuery,
      normalized,
      correctedTokens,
      exactTokenSet,
      correctedTokenSet,
      concepts,
      expandedTokens,
      queryPhrases,
      shortExactTokens,
      technical,
      roleFocused,
      intent,
      vector: vectorize([normalized, corePhrase, ...queryPhrases, ...expandedTokens].join(' '))
    };
  }

  function isAllowedForIntent(item, intent) {
    if (intent.mode === 'contact') {
      return item.sourceGroup === 'contact';
    }

    if (intent.mode === 'documents') {
      return item.sourceGroup === 'documents';
    }

    if (intent.mode === 'language') {
      return item.sourceGroup === 'skills-language' || item.sourceGroup === 'primary';
    }

    return item.sourceGroup === 'primary';
  }

  function getIntentBoost(item, query, metrics) {
    let boost = 0;

    if (query.intent.learning && item.kind === 'education') {
      boost += 0.12;
    }

    if (query.intent.learning && item.kind === 'featured') {
      boost += 0.04;
    }

    if (query.intent.mode === 'language' && item.sourceGroup === 'skills-language') {
      boost += 0.18;
    }

    if (query.roleFocused && item.kind === 'experience') {
      boost += 0.12;
    }

    if (query.concepts.has('project-management') && item.kind === 'experience' && metrics.titleFieldScore >= 0.45) {
      boost += 0.08;
    }

    if (query.technical && item.kind === 'featured' && (metrics.titleFieldScore >= 0.25 || metrics.keywordFieldScore >= 0.25)) {
      boost += 0.04;
    }

    if (query.shortExactTokens.size && metrics.shortTokenEvidence >= 0.8) {
      boost += 0.05;
    }

    return boost;
  }

  function getSourceWeight(item, query) {
    if (query.intent.mode === 'language') {
      if (item.sourceGroup === 'skills-language') {
        return 1.18;
      }

      if (item.kind === 'education') {
        return 1.06;
      }

      return 1;
    }

    if (query.roleFocused) {
      if (item.kind === 'experience') {
        return 1.22;
      }

      if (item.kind === 'featured') {
        return 1.04;
      }

      if (item.kind === 'education') {
        return 0.96;
      }
    }

    if (query.intent.learning) {
      if (item.kind === 'education') {
        return 1.16;
      }

      if (item.kind === 'featured') {
        return 1.07;
      }

      if (item.kind === 'experience') {
        return 1.05;
      }
    }

    if (query.technical) {
      if (item.kind === 'featured') {
        return 1.12;
      }

      if (item.kind === 'experience') {
        return 1.09;
      }

      if (item.kind === 'education') {
        return 1.05;
      }
    }

    if (query.intent.mode === 'general') {
      if (item.kind === 'experience') {
        return 1.08;
      }

      if (item.kind === 'featured') {
        return 1.06;
      }

      if (item.kind === 'education') {
        return 1.04;
      }
    }

    return 1;
  }

  function searchPortfolio(rawQuery) {
    rebuildIndex();

    const query = prepareQuery(rawQuery);
    if (!query) {
      return { query: null, top: null, related: [] };
    }

    const scored = items
      .filter((item) => isAllowedForIntent(item, query.intent))
      .map((item) => {
        const titlePhrase = phraseMatchScore(query.queryPhrases, item.titlePhrases);
        const labelPhrase = phraseMatchScore(query.queryPhrases, item.labelPhrases);
        const keywordPhrase = phraseMatchScore(query.queryPhrases, item.keywordPhrases);
        const titleFieldScore = fieldTokenScore(query, item.exactTitleTokens, item.titleTokens);
        const labelFieldScore = fieldTokenScore(query, item.exactLabelTokens, item.labelTokens);
        const keywordFieldScore = fieldTokenScore(query, item.exactKeywordTokens, item.keywordTokens);
        const bodyFieldScore = fieldTokenScore(query, item.exactBodyTokens, item.bodyTokens);
        const conceptScore = query.concepts.size ? countOverlap(query.concepts, item.conceptSet) / query.concepts.size : 0;
        const shortTokenEvidence = shortTokenEvidenceScore(query, item);
        const similarity = cosine(query.vector, item.vector);
        const sourceWeight = getSourceWeight(item, query);
        const metrics = {
          titlePhrase,
          labelPhrase,
          keywordPhrase,
          titleFieldScore,
          labelFieldScore,
          keywordFieldScore,
          bodyFieldScore,
          conceptScore,
          shortTokenEvidence,
          similarity
        };
        const intentBoost = getIntentBoost(item, query, metrics);
        const rawScore = (titlePhrase * 0.22)
          + (labelPhrase * 0.1)
          + (keywordPhrase * 0.09)
          + (titleFieldScore * 0.24)
          + (labelFieldScore * 0.12)
          + (keywordFieldScore * 0.12)
          + (bodyFieldScore * 0.05)
          + (conceptScore * 0.09)
          + (shortTokenEvidence * 0.12)
          + (similarity * 0.05)
          + intentBoost;
        let score = clamp(rawScore * (item.weight || 1) * sourceWeight, 0, 1);
        const evidencePeak = Math.max(titlePhrase, titleFieldScore, labelFieldScore, keywordFieldScore, conceptScore, shortTokenEvidence);

        if (evidencePeak < 0.18 && bodyFieldScore < 0.35) {
          score *= 0.58;
        }

        if (query.shortExactTokens.size && shortTokenEvidence < 0.5) {
          score *= 0.45;
        }

        return {
          item,
          score,
          similarity,
          titlePhrase,
          labelPhrase,
          keywordPhrase,
          titleFieldScore,
          labelFieldScore,
          keywordFieldScore,
          bodyFieldScore,
          conceptScore,
          shortTokenEvidence,
          intentBoost,
          sourceWeight
        };
      })
      .sort((left, right) => right.score - left.score
        || right.titleFieldScore - left.titleFieldScore
        || right.keywordFieldScore - left.keywordFieldScore
        || right.titlePhrase - left.titlePhrase);

    if (!scored.length) {
      return { query, top: null, related: [] };
    }

    const [topMatch, runnerUp] = scored;
    if (topMatch.score < searchThreshold) {
      return {
        query,
        top: null,
        related: scored.slice(0, 3).filter((entry) => entry.score >= searchThreshold - 0.04)
      };
    }

    const margin = topMatch.score - (runnerUp?.score || 0);
    const confidence = Math.round(clamp((topMatch.score * 0.78) + (margin * 0.32), 0, 1) * 100);
    const related = scored.slice(1, 4).filter((entry) => entry.score >= Math.max(relatedThreshold, topMatch.score - 0.16));

    return {
      query,
      top: {
        ...topMatch,
        confidence
      },
      related
    };
  }

  function kindLabel(kind) {
    return copyFor(`kind_${kind}`) || kind;
  }

  function resolveJumpTarget(item) {
    if (item.element) {
      return item.element;
    }

    return item.section?.querySelector('.section-heading') || item.section || null;
  }

  function clearHelperHint() {
    window.clearTimeout(helperShowTimer);
    window.clearTimeout(helperHideTimer);
    helperShowTimer = null;
    helperHideTimer = null;
    fab?.classList.remove('is-hint-visible');
  }

  function scheduleHelperHint() {
    if (!fab || hasShownHelperHint) {
      return;
    }

    clearHelperHint();
    helperShowTimer = window.setTimeout(() => {
      helperShowTimer = null;
      if (hasShownHelperHint || isOpen) {
        return;
      }

      hasShownHelperHint = true;
      fab.classList.add('is-hint-visible');
      helperHideTimer = window.setTimeout(() => {
        helperHideTimer = null;
        fab.classList.remove('is-hint-visible');
      }, helperBubbleDuration);
    }, helperBubbleDelay);
  }

  function clearResultFocus() {
    window.clearTimeout(focusClearTimer);
    focusClearTimer = null;
    body.classList.remove('skill-finder-focus-mode');
    overlay?.classList.remove('has-result-focus');
    document.querySelectorAll('.skill-finder-highlight, .skill-finder-section-highlight, .skill-finder-target-active, .skill-finder-target-muted').forEach((node) => {
      node.classList.remove('skill-finder-highlight', 'skill-finder-section-highlight', 'skill-finder-target-active', 'skill-finder-target-muted');
    });
  }

  function applyResultFocus(target) {
    clearResultFocus();

    const isCard = target.matches(interactiveCardSelector);
    if (isCard) {
      body.classList.add('skill-finder-focus-mode');
      document.querySelectorAll(interactiveCardSelector).forEach((card) => {
        card.classList.toggle('skill-finder-target-active', card === target);
        card.classList.toggle('skill-finder-target-muted', card !== target);
      });
    }

    if (overlay?.classList.contains('is-open')) {
      overlay.classList.add('has-result-focus');
    }

    target.classList.add('skill-finder-highlight');
    if (!isCard) {
      target.classList.add('skill-finder-section-highlight');
    }

    focusClearTimer = window.setTimeout(() => {
      clearResultFocus();
    }, focusModeDuration);
  }

  function jumpToItem(itemId) {
    const item = items.find((entry) => entry.id === itemId);
    if (!item) {
      return;
    }

    const target = resolveJumpTarget(item);
    if (!target) {
      return;
    }

    target.scrollIntoView({
      behavior: prefersReducedMotionQuery.matches ? 'auto' : 'smooth',
      block: target.matches(interactiveCardSelector) ? 'center' : 'start',
      inline: 'nearest'
    });

    applyResultFocus(target);
  }

  function renderEmptyState(titleKey = 'empty_title', bodyKey = 'empty_body') {
    results.innerHTML = `
      <div class="skill-finder-empty">
        <h3>${escapeHtml(copyFor(titleKey))}</h3>
        <p>${escapeHtml(copyFor(bodyKey))}</p>
      </div>
    `;
    results.scrollTop = 0;
  }

  function resultCardMarkup(result, { primary = false } = {}) {
    const summary = summarize(result.item.body || result.item.sectionTitle || result.item.title);
    const actionLabel = copyFor('jump_label');
    const actionClass = primary ? 'skill-finder-link' : 'skill-finder-related-button';
    const metaValue = primary ? `${result.confidence}% ${copyFor('confidence_suffix')}` : result.item.sectionTitle;

    return `
      <article class="skill-finder-result${primary ? ' is-primary' : ''}">
        <div class="skill-finder-result-meta">
          <span class="skill-finder-pill">${escapeHtml(kindLabel(result.item.kind))}</span>
          <span class="skill-finder-pill is-soft">${escapeHtml(metaValue)}</span>
        </div>
        <h3>${escapeHtml(result.item.title)}</h3>
        <p class="skill-finder-result-context">${escapeHtml(result.item.sectionTitle)}</p>
        <p class="skill-finder-result-copy">${escapeHtml(summary)}</p>
        <div class="skill-finder-result-actions">
          <button type="button" class="${actionClass}" data-skill-jump="${escapeHtml(result.item.id)}">${escapeHtml(actionLabel)}</button>
        </div>
      </article>
    `;
  }

  function renderResults(searchState) {
    if (!searchState?.top) {
      if (searchState?.related?.length) {
        results.innerHTML = `
          <div class="skill-finder-empty skill-finder-empty-soft">
            <h3>${escapeHtml(copyFor('no_match_title'))}</h3>
            <p>${escapeHtml(copyFor('no_match_body'))}</p>
          </div>
          <div class="skill-finder-related">
            <p class="skill-finder-related-title">${escapeHtml(copyFor('related_matches'))}</p>
            <div class="skill-finder-related-list">
              ${searchState.related.map((result) => resultCardMarkup(result)).join('')}
            </div>
          </div>
        `;
        results.scrollTop = 0;
        return;
      }

      renderEmptyState('no_match_title', 'no_match_body');
      return;
    }

    results.innerHTML = `
      <div class="skill-finder-stack">
        <div class="skill-finder-label-row">
          <span class="skill-finder-section-label">${escapeHtml(copyFor('top_match'))}</span>
        </div>
        ${resultCardMarkup(searchState.top, { primary: true })}
        ${searchState.related.length ? `
          <div class="skill-finder-related">
            <p class="skill-finder-related-title">${escapeHtml(copyFor('related_matches'))}</p>
            <div class="skill-finder-related-list">
              ${searchState.related.map((result) => resultCardMarkup(result)).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `;
    results.scrollTop = 0;
  }

  function runSearch(query, { autoJump = true } = {}) {
    const trimmedQuery = query.trim();
    clearResultFocus();

    if (!trimmedQuery) {
      renderEmptyState();
      return;
    }

    lastQuery = trimmedQuery;
    const searchState = searchPortfolio(trimmedQuery);
    renderResults(searchState);

    if (autoJump && searchState.top) {
      jumpToItem(searchState.top.item.id);
    }
  }

  function syncExamples() {
    const examples = copyFor('examples');
    quickExamples.innerHTML = examples
      .map((example) => `<button type="button" class="skill-finder-chip" data-skill-example="${escapeHtml(example)}">${escapeHtml(example)}</button>`)
      .join('');
  }

  function syncCopy() {
    fab.setAttribute('aria-label', copyFor('button_label'));
    fab.dataset.label = copyFor('button_label');
    fab.setAttribute('title', copyFor('button_label'));
    panel.querySelector('[data-skill-finder-eyebrow]').textContent = copyFor('panel_eyebrow');
    panel.querySelector('[data-skill-finder-title]').textContent = copyFor('panel_title');
    panel.querySelector('[data-skill-finder-body]').textContent = copyFor('panel_body');
    panel.querySelector('[data-skill-finder-label]').textContent = copyFor('input_label');
    panel.querySelector('[data-skill-finder-close]').setAttribute('aria-label', copyFor('close_label'));
    panel.querySelector('[data-skill-finder-submit]').textContent = copyFor('submit_label');
    input.placeholder = copyFor('input_placeholder');
    syncExamples();

    if (lastQuery) {
      runSearch(lastQuery, { autoJump: false });
    } else {
      renderEmptyState();
    }
  }
  function hasScrollableOverflow(node) {
    return node.scrollHeight > node.clientHeight + 2;
  }

  function canConsumeVerticalScroll(node, deltaY) {
    if (!hasScrollableOverflow(node)) {
      return false;
    }

    if (deltaY < 0) {
      return node.scrollTop > 0;
    }

    if (deltaY > 0) {
      return node.scrollTop + node.clientHeight < node.scrollHeight - 1;
    }

    return false;
  }

  function installNestedScrollGuard(node) {
    if (!node) {
      return;
    }

    node.setAttribute('data-lenis-prevent', '');
    node.setAttribute('tabindex', '0');

    node.addEventListener('wheel', (event) => {
      if (canConsumeVerticalScroll(node, event.deltaY)) {
        event.stopPropagation();
      }
    }, { passive: true });

    let lastTouchY = null;

    node.addEventListener('touchstart', (event) => {
      if (event.touches.length === 1) {
        lastTouchY = event.touches[0].clientY;
      }
    }, { passive: true });

    node.addEventListener('touchmove', (event) => {
      if (lastTouchY === null || event.touches.length !== 1) {
        return;
      }

      const currentY = event.touches[0].clientY;
      const deltaY = lastTouchY - currentY;
      if (canConsumeVerticalScroll(node, deltaY)) {
        event.stopPropagation();
      }
      lastTouchY = currentY;
    }, { passive: true });

    node.addEventListener('touchend', () => {
      lastTouchY = null;
    }, { passive: true });

    node.addEventListener('touchcancel', () => {
      lastTouchY = null;
    }, { passive: true });
  }

  function openPanel() {
    if (isOpen) {
      return;
    }

    clearHelperHint();
    hasShownHelperHint = true;
    clearResultFocus();
    rebuildIndex();
    overlay.classList.add('is-open');
    overlay.classList.remove('has-result-focus');
    overlay.setAttribute('aria-hidden', 'false');
    fab.setAttribute('aria-expanded', 'true');
    isOpen = true;

    window.setTimeout(() => {
      input.focus({ preventScroll: true });
      input.select();
    }, 40);
  }

  function closePanel() {
    if (!isOpen) {
      return;
    }

    overlay.classList.remove('is-open', 'has-result-focus');
    overlay.setAttribute('aria-hidden', 'true');
    fab.setAttribute('aria-expanded', 'false');
    isOpen = false;
  }

  function initHelperHint() {
    if (document.readyState === 'complete') {
      scheduleHelperHint();
      return;
    }

    window.addEventListener('load', () => {
      scheduleHelperHint();
    }, { once: true });
  }

  function buildUi() {
    fab = document.createElement('button');
    fab.type = 'button';
    fab.className = 'skill-finder-fab';
    fab.id = 'skillFinderTrigger';
    fab.setAttribute('aria-controls', 'skillFinderOverlay');
    fab.setAttribute('aria-expanded', 'false');
    fab.innerHTML = '<img src="assets/img/robots/robot-Ai-skill.png" alt="" aria-hidden="true">';

    overlay = document.createElement('div');
    overlay.className = 'skill-finder-overlay';
    overlay.id = 'skillFinderOverlay';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.innerHTML = `
      <div class="skill-finder-panel" role="dialog" aria-modal="true" aria-labelledby="skillFinderTitle">
        <div class="skill-finder-panel-head">
          <div>
            <p class="skill-finder-panel-eyebrow" data-skill-finder-eyebrow></p>
            <h2 class="skill-finder-panel-title" id="skillFinderTitle" data-skill-finder-title></h2>
          </div>
          <button type="button" class="skill-finder-close" data-skill-finder-close>
            <span aria-hidden="true">x</span>
          </button>
        </div>
        <p class="skill-finder-panel-copy" data-skill-finder-body></p>
        <div class="skill-finder-quick-list" data-skill-finder-examples></div>
        <form class="skill-finder-form" novalidate>
          <label class="skill-finder-field">
            <span class="skill-finder-field-label" data-skill-finder-label></span>
            <input class="skill-finder-input" type="search" autocomplete="off" spellcheck="false">
          </label>
          <button type="submit" class="skill-finder-submit" data-skill-finder-submit></button>
        </form>
        <div class="skill-finder-results"></div>
      </div>
    `;

    document.body.appendChild(fab);
    document.body.appendChild(overlay);

    panel = overlay.querySelector('.skill-finder-panel');
    quickExamples = overlay.querySelector('[data-skill-finder-examples]');
    form = overlay.querySelector('.skill-finder-form');
    input = overlay.querySelector('.skill-finder-input');
    results = overlay.querySelector('.skill-finder-results');

    installNestedScrollGuard(results);

    fab.addEventListener('click', openPanel);
    overlay.querySelector('[data-skill-finder-close]').addEventListener('click', closePanel);
    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) {
        closePanel();
      }
    });

    quickExamples.addEventListener('click', (event) => {
      const trigger = event.target.closest('[data-skill-example]');
      if (!trigger) {
        return;
      }
      const example = trigger.getAttribute('data-skill-example') || '';
      input.value = example;
      runSearch(example);
    });

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      runSearch(input.value);
    });

    results.addEventListener('click', (event) => {
      const trigger = event.target.closest('[data-skill-jump]');
      if (!trigger) {
        return;
      }
      const itemId = trigger.getAttribute('data-skill-jump');
      if (!itemId) {
        return;
      }
      jumpToItem(itemId);
    });

    window.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && isOpen) {
        closePanel();
      }
    });

    window.addEventListener('portfolio:languagechange', () => {
      syncCopy();
    });

    syncCopy();
    initHelperHint();
  }

  rebuildIndex();
  buildUi();
})();













