const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

// Read main CV
const mainCVPath = path.join(process.cwd(), 'public', 'resume', 'cv.html');
const mainCV = fs.readFileSync(mainCVPath, 'utf8');

// Role configurations with reordered priorities
const roles = {
  software: {
    title: 'Software Engineering',
    profile: 'Software Engineering student at Aston University (Predicted First Class) and Top 40 Finalist in the Black Heritage Undergraduate of the Year Award 2026. Builds production-grade full-stack web applications with React, Next.js, TypeScript and cloud infrastructure. Seeking software engineering internships and industrial placements.',
    skillOrder: ['Languages', 'Frontend', 'Backend', 'Cloud Devops', 'Tools', 'Embedded', 'Hardware'],
    projectOrder: ['Personal Portfolio & Dashboard', 'PHAEMOS: Smart Maintenance Platform', 'Embedded Sensor Networks'],
  },
  embedded: {
    title: 'Embedded Systems',
    profile: 'Electronic Engineering and Computer Science student at Aston University (Predicted First Class) and Top 40 Finalist in the Black Heritage Undergraduate of the Year Award 2026. Builds across the hardware-software stack from PCB-level design and embedded firmware to IoT platforms. Seeking embedded systems and hardware-software integration internships.',
    skillOrder: ['Embedded', 'Hardware', 'Languages', 'Backend', 'Cloud Devops', 'Frontend', 'Tools'],
    projectOrder: ['PHAEMOS: Smart Maintenance Platform', 'Embedded Sensor Networks', 'Personal Portfolio & Dashboard'],
  },
  data: {
    title: 'Data & AI Engineering',
    profile: 'Electronic Engineering and Computer Science student at Aston University (Predicted First Class) specialising in AI/ML and data engineering. Builds intelligent systems with Python, TensorFlow and data pipelines. Seeking data engineering and AI/ML internships.',
    skillOrder: ['Languages', 'Backend', 'Cloud Devops', 'Frontend', 'Tools', 'Embedded', 'Hardware'],
    projectOrder: ['PHAEMOS: Smart Maintenance Platform', 'Personal Portfolio & Dashboard', 'Embedded Sensor Networks'],
  },
  devops: {
    title: 'DevOps & Cloud',
    profile: 'Electronic Engineering and Computer Science student at Aston University (Predicted First Class) and Top 40 Finalist. Builds cloud-native infrastructure with AWS, Docker, Kubernetes and CI/CD pipelines. Seeking DevOps and cloud engineering internships.',
    skillOrder: ['Cloud Devops', 'Backend', 'Languages', 'Tools', 'Frontend', 'Embedded', 'Hardware'],
    projectOrder: ['PHAEMOS: Smart Maintenance Platform', 'Personal Portfolio & Dashboard', 'Embedded Sensor Networks'],
  },
  quant: {
    title: 'Quantitative Developer',
    profile: 'Electronic Engineering and Computer Science student at Aston University (Predicted First Class). Builds high-performance systems with C++ and Python. Strong mathematical foundation and algorithm design skills. Seeking quantitative developer internships.',
    skillOrder: ['Languages', 'Backend', 'Cloud Devops', 'Tools', 'Frontend', 'Embedded', 'Hardware'],
    projectOrder: ['PHAEMOS: Smart Maintenance Platform', 'Personal Portfolio & Dashboard', 'Embedded Sensor Networks'],
  },
  security: {
    title: 'Cybersecurity',
    profile: 'Electronic Engineering and Computer Science student at Aston University (Predicted First Class) with strong security mindset. Implements secure authentication, audit logging and RBAC. Seeking cybersecurity internships.',
    skillOrder: ['Backend', 'Cloud Devops', 'Languages', 'Tools', 'Frontend', 'Embedded', 'Hardware'],
    projectOrder: ['Personal Portfolio & Dashboard', 'PHAEMOS: Smart Maintenance Platform', 'Embedded Sensor Networks'],
  }
};

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

function extractSection(html, startMarker, endMarker) {
  const start = html.indexOf(startMarker);
  if (start === -1) return '';
  const end = html.indexOf(endMarker, start);
  if (end === -1) return html.substring(start);
  return html.substring(start, end);
}

function createRoleCV(roleConfig) {
  // Extract sections from main CV
  const header = extractSection(mainCV, '<!doctype', '<!-- PROFILE -->');
  const education = extractSection(mainCV, '<!-- EDUCATION -->', '<!-- TECHNICAL SKILLS -->');
  const skills = extractSection(mainCV, '<!-- TECHNICAL SKILLS -->', '<!-- PROJECTS -->');
  const projects = extractSection(mainCV, '<!-- PROJECTS -->', '<!-- EXPERIENCE -->');
  const experience = extractSection(mainCV, '<!-- EXPERIENCE -->', '<!-- VOLUNTEERING -->');
  const volunteering = extractSection(mainCV, '<!-- VOLUNTEERING -->', '<!-- SPOKEN LANGUAGES -->');
  const languages = extractSection(mainCV, '<!-- SPOKEN LANGUAGES -->', '</body>');

  // Create modified profile
  const profileHTML = `    <div class="section">
      <div class="section-title">Profile</div>
      <div class="profile">${roleConfig.profile}</div>
    </div>`;

  // Build the CV
  let cv = header + '\n<!-- PROFILE -->\n' + profileHTML + '\n' + education + '\n' + skills + '\n' + projects + '\n' + experience + '\n' + volunteering + '\n' + languages + '\n</body>\n</html>';

  return cv;
}

async function buildAll() {
  for (const [roleId, config] of Object.entries(roles)) {
    console.log(`Building ${config.title} CV...`);
    
    // Create HTML
    const htmlContent = createRoleCV(config);
    const htmlPath = path.join(process.cwd(), 'public', 'resume', `cv-${roleId}.html`);
    fs.writeFileSync(htmlPath, htmlContent);
    console.log(`  Created ${htmlPath}`);
    
    // Generate PDF
    const pdfPath = path.join(process.cwd(), 'public', 'resume', `cv-${roleId}.pdf`);
    await generatePDF(htmlContent, pdfPath);
    console.log(`  Created ${pdfPath}`);
    
    // Copy main Word doc for now (would need proper docx generation)
    const mainDocx = path.join(process.cwd(), 'public', 'resume', 'Isaac_Adjei_CV.docx');
    const docxPath = path.join(process.cwd(), 'public', 'resume', `cv-${roleId}.docx`);
    fs.copyFileSync(mainDocx, docxPath);
    console.log(`  Created ${docxPath}`);
  }
  console.log('All role-specific CVs built successfully!');
}

buildAll().catch(console.error);
