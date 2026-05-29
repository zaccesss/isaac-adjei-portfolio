const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const HTMLtoDOCX = require('html-to-docx');

const mainCVPath = path.join(process.cwd(), 'public', 'resume', 'cv.html');
const mainCV = fs.readFileSync(mainCVPath, 'utf8');

// Role configurations with content priorities
const roles = {
  software: {
    title: 'Software Engineering',
    profile: 'Software Engineering student at Aston University (Predicted First Class) and Top 40 Finalist in the Black Heritage Undergraduate of the Year Award 2026 (TargetJobs & Sky). Builds production-grade full-stack web applications with React, Next.js, TypeScript and cloud infrastructure. Seeking software engineering internships and industrial placements.',
    skillPriority: ['Languages', 'Web', 'Cloud', 'AI/ML', 'Embedded', 'Professional'],
    projectPriority: ['AstonCV', 'PHAEMOS', 'git-unlocked', 'LED Cube', 'Audio Amplifier', 'CNC'],
    experiencePriority: ['Student Representative', 'British Airways', 'Yunex Traffic', 'Ghana High Commission', 'HVAC']
  },
  embedded: {
    title: 'Embedded Systems',
    profile: 'Electronic Engineering and Computer Science student at Aston University (Predicted First Class) and Top 40 Finalist in the Black Heritage Undergraduate of the Year Award 2026. Builds across the hardware-software stack from PCB-level design and embedded firmware to IoT platforms. Seeking embedded systems and hardware-software integration internships.',
    skillPriority: ['Embedded', 'Languages', 'Hardware', 'Web', 'Cloud', 'Professional'],
    projectPriority: ['PHAEMOS', 'LED Cube', 'CNC', 'Audio Amplifier', 'AstonCV', 'git-unlocked'],
    experiencePriority: ['HVAC', 'British Airways', 'Student Representative', 'Yunex Traffic', 'Ghana High Commission']
  },
  data: {
    title: 'Data & AI Engineering',
    profile: 'Electronic Engineering and Computer Science student at Aston University (Predicted First Class) specialising in AI/ML and data engineering. Builds intelligent systems with Python, TensorFlow and data pipelines. Seeking data engineering and AI/ML internships.',
    skillPriority: ['AI/ML', 'Languages', 'Cloud', 'Web', 'Embedded', 'Professional'],
    projectPriority: ['PHAEMOS', 'AstonCV', 'LED Cube', 'git-unlocked', 'Audio Amplifier', 'CNC'],
    experiencePriority: ['British Airways', 'Yunex Traffic', 'Student Representative', 'Ghana High Commission', 'HVAC']
  },
  devops: {
    title: 'DevOps & Cloud',
    profile: 'Electronic Engineering and Computer Science student at Aston University (Predicted First Class) and Top 40 Finalist. Builds cloud-native infrastructure with AWS, Docker, Kubernetes and CI/CD pipelines. Seeking DevOps and cloud engineering internships.',
    skillPriority: ['Cloud', 'Languages', 'Web', 'AI/ML', 'Embedded', 'Professional'],
    projectPriority: ['PHAEMOS', 'AstonCV', 'git-unlocked', 'LED Cube', 'Audio Amplifier', 'CNC'],
    experiencePriority: ['British Airways', 'Yunex Traffic', 'Student Representative', 'Ghana High Commission', 'HVAC']
  },
  quant: {
    title: 'Quantitative Developer',
    profile: 'Electronic Engineering and Computer Science student at Aston University (Predicted First Class). Builds high-performance systems with C++ and Python. Strong mathematical foundation and algorithm design skills. Seeking quantitative developer internships.',
    skillPriority: ['Languages', 'AI/ML', 'Embedded', 'Cloud', 'Web', 'Professional'],
    projectPriority: ['PHAEMOS', 'LED Cube', 'AstonCV', 'git-unlocked', 'Audio Amplifier', 'CNC'],
    experiencePriority: ['British Airways', 'Yunex Traffic', 'Student Representative', 'Ghana High Commission', 'HVAC']
  },
  security: {
    title: 'Cybersecurity',
    profile: 'Electronic Engineering and Computer Science student at Aston University (Predicted First Class) with strong security mindset. Implements secure authentication, audit logging and RBAC. Seeking cybersecurity internships.',
    skillPriority: ['Cloud', 'Languages', 'Web', 'Embedded', 'AI/ML', 'Professional'],
    projectPriority: ['AstonCV', 'PHAEMOS', 'git-unlocked', 'LED Cube', 'Audio Amplifier', 'CNC'],
    experiencePriority: ['British Airways', 'Student Representative', 'Yunex Traffic', 'Ghana High Commission', 'HVAC']
  }
};

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

function extractSection(html, startMarker, endMarker) {
  const start = html.indexOf(startMarker);
  if (start === -1) return '';
  const end = html.indexOf(endMarker, start);
  if (end === -1) return html.substring(start);
  return html.substring(start, end);
}

function createRoleCV(roleConfig) {
  // Extract sections from main CV
  let header = extractSection(mainCV, '<!doctype', '<!-- PROFILE -->');
  const education = extractSection(mainCV, '<!-- EDUCATION -->', '<!-- SKILLS -->');
  const skills = extractSection(mainCV, '<!-- SKILLS -->', '<!-- PROJECTS -->');
  const projects = extractSection(mainCV, '<!-- PROJECTS -->', '<!-- EXPERIENCE -->');
  const experience = extractSection(mainCV, '<!-- EXPERIENCE -->', '<!-- VOLUNTEERING -->');
  const volunteering = extractSection(mainCV, '<!-- VOLUNTEERING -->', '<!-- LANGUAGES -->');
  const languages = extractSection(mainCV, '<!-- LANGUAGES -->', '<script>');

  // Clean header - remove any JavaScript
  header = header.split('<script>')[0];
  
  // Create modified profile
  const profileHTML = `<!-- PROFILE -->
    <div class="section">
      <div class="section-title">Profile</div>
      <div class="profile">${roleConfig.profile}</div>
    </div>`;

  // I reorder skills so the most relevant categories appear first for the target role
  const reorderedSkills = reorderSkillsBlock(skills, roleConfig.skillPriority);

  // Build the CV without JavaScript
  let cv = header + '\n' + profileHTML + '\n' + education + '\n' + reorderedSkills + '\n' + projects + '\n' + experience + '\n' + volunteering + '\n' + languages + '\n</body>\n</html>';

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

async function generateDOCX(htmlContent, outputPath) {
  // Remove script tags and inline styles for clean docx
  const cleanHtml = htmlContent
    .replace(/<script[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/onload="[^"]*"/gi, '');
  
  const docxBuffer = await HTMLtoDOCX(cleanHtml, null, {
    table: { row: { cantSplit: true } },
    footer: true,
    pageNumber: true
  });
  
  fs.writeFileSync(outputPath, docxBuffer);
}

async function buildAll() {
  console.log('Installing html-to-docx if needed...');
  
  for (const [roleId, config] of Object.entries(roles)) {
    console.log(`\nBuilding ${config.title} CV...`);
    
    // Create HTML
    const htmlContent = createRoleCV(config);
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
    
    // Generate DOCX
    try {
      const docxPath = path.join(process.cwd(), 'public', 'resume', `cv-${roleId}.docx`);
      await generateDOCX(htmlContent, docxPath);
      console.log(`  ✓ DOCX: ${docxPath}`);
    } catch (e) {
      console.log(`  ✗ DOCX failed: ${e.message}`);
      // Fallback: copy main docx
      const mainDocx = path.join(process.cwd(), 'public', 'resume', 'Isaac_Adjei_CV.docx');
      fs.copyFileSync(mainDocx, docxPath);
    }
  }
  console.log('\n✅ All role-specific CVs built successfully!');
}

buildAll().catch(err => {
  console.error('Build failed:', err);
  process.exit(1);
});
