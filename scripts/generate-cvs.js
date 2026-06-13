#!/usr/bin/env node
/**
 * CV Generator Script
 * Generates all role-specific CVs from data/cv.yml
 * Run: node scripts/generate-cvs.js
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const DATA_DIR = path.join(__dirname, '..', 'data');
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'resume');

// Read CV data
const cvData = yaml.load(fs.readFileSync(path.join(DATA_DIR, 'cv.yml'), 'utf8'));

// CSS styles for all CVs
const CSS_STYLES = `<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
@page { size: A4; margin: 11mm 14mm 11mm 14mm; }
body { font-family: "Cambria", "Georgia", serif; font-size: 9.8pt; color: #000; line-height: 1.25; -webkit-user-select: text; user-select: text; }
a { color: #1a5cc8; text-decoration: underline; overflow-wrap: anywhere; }
.contact-icon { vertical-align: middle; margin-right: 1px; }
.contact-sep { color: #888; margin: 0 7px; }
.header { text-align: center; margin-bottom: 5px; }
.header-name { font-size: 22pt; font-weight: 700; font-variant: small-caps; letter-spacing: 1px; margin-bottom: 2px; }
.header-contact { font-size: 8.8pt; color: #111; }
.profile { font-size: 9.4pt; color: #111; margin-bottom: 5px; line-height: 1.3; text-align: justify; }
.section { margin-top: 4px; }
.section-title { font-size: 9.8pt; font-weight: 700; font-variant: small-caps; letter-spacing: 0.5px; border-bottom: 1px solid #000; margin-bottom: 4px; padding-bottom: 0; }
.edu-entry { margin-bottom: 3px; }
.edu-row { display: flex; justify-content: space-between; align-items: baseline; }
.edu-left { font-weight: 700; font-size: 9.8pt; }
.edu-right { font-style: italic; font-size: 9pt; white-space: nowrap; margin-left: 8px; }
.edu-sub { font-style: italic; font-size: 9pt; color: #111; }
.edu-award { font-size: 8.8pt; color: #333; font-style: italic; font-weight: normal; }
.edu-bullets { list-style: disc; padding-left: 16px; margin-top: 2px; }
.skills-block { font-size: 9pt; color: #111; }
.skill-label { font-weight: 700; }
.skill-category { margin-bottom: 2px; }
.proj-entry { margin-bottom: 5px; }
.proj-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 1px; }
.proj-name { font-weight: 700; font-size: 9.8pt; }
.proj-date { font-style: italic; font-size: 9pt; color: #333; }
.proj-tech { font-size: 8.8pt; color: #555; font-style: italic; }
.proj-bullets { list-style: disc; padding-left: 16px; margin-top: 2px; }
.proj-bullets li { margin-bottom: 1px; }
.exp-entry { margin-bottom: 5px; }
.exp-header { display: flex; justify-content: space-between; align-items: baseline; }
.exp-company { font-weight: 700; font-size: 9.8pt; }
.exp-date { font-style: italic; font-size: 9pt; color: #333; }
.exp-role { font-size: 9pt; font-style: italic; }
.exp-bullets { list-style: disc; padding-left: 16px; margin-top: 2px; }
.vol-entry { margin-bottom: 3px; }
.vol-header { display: flex; justify-content: space-between; }
.vol-org { font-weight: 700; }
.vol-date { font-style: italic; font-size: 9pt; color: #333; }
@media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } .exp-entry, .proj-entry, .edu-entry, .vol-entry { page-break-inside: avoid; } }
</style>`;

// SVG icons
const EMAIL_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2" class="contact-icon"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`;
const WEB_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2" class="contact-icon"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/></svg>`;

function generateHeader() {
  const { personal } = cvData;
  return `<!-- HEADER -->
<div class="header">
  <div class="header-name">${personal.name}</div>
  <div class="header-contact">
    ${EMAIL_ICON}<a href="mailto:${personal.email}">${personal.email}</a>
    <span class="contact-sep">|</span>
    ${WEB_ICON}<a href="${personal.website}">${personal.website.replace('https://', 'www.')}</a>
    <span class="contact-sep">|</span>
    <a href="${personal.linkedin}">LinkedIn</a>
    <span class="contact-sep">|</span>
    <a href="${personal.github}">GitHub</a>
  </div>
</div>`;
}

function generateProfile(role) {
  const profile = cvData.role_profiles[role] || cvData.personal.summary;
  return `<!-- PROFILE -->
<div class="section">
  <div class="section-title">Profile</div>
  <div class="profile">${profile}</div>
</div>`;
}

function generateEducation() {
  const edu = cvData.education[0];
  return `<!-- EDUCATION -->
<div class="section">
  <div class="section-title">Education</div>
  <div class="edu-entry">
    <div class="edu-row">
      <span class="edu-left">${edu.institution}</span>
      <span class="edu-right">${edu.duration}</span>
    </div>
    <div class="edu-sub">${edu.degree} · <strong>Predicted: ${edu.predicted}</strong></div>
    <div class="edu-award">${edu.award}</div>
    <div class="edu-modules"><strong>Relevant Modules:</strong> ${edu.modules.join(', ')}</div>
  </div>
</div>`;
}

function generateSkills(role) {
  const skills = cvData.skills[role] || cvData.skills.software;
  let html = `<!-- TECHNICAL SKILLS -->
<div class="section">
  <div class="section-title">Technical Skills</div>
  <div class="skills-block">`;
  
  for (const [category, items] of Object.entries(skills)) {
    const label = category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) + ':';
    html += `\n    <p class="skill-category"><span class="skill-label">${label}</span> ${items.join(', ')}</p>`;
  }
  
  html += `\n  </div>\n</div>`;
  return html;
}

function generateProjects(role) {
  const roleProjects = cvData.projects.filter(p => p.role_tags.includes(role)).slice(0, 3);
  
  let html = `<!-- PROJECTS -->
<div class="section">
  <div class="section-title">Projects</div>`;
  
  for (const proj of roleProjects) {
    const links = [];
    if (proj.url) links.push(`<a href="${proj.url}" class="proj-link">Website &#8599;</a>`);
    if (proj.github) links.push(`<a href="${proj.github}" class="proj-link">GitHub &#8599;</a>`);
    
    html += `
  <div class="proj-entry">
    <div class="proj-header">
      <span class="proj-name">${proj.name}</span>
      <span class="proj-date">${proj.date}</span>
    </div>
    <div class="proj-tech">${proj.tech}</div>
    <ul class="proj-bullets">`;
    
    for (const bullet of proj.bullets.slice(0, 3)) {
      html += `\n      <li>${bullet}</li>`;
    }
    
    html += `\n    </ul>`;
    if (links.length > 0) {
      html += `\n    <div style="font-size: 8.8pt; margin-top: 1px;">${links.join(' <span class="contact-sep">|</span> ')}</div>`;
    }
    html += `\n  </div>`;
  }
  
  html += `\n</div>`;
  return html;
}

function generateExperience(role) {
  const roleExp = cvData.experience.filter(e => e.tags.includes(role));
  
  let html = `<!-- EXPERIENCE -->
<div class="section">
  <div class="section-title">Experience</div>`;
  
  for (const exp of roleExp.slice(0, 2)) {
    html += `
  <div class="exp-entry">
    <div class="exp-header">
      <span class="exp-company">${exp.company}</span>
      <span class="exp-date">${exp.date}</span>
    </div>
    <div class="exp-role">${exp.role}</div>
    <ul class="exp-bullets">`;
    
    for (const bullet of exp.bullets) {
      html += `\n      <li>${bullet}</li>`;
    }
    
    html += `\n    </ul>\n  </div>`;
  }
  
  html += `\n</div>`;
  return html;
}

function generateCV(role) {
  const sectionOrder = cvData.role_section_order[role] || cvData.role_section_order.software;
  
  let body = '';
  for (const section of sectionOrder) {
    switch (section) {
      case 'profile':
        body += '\n' + generateProfile(role);
        break;
      case 'education':
        body += '\n' + generateEducation();
        break;
      case 'skills':
        body += '\n' + generateSkills(role);
        break;
      case 'projects':
        body += '\n' + generateProjects(role);
        break;
      case 'experience':
        body += '\n' + generateExperience(role);
        break;
    }
  }
  
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Isaac (Zac) Adjei - ${role.charAt(0).toUpperCase() + role.slice(1)} CV</title>
${CSS_STYLES}
</head>
<body>
${generateHeader()}
${body}
</body>
</html>`;
}

function generateMainCV() {
  const sectionOrder = ['profile', 'education', 'skills', 'projects', 'experience'];
  
  let body = '';
  for (const section of sectionOrder) {
    switch (section) {
      case 'profile':
        body += '\n' + generateProfile('software');
        break;
      case 'education':
        body += '\n' + generateEducation();
        break;
      case 'skills':
        body += '\n' + generateSkills('software');
        break;
      case 'projects':
        body += '\n' + generateProjects('software');
        break;
      case 'experience':
        body += '\n' + generateExperience('software');
        break;
    }
  }
  
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Isaac (Zac) Adjei - CV</title>
${CSS_STYLES}
</head>
<body>
${generateHeader()}
${body}
</body>
</html>`;
}

// Generate all CVs
const roles = ['software', 'embedded', 'data', 'devops', 'quant', 'security'];

console.log('Generating CVs from data/cv.yml...\n');

// Generate role-specific CVs
for (const role of roles) {
  const cv = generateCV(role);
  fs.writeFileSync(path.join(OUTPUT_DIR, `cv-${role}.html`), cv);
  console.log(`✓ Generated cv-${role}.html (${role} focus)`);
}

console.log('\nAll CVs generated successfully!');
console.log('Files written to: public/resume/');
