// I build role-specific CV variants (PDF, DOCX, HTML) by reordering sections from the master cv.html so recruiters see the most relevant experience first.
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const puppeteer = require('puppeteer');
const HTMLtoDOCX = require('html-to-docx');
const {
  Document, Packer, Paragraph, TextRun, AlignmentType, ExternalHyperlink,
  convertInchesToTwip, convertMillimetersToTwip, UnderlineType, BorderStyle,
  TabStopType, TabStopPosition,
} = require('docx');

const mainCVPath = path.join(process.cwd(), 'public', 'resume', 'cv.html');
const mainCV = fs.readFileSync(mainCVPath, 'utf8');

const cvYmlPath = path.join(process.cwd(), 'data', 'cv.yml');
const cvData = yaml.load(fs.readFileSync(cvYmlPath, 'utf8'));

// Role configurations with content priorities
const roles = {
  software: {
    title: 'Software Engineering',
    profile: 'Software Engineering student at Aston University (Predicted First Class) and Top 40 Finalist in the Black Heritage Undergraduate of the Year Award 2026 (TargetJobs & Sky). Builds production-grade full-stack web applications with React, Next.js, TypeScript and cloud infrastructure. Seeking software engineering internships and industrial placements.',
    skillPriority: ['Languages', 'Web', 'Cloud', 'AI/ML', 'Embedded', 'Professional'],
    projectPriority: ['AstonCV', 'PHAEMOS', 'git-unlocked', 'LED Cube', 'Audio Amplifier', 'CNC'],
    experiencePriority: ['Student Representative', 'pal-leader', 'British Airways', 'Yunex Traffic', 'Ghana High Commission', 'HVAC']
  },
  embedded: {
    title: 'Embedded Systems',
    profile: 'Electronic Engineering and Computer Science student at Aston University (Predicted First Class) and Top 40 Finalist in the Black Heritage Undergraduate of the Year Award 2026. Builds across the hardware-software stack from PCB-level design and embedded firmware to IoT platforms. Seeking embedded systems and hardware-software integration internships.',
    skillPriority: ['Embedded', 'Languages', 'Hardware', 'Web', 'Cloud', 'Professional'],
    projectPriority: ['PHAEMOS', 'LED Cube', 'CNC', 'Audio Amplifier', 'AstonCV', 'git-unlocked'],
    experiencePriority: ['pal-leader', 'HVAC', 'British Airways', 'Student Representative', 'Yunex Traffic', 'Ghana High Commission']
  },
  data: {
    title: 'Data & AI Engineering',
    profile: 'Electronic Engineering and Computer Science student at Aston University (Predicted First Class) specialising in AI/ML and data engineering. Builds intelligent systems with Python, TensorFlow and data pipelines. Seeking data engineering and AI/ML internships.',
    skillPriority: ['AI/ML', 'Languages', 'Cloud', 'Web', 'Embedded', 'Professional'],
    projectPriority: ['PHAEMOS', 'AstonCV', 'LED Cube', 'git-unlocked', 'Audio Amplifier', 'CNC'],
    experiencePriority: ['British Airways', 'pal-leader', 'Yunex Traffic', 'Student Representative', 'Ghana High Commission', 'HVAC']
  },
  devops: {
    title: 'DevOps & Cloud',
    profile: 'Electronic Engineering and Computer Science student at Aston University (Predicted First Class) and Top 40 Finalist. Builds cloud-native infrastructure with AWS, Docker, Kubernetes and CI/CD pipelines. Seeking DevOps and cloud engineering internships.',
    skillPriority: ['Cloud', 'Languages', 'Web', 'AI/ML', 'Embedded', 'Professional'],
    projectPriority: ['PHAEMOS', 'AstonCV', 'git-unlocked', 'LED Cube', 'Audio Amplifier', 'CNC'],
    experiencePriority: ['British Airways', 'pal-leader', 'Yunex Traffic', 'Student Representative', 'Ghana High Commission', 'HVAC']
  },
  quant: {
    title: 'Quantitative Developer',
    profile: 'Electronic Engineering and Computer Science student at Aston University (Predicted First Class). Builds high-performance systems with C++ and Python. Strong mathematical foundation and algorithm design skills. Seeking quantitative developer internships.',
    skillPriority: ['Languages', 'AI/ML', 'Embedded', 'Cloud', 'Web', 'Professional'],
    projectPriority: ['PHAEMOS', 'LED Cube', 'AstonCV', 'git-unlocked', 'Audio Amplifier', 'CNC'],
    experiencePriority: ['British Airways', 'pal-leader', 'Yunex Traffic', 'Student Representative', 'Ghana High Commission', 'HVAC']
  },
  security: {
    title: 'Cybersecurity',
    profile: 'Electronic Engineering and Computer Science student at Aston University (Predicted First Class) with strong security mindset. Implements secure authentication, audit logging and RBAC. Seeking cybersecurity internships.',
    skillPriority: ['Cloud', 'Languages', 'Web', 'Embedded', 'AI/ML', 'Professional'],
    projectPriority: ['AstonCV', 'PHAEMOS', 'git-unlocked', 'LED Cube', 'Audio Amplifier', 'CNC'],
    experiencePriority: ['British Airways', 'Student Representative', 'pal-leader', 'Yunex Traffic', 'Ghana High Commission', 'HVAC']
  }
};

// I define which roles should use sans-serif fonts instead of the default serif
// body font. Tech-focused roles benefit from a modern, clean sans-serif stack.
const SANS_SERIF_ROLES = new Set(['software', 'embedded', 'devops', 'quant']);

// I inject this style block before </head> in tech role CVs to override the
// main CV's Cambria/Georgia font without touching public/resume/cv.html.
const FONT_OVERRIDE_CSS = `<style>
  /* Role CV font override - modern sans-serif for tech roles */
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  body, * {
    font-family: 'Inter', system-ui, Arial, sans-serif !important;
  }
</style>`;

// I map each skillPriority key to the start of its <strong> label in cv.html
const SKILL_KEY_PREFIXES = {
  Languages:    'Languages',
  Embedded:     'Embedded',
  Web:          'Web',
  'AI/ML':      'AI/ML',
  Cloud:        'Cloud',
  Professional: 'Professional',
};

function getSkillKey(paragraph) {
  const match = paragraph.match(/<strong>([^<]+)/);
  if (!match) return null;
  const label = match[1].trim();
  for (const [key, prefix] of Object.entries(SKILL_KEY_PREFIXES)) {
    if (label.startsWith(prefix)) return key;
  }
  return null;
}

function reorderSkillsBlock(skillsHtml, priority) {
  // I extract every <p>...</p> inside the skills-block and sort by priority
  const paragraphs = [...skillsHtml.matchAll(/<p[\s\S]*?<\/p>/gi)].map(m => m[0]);
  if (!paragraphs.length) return skillsHtml;

  const sorted = [...paragraphs].sort((a, b) => {
    const idxA = priority.indexOf(getSkillKey(a) ?? '');
    const idxB = priority.indexOf(getSkillKey(b) ?? '');
    return (idxA === -1 ? priority.length : idxA)
         - (idxB === -1 ? priority.length : idxB);
  });

  return skillsHtml.replace(
    /(<div class="skills-block">)([\s\S]*?)(<\/div>)/,
    (_, open, _inner, close) =>
      open + '\n\n' + sorted.join('\n\n') + '\n\n' + close
  );
}

function getEntryKey(entryHtml, priorityKeys) {
  // I test each priority key as a substring of the raw entry HTML so the
  // match works against both title and company text without parsing the DOM.
  for (const key of priorityKeys) {
    if (entryHtml.includes(key)) return key;
  }
  return null;
}

function reorderEntryBlock(sectionHtml, entryClass, priority) {
  const marker = `<div class="${entryClass}">`;
  // Strip HTML comments before splitting so commented-out entries (e.g. the PAL Leader
  // placeholder) are not treated as real entries during reordering.
  const stripped = sectionHtml.replace(/<!--[\s\S]*?-->/g, '');
  const parts = stripped.split(marker);
  if (parts.length < 2) return sectionHtml;
  const preamble = parts[0];
  const entries = parts.slice(1).map(p => marker + p);
  const sorted = [...entries].sort((a, b) => {
    const idxA = priority.indexOf(getEntryKey(a, priority) ?? '');
    const idxB = priority.indexOf(getEntryKey(b, priority) ?? '');
    return (idxA === -1 ? priority.length : idxA)
         - (idxB === -1 ? priority.length : idxB);
  });
  return preamble + sorted.join('');
}

function reorderExperienceBlock(experienceHtml, priority) {
  // I delegate to the shared helper using the exp-entry class name.
  return reorderEntryBlock(experienceHtml, 'exp-entry', priority);
}

function filterVirtualRoles(experienceHtml) {
  // I remove British Airways and Yunex Traffic from all role CVs since they are
  // virtual internships that dilute the signal for specialist role applications.
  const VIRTUAL_MARKERS = ['British Airways', 'Yunex Traffic'];
  const marker = '<div class="exp-entry">';
  const parts = experienceHtml.split(marker);
  const filtered = parts.filter((part, idx) => {
    if (idx === 0) return true;
    return !VIRTUAL_MARKERS.some(vm => part.includes(vm));
  });
  return filtered.join(marker);
}

function applyRoleBullets(experienceHtml, roleId, roleExperience) {
  // I swap in role-specific bullet text from cv.yml for entries that have overrides.
  if (!roleExperience || !roleExperience.length) return experienceHtml;
  let result = experienceHtml;
  for (const entry of roleExperience) {
    const override = entry.roles && entry.roles[roleId];
    if (!override || !override.bullets || !override.bullets.length) continue;
    const marker = '<div class="exp-entry">';
    const parts = result.split(marker);
    const updated = parts.map((part, idx) => {
      if (idx === 0) return part;
      if (!part.includes(entry.match)) return part;
      const bulletItems = override.bullets
        .map(b => `<li>${b}</li>`)
        .join('\n          ');
      return part.replace(
        /<ul class="exp-bullets">[\s\S]*?<\/ul>/,
        `<ul class="exp-bullets">\n          ${bulletItems}\n        </ul>`
      );
    });
    result = updated.join(marker);
  }
  return result;
}

function reorderProjectsBlock(projectsHtml, priority) {
  // I delegate to the shared helper using the proj-entry class name.
  return reorderEntryBlock(projectsHtml, 'proj-entry', priority);
}

function extractSection(html, startMarker, endMarker) {
  const start = html.indexOf(startMarker);
  if (start === -1) return '';
  const end = html.indexOf(endMarker, start);
  if (end === -1) return html.substring(start);
  return html.substring(start, end);
}

function createRoleCV(roleConfig, roleId) {
  // I extract each named section from the main CV using comment markers.
  let header = extractSection(mainCV, '<!doctype', '<!-- PROFILE -->');
  const education = extractSection(mainCV, '<!-- EDUCATION -->', '<!-- TECHNICAL SKILLS -->');
  const skills = extractSection(mainCV, '<!-- TECHNICAL SKILLS -->', '<!-- PROJECTS -->');
  const projects = extractSection(mainCV, '<!-- PROJECTS -->', '<!-- EXPERIENCE -->');
  // Publications now sits between Experience and Volunteering in the master CV.
  const experience = extractSection(mainCV, '<!-- EXPERIENCE -->', '<!-- PUBLICATIONS -->');
  const publications = extractSection(mainCV, '<!-- PUBLICATIONS -->', '<!-- VOLUNTEERING -->');
  const volunteering = extractSection(mainCV, '<!-- VOLUNTEERING -->', '<!-- SPOKEN LANGUAGES -->');
  const languages = extractSection(mainCV, '<!-- SPOKEN LANGUAGES -->', '<script>');

  // I strip any inline scripts that sneak in through the header extraction.
  header = header.split('<script>')[0];

  // I substitute the role-specific profile paragraph.
  const profileHTML = `<!-- PROFILE -->
    <div class="section">
      <div class="section-title"><span>Profile</span></div>
      <div class="profile">${roleConfig.profile}</div>
    </div>`;

  // I reorder each section so the most relevant content appears first.
  const reorderedSkills = reorderSkillsBlock(skills, roleConfig.skillPriority);
  const reorderedProjects = reorderProjectsBlock(projects, roleConfig.projectPriority);
  const reorderedExperience = reorderExperienceBlock(experience, roleConfig.experiencePriority);
  // Remove virtual internships from all role CVs then swap in role-specific bullets.
  const filteredExperience = filterVirtualRoles(reorderedExperience);
  const finalExperience = applyRoleBullets(filteredExperience, roleId, cvData.role_experience);

  // I assemble the final HTML without any JavaScript, inserting publications between
  // experience and volunteering so every role CV has the publication record.
  // reorderEntryBlock strips all HTML comments (to remove PAL Leader placeholder),
  // so we must re-insert the section delimiter markers that generateCVDocxNative needs.
  let cv = header + '\n' + profileHTML + '\n' + education + '\n' + reorderedSkills
         + '\n<!-- PROJECTS -->\n' + reorderedProjects
         + '\n<!-- EXPERIENCE -->\n' + finalExperience
         + '\n' + publications + '\n' + volunteering + '\n'
         + languages + '\n</body>\n</html>';

  // I inject a font override for tech roles that suit a modern sans-serif look.
  if (SANS_SERIF_ROLES.has(roleId)) {
    cv = cv.replace('</head>', FONT_OVERRIDE_CSS + '\n</head>');
  }

  return cv;
}

async function generatePDF(htmlContent, outputPath) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
  await page.pdf({
    path: outputPath,
    format: 'A4',
    margin: { top: '11mm', right: '14mm', bottom: '11mm', left: '14mm' },
    printBackground: true
  });
  await browser.close();
}

// ─── html-to-docx fallback pipeline (kept for reference) ─────────────────────

// HTML named entities that are invalid XML - DOCX is XML so these corrupt the file.
const HTML_ENTITY_MAP = {
  middot: '·', pound: '£', nbsp: ' ', copy: '©', reg: '®',
  trade: '™', mdash: '—', ndash: '–', lsquo: '‘', rsquo: '’',
  ldquo: '“', rdquo: '”', hellip: '…', bull: '•', euro: '€',
  deg: '°', times: '×', divide: '÷', rarr: '→', larr: '←',
  infin: '∞', plusmn: '±', frac12: '½', frac14: '¼', frac34: '¾',
};

function decodeHtmlEntities(html) {
  // Replace HTML named entities with their Unicode equivalents.
  // &amp; &lt; &gt; &quot; &apos; are valid XML - leave them intact.
  return html.replace(/&([a-zA-Z]+);/g, (match, name) => {
    if (['amp', 'lt', 'gt', 'quot', 'apos'].includes(name)) return match;
    return HTML_ENTITY_MAP[name] || match;
  });
}

function cleanForDocx(html) {
  let c = html;

  // Strip scripts, styles, base tag
  c = c.replace(/<script[\s\S]*?<\/script>/gi, '');
  c = c.replace(/<style[\s\S]*?<\/style>/gi, '');
  c = c.replace(/<base[^>]*\/?>/gi, '');

  // Convert HTML named entities to Unicode so DOCX XML stays valid
  c = decodeHtmlEntities(c);

  // Strip SVG icons - they don't render in Word
  c = c.replace(/<svg[\s\S]*?<\/svg>/gi, '');

  // Convert name div to a centred heading - handles both CV (.header-name) and cover letter (.name)
  c = c.replace(
    /<div class="(?:header-name|name)">([^<]*)<\/div>/,
    '<h1 style="text-align:center;font-size:18pt;font-weight:bold;margin:0 0 4px 0;">$1<\/h1>'
  );

  // Collapse the flex contact row into one centred paragraph with | separators.
  // Handles both CV (.header-contact) and cover letter (.contact) containers.
  const contactRe = /<div class="(?:header-contact|contact)">([\s\S]*?)<\/div>/;
  c = c.replace(contactRe, (match) => {
    const links = [];
    const re = /<a\s+href="([^"]*)"[^>]*>([^<]*)<\/a>/g;
    let m;
    while ((m = re.exec(match)) !== null) {
      links.push('<a href="' + m[1] + '">' + m[2] + '<\/a>');
    }
    return '<p style="text-align:center;font-size:9pt;margin:2px 0;">' + links.join(' | ') + '<\/p>';
  });

  // Replace section-title divs with simple bold paragraphs
  c = c.replace(
    /<div class="section-title"><span>([^<]*)<\/span><\/div>/g,
    (_, title) =>
      '<p style="font-weight:bold;font-size:10pt;border-bottom:1px solid #000;margin:8px 0 2px 0;padding-bottom:1px;">' + title.toUpperCase() + '<\/p>'
  );

  // Add minimal Word-compatible styles
  c = c.replace(
    '<\/head>',
    '<style>\n' +
    '  body { font-family: Calibri, Arial, sans-serif; font-size: 10.5pt; }\n' +
    '  strong { font-weight: bold; }\n' +
    '  ul { margin: 2px 0 4px 0; padding-left: 18px; }\n' +
    '  li { margin-bottom: 1px; }\n' +
    '  .exp-title, .proj-title { font-weight: bold; }\n' +
    '  .exp-date, .proj-date, .exp-row2, .proj-meta { font-size: 9.5pt; color: #333; }\n' +
    '  .section { margin-bottom: 6px; }\n' +
    '<\/style>\n<\/head>'
  );

  return c;
}

async function generateDOCX(htmlContent, outputPath) {
  const cleanHtml = cleanForDocx(htmlContent);

  const docxBuffer = await HTMLtoDOCX(cleanHtml, null, {
    font: 'Calibri',
    fontSize: 22,
    table: { row: { cantSplit: true } },
    footer: false,
    pageNumber: false,
    margins: { top: 720, right: 900, bottom: 720, left: 900, header: 360, footer: 360, gutter: 0 }
  });

  fs.writeFileSync(outputPath, docxBuffer);
}

// ─── Native docx helpers ──────────────────────────────────────────────────────

function decodeEnt(text) {
  return text
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&#039;/g, "'")
    .replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ').replace(/&middot;/g, '·')
    .replace(/&pound;/g, '£').replace(/&copy;/g, '©').replace(/&reg;/g, '®')
    .replace(/&trade;/g, '™').replace(/&mdash;/g, '—').replace(/&ndash;/g, '–')
    .replace(/&lsquo;/g, '‘').replace(/&rsquo;/g, '’')
    .replace(/&ldquo;/g, '“').replace(/&rdquo;/g, '”')
    .replace(/&hellip;/g, '…').replace(/&bull;/g, '•')
    .replace(/&euro;/g, '€').replace(/&#8599;/g, '↗')
    .replace(/&#[0-9]+;/g, m => String.fromCodePoint(parseInt(m.slice(2, -1), 10)));
}

function stripHtml(html) {
  return decodeEnt(html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
}

function extractInner(html, re) {
  const m = html.match(re);
  return m ? stripHtml(m[1]) : '';
}

// cv.html uses a whitespace-collapsing style where the closing > of a tag
// sits on the next line, e.g. <span class="exp-title"\n  > and </span\n  >.
// This normalises every tag to a single line so all downstream regexes work.
function normalizeTagWs(html) {
  return html.replace(/<([^<>]*?)>/g, (_, inner) => '<' + inner.replace(/\s+/g, ' ').trim() + '>');
}

// Parse HTML into TextRun / ExternalHyperlink objects for use in docx Paragraphs.
// Handles <span class="placeholder"> (yellow highlight), <strong> (bold),
// <a href="..."> (blue underlined hyperlink). All other tags are stripped.
function parseRuns(html, font, sizePt) {
  const hp = sizePt * 2;
  let h = html
    .replace(/<svg[\s\S]*?<\/svg>/gi, '')
    .replace(/<\/?nobr>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n');

  const re = /(<span class="placeholder">[\s\S]*?<\/span>|<strong>([\s\S]*?)<\/strong>|<a\s+href="([^"]*)"[^>]*>([\s\S]*?)<\/a>)/g;
  const runs = [];
  let last = 0;
  let m;

  while ((m = re.exec(h)) !== null) {
    if (m.index > last) {
      const t = decodeEnt(h.substring(last, m.index).replace(/<[^>]+>/g, ''));
      if (t) runs.push(new TextRun({ text: t, font, size: hp }));
    }
    if (m[0].startsWith('<span class="placeholder">')) {
      const t = stripHtml(m[0].replace('<span class="placeholder">', '').replace('</span>', ''));
      if (t) runs.push(new TextRun({ text: t, highlight: 'yellow', font, size: hp }));
    } else if (m[0].startsWith('<strong>')) {
      const t = stripHtml(m[2] || '');
      if (t) runs.push(new TextRun({ text: t, bold: true, font, size: hp }));
    } else if (m[0].startsWith('<a')) {
      const href = m[3] || '';
      const t = stripHtml(m[4] || '');
      if (t && href) {
        runs.push(new ExternalHyperlink({
          link: href,
          children: [new TextRun({ text: t, font, size: hp, color: '1a5cc8', underline: { type: UnderlineType.SINGLE } })],
        }));
      }
    }
    last = m.index + m[0].length;
  }

  if (last < h.length) {
    const t = decodeEnt(h.substring(last).replace(/<[^>]+>/g, ''));
    if (t) runs.push(new TextRun({ text: t, font, size: hp }));
  }

  return runs.length ? runs : [new TextRun({ text: '', font, size: hp })];
}

// Map href prefixes to a Unicode character that renders in Calibri.
const CONTACT_ICONS = [
  ['mailto:', '✉ '],   // ✉ thin-space
  ['linkedin.com', '⁠in '],  // word-joiner + "in" + thin-space (LinkedIn)
  ['github.com', '◔ '],      // ◔ (closest available circle icon)
  ['orcid.org', 'Ⓘ '],       // Ⓘ
  // website / any other URL gets a globe-like bullet
];

function contactIcon(href) {
  for (const [prefix, icon] of CONTACT_ICONS) {
    if (href.includes(prefix)) return icon;
  }
  return '• '; // • thin-space fallback
}

// Build centered contact hyperlink children from a contact div's inner HTML.
function contactChildren(html, font, sizePt) {
  const hp = sizePt * 2;
  const out = [];
  // normalise tags first so multi-line <a href="..."\n  > patterns work
  const norm = normalizeTagWs(html);
  const re = /<a\s+href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/g;
  let m;
  while ((m = re.exec(norm)) !== null) {
    const t = stripHtml(m[2]);
    if (!t) continue;
    if (out.length) out.push(new TextRun({ text: '  |  ', font, size: hp, color: '888888' }));
    // icon prefix as a plain run, link text as hyperlink
    out.push(new TextRun({ text: contactIcon(m[1]), font, size: hp, color: '555555' }));
    out.push(new ExternalHyperlink({
      link: m[1],
      children: [new TextRun({ text: t, font, size: hp, color: '1a5cc8', underline: { type: UnderlineType.SINGLE } })],
    }));
  }
  return out;
}

function sectionTitle(text, font, sizePt) {
  return new Paragraph({
    spacing: { before: 160, after: 40 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: '000000', space: 1 } },
    children: [new TextRun({ text: text.toUpperCase(), bold: true, font, size: sizePt * 2 })],
  });
}

// Two-column paragraph using a right-aligned tab stop.
function twoCol(left, right, font, sizePt, opts = {}) {
  const hp = sizePt * 2;
  const { leftBold = false, after = 20 } = opts;
  return new Paragraph({
    tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
    spacing: { before: 0, after },
    children: [
      new TextRun({ text: left, bold: leftBold, font, size: hp }),
      ...(right ? [new TextRun({ text: '\t' + right, font, size: hp })] : []),
    ],
  });
}

// Bullet paragraph with a literal bullet character and hanging indent.
function bullet(html, font, sizePt) {
  const hp = sizePt * 2;
  return new Paragraph({
    indent: { left: convertInchesToTwip(0.22), hanging: convertInchesToTwip(0.18) },
    spacing: { before: 0, after: 20 },
    children: [
      new TextRun({ text: '•  ', font, size: hp }),
      ...parseRuns(html, font, sizePt),
    ],
  });
}

// ─── Native cover letter DOCX ─────────────────────────────────────────────────

async function generateCoverLetterDocxNative(htmlContent, outputPath) {
  const font = 'Calibri';
  const bodyPt = 11;

  const nameHtml       = (htmlContent.match(/<div class="name">([\s\S]*?)<\/div>/) || [])[1] || '';
  const contactHtml    = (htmlContent.match(/<div class="contact">([\s\S]*?)<\/div>/) || [])[1] || '';
  const dateHtml       = (htmlContent.match(/<div class="date">([\s\S]*?)<\/div>/) || [])[1] || '';
  const recipientHtml  = (htmlContent.match(/<div class="recipient">([\s\S]*?)<\/div>/) || [])[1] || '';
  const subjectHtml    = (htmlContent.match(/<div class="subject">([\s\S]*?)<\/div>/) || [])[1] || '';
  const salutationHtml = (htmlContent.match(/<div class="salutation">([\s\S]*?)<\/div>/) || [])[1] || '';
  const closingHtml    = (htmlContent.match(/<div class="closing">([\s\S]*?)<\/div>/) || [])[1] || '';
  const signatureHtml  = (htmlContent.match(/<div class="signature">([\s\S]*?)<\/div>/) || [])[1] || '';
  const paraMatches    = [...htmlContent.matchAll(/<div class="paragraph">([\s\S]*?)<\/div>/g)];

  const children = [];

  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 60 },
    children: [new TextRun({ text: stripHtml(nameHtml), bold: true, allCaps: true, size: 34, font })],
  }));

  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 40, after: 320 },
    children: contactChildren(contactHtml, font, 10),
  }));

  children.push(new Paragraph({
    spacing: { before: 0, after: 120 },
    children: parseRuns(dateHtml, font, bodyPt),
  }));

  const recipientLines = recipientHtml
    .split(/<br\s*\/?>/gi)
    .map(l => l.trim()).filter(Boolean);
  for (let i = 0; i < recipientLines.length; i++) {
    children.push(new Paragraph({
      spacing: { before: 0, after: i === recipientLines.length - 1 ? 200 : 30 },
      children: parseRuns(recipientLines[i], font, bodyPt),
    }));
  }

  if (subjectHtml) {
    children.push(new Paragraph({
      spacing: { before: 0, after: 180 },
      children: parseRuns(subjectHtml, font, bodyPt),
    }));
  }

  children.push(new Paragraph({
    spacing: { before: 0, after: 180 },
    children: parseRuns(salutationHtml, font, bodyPt),
  }));

  for (const pm of paraMatches) {
    children.push(new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: { before: 0, after: 180, line: 276 },
      children: parseRuns(pm[1], font, bodyPt),
    }));
  }

  children.push(new Paragraph({
    spacing: { before: 200, after: 360 },
    children: [new TextRun({ text: stripHtml(closingHtml), font, size: bodyPt * 2 })],
  }));

  children.push(new Paragraph({
    spacing: { before: 0, after: 0 },
    children: [new TextRun({ text: stripHtml(signatureHtml), bold: true, font, size: bodyPt * 2 })],
  }));

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font, size: bodyPt * 2, color: '000000' },
          paragraph: { spacing: { after: 0 } },
        },
      },
    },
    sections: [{
      properties: {
        page: {
          size: {
            width: convertMillimetersToTwip(210),
            height: convertMillimetersToTwip(297),
          },
          margin: {
            top: convertMillimetersToTwip(25),
            right: convertMillimetersToTwip(28),
            bottom: convertMillimetersToTwip(25),
            left: convertMillimetersToTwip(28),
          },
        },
      },
      children,
    }],
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outputPath, buffer);
}

// ─── Native CV DOCX ───────────────────────────────────────────────────────────

function cvEntries(html, cls) {
  const marker = `<div class="${cls}">`;
  return html.split(marker).slice(1).map(p => marker + p);
}

function buildEducation(html, font, bodyPt) {
  const out = [];
  for (const e of cvEntries(html, 'edu-entry')) {
    const rowM = e.match(/<div class="edu-row">([\s\S]*?)<\/div>/);
    const inst  = rowM ? extractInner(rowM[1], /<span class="edu-left">([\s\S]*?)<\/span>/) : '';
    const dates = rowM ? extractInner(rowM[1], /<span class="edu-right">([\s\S]*?)<\/span>/) : '';
    const subM  = e.match(/<div class="edu-sub">([\s\S]*?)<\/div>/);
    const award = extractInner(e, /<div class="edu-award">([\s\S]*?)<\/div>/);
    const mods  = extractInner(e, /<div class="edu-modules">([\s\S]*?)<\/div>/);

    out.push(twoCol(inst, dates, font, bodyPt, { leftBold: true, after: 20 }));
    if (subM) {
      out.push(new Paragraph({
        spacing: { before: 0, after: 10 },
        children: parseRuns(subM[1], font, bodyPt),
      }));
    }
    if (award) out.push(new Paragraph({ spacing: { before: 0, after: 10 }, children: [new TextRun({ text: award, font, size: bodyPt * 2 })] }));
    if (mods)  out.push(new Paragraph({ spacing: { before: 0, after: 10 }, children: [new TextRun({ text: mods, font, size: (bodyPt - 0.5) * 2, color: '333333' })] }));
    for (const lm of e.matchAll(/<li>([\s\S]*?)<\/li>/g)) {
      out.push(bullet(lm[1], font, bodyPt - 0.5));
    }
    out.push(new Paragraph({ spacing: { before: 0, after: 80 }, children: [] }));
  }
  return out;
}

function buildSkills(html, font, bodyPt) {
  const out = [];
  for (const m of html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)) {
    out.push(new Paragraph({
      spacing: { before: 0, after: 40 },
      children: parseRuns(m[1], font, bodyPt),
    }));
  }
  return out;
}

function buildProjects(html, font, bodyPt) {
  const out = [];
  for (const e of cvEntries(html, 'proj-entry')) {
    const title = extractInner(e, /<span class="proj-title">([\s\S]*?)<\/span>/);
    const dates = extractInner(e, /<span class="proj-date">([\s\S]*?)<\/span>/);
    const tech  = extractInner(e, /<span class="proj-tech">([\s\S]*?)<\/span>/);
    const row2M = e.match(/<div class="proj-row2">([\s\S]*?)<\/div>/);
    const links = [];
    if (row2M) {
      for (const lm of row2M[1].matchAll(/<a\s+href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/g)) {
        const t = stripHtml(lm[2]);
        if (t) links.push({ href: lm[1], text: t });
      }
    }

    out.push(twoCol(title, dates, font, bodyPt, { leftBold: true, after: 10 }));

    const row2 = [];
    if (tech) row2.push(new TextRun({ text: tech, font, size: (bodyPt - 0.5) * 2, color: '444444' }));
    for (let i = 0; i < links.length; i++) {
      row2.push(new TextRun({ text: (tech || i > 0) ? '   ' : '', font, size: (bodyPt - 0.5) * 2 }));
      if (i > 0) row2.push(new TextRun({ text: '| ', font, size: (bodyPt - 0.5) * 2 }));
      row2.push(new ExternalHyperlink({ link: links[i].href, children: [new TextRun({ text: links[i].text, font, size: (bodyPt - 0.5) * 2, color: '1a5cc8', underline: { type: UnderlineType.SINGLE } })] }));
    }
    if (row2.length) out.push(new Paragraph({ spacing: { before: 0, after: 10 }, children: row2 }));
    for (const lm of e.matchAll(/<li>([\s\S]*?)<\/li>/g)) out.push(bullet(lm[1], font, bodyPt - 0.5));
    out.push(new Paragraph({ spacing: { before: 0, after: 80 }, children: [] }));
  }
  return out;
}

function buildExp(html, font, bodyPt) {
  const out = [];
  for (const e of cvEntries(html, 'exp-entry')) {
    const row1M   = e.match(/<div class="exp-row1">([\s\S]*?)<\/div>/);
    const row2M   = e.match(/<div class="exp-row2">([\s\S]*?)<\/div>/);
    const title   = row1M ? extractInner(row1M[1], /<span class="exp-title">([\s\S]*?)<\/span>/) : '';
    const company = row1M ? extractInner(row1M[1], /<span class="exp-company">([\s\S]*?)<\/span>/) : '';
    const tech    = row2M ? extractInner(row2M[1], /<span class="exp-tech">([\s\S]*?)<\/span>/) : '';
    const date    = row2M ? extractInner(row2M[1], /<span class="exp-date">([\s\S]*?)<\/span>/) : '';
    const links   = [];
    if (row2M) {
      for (const lm of row2M[1].matchAll(/<a\s+href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/g)) {
        const t = stripHtml(lm[2]);
        if (t) links.push({ href: lm[1], text: t });
      }
    }

    out.push(twoCol(title, company, font, bodyPt, { leftBold: true, after: 10 }));

    const row2 = [];
    if (tech) row2.push(new TextRun({ text: tech, font, size: (bodyPt - 0.5) * 2, color: '444444' }));
    if (date) row2.push(new TextRun({ text: '\t' + date, font, size: (bodyPt - 0.5) * 2 }));
    for (let i = 0; i < links.length; i++) {
      row2.push(new TextRun({ text: (tech || i > 0) ? '   ' : '', font, size: (bodyPt - 0.5) * 2 }));
      if (i > 0) row2.push(new TextRun({ text: '| ', font, size: (bodyPt - 0.5) * 2 }));
      row2.push(new ExternalHyperlink({ link: links[i].href, children: [new TextRun({ text: links[i].text, font, size: (bodyPt - 0.5) * 2, color: '1a5cc8', underline: { type: UnderlineType.SINGLE } })] }));
    }
    if (row2.length) {
      out.push(new Paragraph({
        tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
        spacing: { before: 0, after: 10 },
        children: row2,
      }));
    }
    for (const lm of e.matchAll(/<li>([\s\S]*?)<\/li>/g)) out.push(bullet(lm[1], font, bodyPt - 0.5));
    out.push(new Paragraph({ spacing: { before: 0, after: 80 }, children: [] }));
  }
  return out;
}

function buildVolunteering(html, font, bodyPt) {
  const out = [];
  for (const e of cvEntries(html, 'vol-entry')) {
    const title = extractInner(e, /<span class="vol-title">([\s\S]*?)<\/span>/);
    const date  = extractInner(e, /<span class="vol-date">([\s\S]*?)<\/span>/);
    const org   = extractInner(e, /<div class="vol-org">([\s\S]*?)<\/div>/);
    out.push(twoCol(title, date, font, bodyPt, { leftBold: true, after: 10 }));
    if (org) out.push(new Paragraph({ spacing: { before: 0, after: 10 }, children: [new TextRun({ text: org, font, size: (bodyPt - 0.5) * 2 })] }));
    for (const lm of e.matchAll(/<li>([\s\S]*?)<\/li>/g)) out.push(bullet(lm[1], font, bodyPt - 0.5));
    out.push(new Paragraph({ spacing: { before: 0, after: 80 }, children: [] }));
  }
  return out;
}

async function generateCVDocxNative(htmlContent, outputPath) {
  // Normalise all multi-line HTML tags (cv.html uses > on its own line to
  // suppress whitespace between inline elements).
  const html = normalizeTagWs(htmlContent);
  const font = 'Calibri';
  const bodyPt = 10;
  const titlePt = 10.5;

  const nameHtml    = (html.match(/<div class="header-name">([\s\S]*?)<\/div>/) || [])[1] || '';
  const contHtml    = (html.match(/<div class="header-contact">([\s\S]*?)<\/div>/) || [])[1] || '';

  const profileSec  = extractSection(html, '<!-- PROFILE -->',         '<!-- EDUCATION -->');
  const eduSec      = extractSection(html, '<!-- EDUCATION -->',        '<!-- TECHNICAL SKILLS -->');
  const skillsSec   = extractSection(html, '<!-- TECHNICAL SKILLS -->', '<!-- PROJECTS -->');
  const projSec     = extractSection(html, '<!-- PROJECTS -->',         '<!-- EXPERIENCE -->');
  const expSec      = extractSection(html, '<!-- EXPERIENCE -->',        '<!-- PUBLICATIONS -->');
  const pubSec      = extractSection(html, '<!-- PUBLICATIONS -->',      '<!-- VOLUNTEERING -->');
  const volSec      = extractSection(html, '<!-- VOLUNTEERING -->',      '<!-- SPOKEN LANGUAGES -->');
  const langEnd     = html.includes('<script>') ? '<script>' : '</body>';
  const langSec     = extractSection(html, '<!-- SPOKEN LANGUAGES -->', langEnd);

  const profileText = extractInner(profileSec, /<div class="profile">([\s\S]*?)<\/div>/);

  const ch = [];

  ch.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 60 },
    children: [new TextRun({ text: stripHtml(nameHtml), bold: true, allCaps: true, size: 36, font })],
  }));
  ch.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 200 },
    children: contactChildren(contHtml, font, 9.5),
  }));

  if (profileText) {
    ch.push(sectionTitle('Profile', font, titlePt));
    ch.push(new Paragraph({ spacing: { before: 60, after: 120 }, children: [new TextRun({ text: profileText, font, size: bodyPt * 2 })] }));
  }

  if (eduSec) {
    ch.push(sectionTitle('Education', font, titlePt));
    ch.push(...buildEducation(eduSec, font, bodyPt));
  }
  if (skillsSec) {
    ch.push(sectionTitle('Technical Skills', font, titlePt));
    ch.push(...buildSkills(skillsSec, font, bodyPt));
    ch.push(new Paragraph({ spacing: { before: 0, after: 60 }, children: [] }));
  }
  if (projSec) {
    ch.push(sectionTitle('Projects', font, titlePt));
    ch.push(...buildProjects(projSec, font, bodyPt));
  }
  if (expSec) {
    ch.push(sectionTitle('Experience', font, titlePt));
    ch.push(...buildExp(expSec, font, bodyPt));
  }
  if (pubSec && pubSec.includes('exp-entry')) {
    ch.push(sectionTitle('Research & Publications', font, titlePt));
    ch.push(...buildExp(pubSec, font, bodyPt));
  }
  if (volSec) {
    ch.push(sectionTitle('Volunteering', font, titlePt));
    ch.push(...buildVolunteering(volSec, font, bodyPt));
  }
  if (langSec) {
    ch.push(sectionTitle('Spoken Languages', font, titlePt));
    ch.push(...buildSkills(langSec, font, bodyPt));
  }

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font, size: bodyPt * 2, color: '000000' },
          paragraph: { spacing: { after: 0 } },
        },
      },
    },
    sections: [{
      properties: {
        page: {
          size: {
            width: convertMillimetersToTwip(210),
            height: convertMillimetersToTwip(297),
          },
          margin: {
            top: convertMillimetersToTwip(11),
            right: convertMillimetersToTwip(14),
            bottom: convertMillimetersToTwip(11),
            left: convertMillimetersToTwip(14),
          },
        },
      },
      children: ch,
    }],
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outputPath, buffer);
}

// ─── Build all ────────────────────────────────────────────────────────────────

async function buildAll() {
  for (const [roleId, config] of Object.entries(roles)) {
    console.log(`\nBuilding ${config.title} CV...`);

    // I pass roleId so createRoleCV can apply role-specific font overrides.
    const htmlContent = createRoleCV(config, roleId);
    const htmlPath = path.join(process.cwd(), 'public', 'resume', `cv-${roleId}.html`);
    fs.writeFileSync(htmlPath, htmlContent);
    console.log(`  ✓ HTML: ${htmlPath}`);

    // Generate PDF
    try {
      const pdfPath = path.join(process.cwd(), 'public', 'resume', `cv-${roleId}.pdf`);
      await generatePDF(htmlContent, pdfPath);
      console.log(`  ✓ PDF: ${pdfPath}`);
    } catch (e) {
      console.log(`  ✗ PDF failed: ${e.message}`);
    }

    // Generate DOCX (native docx package - proper Word output)
    try {
      const docxPath = path.join(process.cwd(), 'public', 'resume', `cv-${roleId}.docx`);
      await generateCVDocxNative(htmlContent, docxPath);
      console.log(`  ✓ DOCX: ${docxPath}`);
    } catch (e) {
      console.log(`  ✗ DOCX failed: ${e.message}`);
      // Fallback to html-to-docx if native generation fails
      try {
        const docxPath = path.join(process.cwd(), 'public', 'resume', `cv-${roleId}.docx`);
        await generateDOCX(htmlContent, docxPath);
        console.log(`  ✓ DOCX (fallback): ${docxPath}`);
      } catch (e2) {
        console.log(`  ✗ DOCX fallback also failed: ${e2.message}`);
      }
    }
  }

  // Cover letters - DOCX (native) and PDF for each role
  console.log('\nBuilding cover letters (DOCX and PDF)...');
  const coverLetterRoles = ['general', 'software', 'embedded', 'devops', 'data', 'quant', 'security'];
  for (const role of coverLetterRoles) {
    const clHtmlPath = path.join(process.cwd(), 'public', 'resume', `cover-letter-${role}.html`);
    if (!fs.existsSync(clHtmlPath)) { console.log(`  - cover-letter-${role}.html not found, skipping`); continue; }
    const clHtml = fs.readFileSync(clHtmlPath, 'utf8');
    try {
      const clDocxPath = path.join(process.cwd(), 'public', 'resume', `cover-letter-${role}.docx`);
      await generateCoverLetterDocxNative(clHtml, clDocxPath);
      console.log(`  ✓ cover-letter-${role}.docx`);
    } catch (e) {
      console.log(`  ✗ cover-letter-${role} DOCX failed: ${e.message}`);
    }
    try {
      const clPdfPath = path.join(process.cwd(), 'public', 'resume', `cover-letter-${role}.pdf`);
      await generatePDF(clHtml, clPdfPath);
      console.log(`  ✓ cover-letter-${role}.pdf`);
    } catch (e) {
      console.log(`  ✗ cover-letter-${role} PDF failed: ${e.message}`);
    }
  }

  // Main CV DOCX - section-extracted for clean output
  console.log('\nBuilding main CV DOCX...');
  try {
    const mainDocxPath = path.join(process.cwd(), 'public', 'resume', 'Isaac_Adjei_CV.docx');
    let mainHeader = extractSection(mainCV, '<!doctype', '<!-- PROFILE -->');
    mainHeader = mainHeader.split('<script>')[0];
    const mainProfile   = extractSection(mainCV, '<!-- PROFILE -->',          '<!-- EDUCATION -->');
    const mainEducation = extractSection(mainCV, '<!-- EDUCATION -->',         '<!-- TECHNICAL SKILLS -->');
    const mainSkills    = extractSection(mainCV, '<!-- TECHNICAL SKILLS -->',  '<!-- PROJECTS -->');
    const mainProjects  = extractSection(mainCV, '<!-- PROJECTS -->',          '<!-- EXPERIENCE -->');
    const mainExp       = extractSection(mainCV, '<!-- EXPERIENCE -->',        '<!-- PUBLICATIONS -->');
    const mainPubs      = extractSection(mainCV, '<!-- PUBLICATIONS -->',      '<!-- VOLUNTEERING -->');
    const mainVol       = extractSection(mainCV, '<!-- VOLUNTEERING -->',      '<!-- SPOKEN LANGUAGES -->');
    const mainLangs     = extractSection(mainCV, '<!-- SPOKEN LANGUAGES -->',  '<script>');
    const mainHtml = mainHeader + '\n' + mainProfile + '\n' + mainEducation + '\n'
                   + mainSkills + '\n' + mainProjects + '\n' + mainExp + '\n'
                   + mainPubs + '\n' + mainVol + '\n' + mainLangs + '\n</body>\n</html>';
    await generateCVDocxNative(mainHtml, mainDocxPath);
    console.log(`  ✓ DOCX: ${mainDocxPath}`);
  } catch (e) {
    console.log(`  ✗ Main DOCX failed: ${e.message}`);
  }

  // Main CV PDF from the master cv.html
  console.log('\nBuilding main CV PDF...');
  try {
    const mainPdfPath = path.join(process.cwd(), 'public', 'resume', 'Isaac_Adjei_CV.pdf');
    await generatePDF(mainCV, mainPdfPath);
    console.log(`  ✓ PDF: ${mainPdfPath}`);
  } catch (e) {
    console.log(`  ✗ Main CV PDF failed: ${e.message}`);
  }

  console.log('\n✅ All CVs built successfully!');
}

buildAll().catch(err => {
  console.error('Build failed:', err);
  process.exit(1);
});
