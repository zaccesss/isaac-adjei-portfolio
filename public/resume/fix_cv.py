import re

content = open('c:/dev/github/isaac-adjei-portfolio/public/resume/cv.html', 'r', encoding='utf-8').read()

# 1. Strip CSS blank lines
style_match = re.search(r'(<style>)([\s\S]*?)(</style>)', content)
if style_match:
    cleaned = re.sub(r'\n(\s*\n){2,}', '\n', style_match.group(2))
    content = content[:style_match.start()] + '<style>' + cleaned + '</style>' + content[style_match.end():]
    print("CSS cleaned")

# 2. Strip body blank lines
body_start = content.find('<body>')
if body_start > 0:
    head = content[:body_start]
    body = re.sub(r'\n(\s*\n){2,}', '\n', content[body_start:])
    content = head + body
    print("Body cleaned")

# Helper
def replace_once(content, old, new, label):
    if old in content:
        print(f"{label}: replaced")
        return content.replace(old, new, 1)
    print(f"{label}: NOT FOUND")
    return content

# 3. Remove Aston edu-bullets
content = replace_once(content,
    '        <ul class="edu-bullets">\n          <li>\n            Developing strong foundations in software engineering, electronics and applied\n            mathematics\n          </li>\n          <li>\n            Building practical project experience across embedded systems, AI/data and full-stack\n            development\n          </li>\n        </ul>',
    '', 'Aston bullets')

# 4. Remove Stanmore edu-bullets
content = replace_once(content,
    '        <ul class="edu-bullets">\n          <li>\n            Completed intensive hands-on training in engineering design, testing and technical\n            documentation\n          </li>\n          <li>\n            Applied microcontroller, electronics and CAD skills through practical coursework and\n            projects\n          </li>\n        </ul>',
    '', 'Stanmore bullets')

# 5. PHAEMOS 5->3 bullets
old = '        <ul class="proj-bullets">\n          <li>\n            End-to-end IoT platform: ESP32, Arduino and STM32 hardware nodes POST sensor telemetry\n            to a FastAPI backend with PostgreSQL and Redis, processed in <strong>under 200ms per request</strong>\n          </li>\n          <li>\n            Unsupervised Isolation Forest anomaly detection scores every telemetry reading; above\n            0.7 triggers an alert and auto-generates a maintenance ticket, above 0.85 attaches a\n            diagnostic recommendation\n          </li>\n          <li>\n            Next.js live dashboard polls every 5 seconds with Recharts line charts; anomalous\n            readings highlighted in real time\n          </li>\n          <li>\n            <strong>JWT auth with role-based access control</strong> (Admin, Technician, Viewer) enforced at API and\n            UI level with a full <strong>immutable audit log</strong>\n          </li>\n          <li>\n            Active build targeting an industry-scale predictive maintenance product; architecture\n            and API designed for production deployment from the outset\n          </li>\n        </ul>'
new = '        <ul class="proj-bullets">\n          <li>\n            End-to-end IoT platform: ESP32, Arduino and STM32 nodes POST telemetry to FastAPI\n            (PostgreSQL, Redis) in <strong>under 200ms</strong>; Next.js dashboard polls every 5s with live\n            Recharts charts and real-time anomaly highlighting\n          </li>\n          <li>\n            Unsupervised Isolation Forest scores every reading; above 0.7 triggers alert and\n            auto-generates a maintenance ticket, above 0.85 attaches a diagnostic recommendation\n          </li>\n          <li>\n            <strong>JWT auth with role-based access control</strong> (Admin, Technician, Viewer) at API and UI\n            level; full <strong>immutable audit log</strong>; targeting industry-scale deployment\n          </li>\n        </ul>'
content = replace_once(content, old, new, 'PHAEMOS 5->3')

# 6. NeoPixel 4->2 bullets
old = '        <ul class="proj-bullets">\n          <li>\n            Built a 64-LED interactive display with a <strong>non-blocking state machine architecture</strong> using\n            millis()\n          </li>\n          <li>\n            Implemented four animation modes, ambient-light adaptive brightness and debounced user\n            controls\n          </li>\n          <li>\n            Integrated diagnostics and electrical protection for reliable real-world operation\n          </li>\n          <li>\n            Designed to demonstrate scalable embedded system architecture and responsive real-time\n            control without blocking delays\n          </li>\n        </ul>'
new = '        <ul class="proj-bullets">\n          <li>\n            <strong>Non-blocking state machine architecture</strong>: four animation modes, LDR adaptive\n            brightness and debounced controls with serial diagnostics and electrical protection\n          </li>\n        </ul>'
content = replace_once(content, old, new, 'NeoPixel 4->1')

# 7. AstonCV 4->2 bullets
old = '        <ul class="proj-bullets">\n          <li>\n            Built a full-stack platform from scratch with no frameworks, including authentication\n            and CV management\n          </li>\n          <li>\n            Implemented <strong>11 security controls</strong> including <strong>bcrypt hashing, CSRF tokens, PDO prepared\n            statements and brute-force protection</strong>\n          </li>\n          <li>\n            <strong>Deployed live</strong> with searchable profiles, sorting/filtering and server-side PDF export\n          </li>\n          <li>\n            Engineered as a secure, scalable system applying real-world backend security practices\n            and deployment workflows\n          </li>\n        </ul>'
new = '        <ul class="proj-bullets">\n          <li>\n            Built from scratch with no frameworks; <strong>11 security controls</strong> including <strong>bcrypt,\n            CSRF tokens, PDO prepared statements and brute-force protection</strong>\n          </li>\n          <li>\n            <strong>Deployed live</strong> at Aston University with searchable profiles, filtering and\n            server-side PDF export\n          </li>\n        </ul>'
content = replace_once(content, old, new, 'AstonCV 4->2')

# 8. git-unlocked 3->2 bullets
old = '        <ul class="proj-bullets">\n          <li>\n            Created a structured learning resource with <strong>170+ topic files</strong> from fundamentals to\n            advanced workflows\n          </li>\n          <li>\n            Covered Git and major hosting platforms with practical cross-platform guidance for real\n            teams\n          </li>\n          <li>Maintained contributor workflow with issue templates, PR standards and CI checks</li>\n        </ul>'
new = '        <ul class="proj-bullets">\n          <li>\n            <strong>170+ topic files</strong> covering Git and all major platforms (GitHub, GitLab, Bitbucket,\n            Azure DevOps) with cross-platform guidance from fundamentals to advanced workflows\n          </li>\n          <li>Maintained open-source contributor workflow: issue templates, PR standards and CI</li>\n        </ul>'
content = replace_once(content, old, new, 'git-unlocked 3->2')

# 9. Combine two Ghana High Commission entries
old_ghana = ('      <div class="exp-entry">\n        <div class="exp-row1">\n'
    '          <span class="exp-title">Consular Intern</span>\n'
    '          <span class="exp-company">Ghana High Commission, London, UK</span>\n'
    '        </div>\n        <div class="exp-row2">\n'
    '          <span class="exp-tech">Consular operations, document processing, client support</span>\n'
    '          <span class="exp-date">Jul 2024 &ndash; Aug 2024</span>\n'
    '        </div>\n        <ul class="exp-bullets">\n          <li>\n'
    '            Managed passport and visa processing workflows, including document verification and\n'
    '            client-facing support\n          </li>\n          <li>\n'
    '            Implemented document verification and administrative coordination while improving\n'
    '            communication and public-service professionalism\n          </li>\n'
    '        </ul>\n      </div>\n\n      <div class="exp-entry">\n'
    '        <div class="exp-row1">\n'
    '          <span class="exp-title">Diplomatic Administrative &amp; Estates Intern</span>\n'
    '          <span class="exp-company">Ghana High Commission, London, UK</span>\n'
    '        </div>\n        <div class="exp-row2">\n'
    '          <span class="exp-tech"\n            >Facilities coordination, document handling, office operations</span\n          >\n'
    '          <span class="exp-date">Mar 2024</span>\n'
    '        </div>\n        <ul class="exp-bullets">\n          <li>\n'
    '            Managed administration section workflows including estates management, document handling\n'
    '            and general office operations\n          </li>\n          <li>\n'
    '            Implemented facilities coordination and internal logistics, strengthening professional\n'
    '            communication and organisational efficiency\n          </li>\n'
    '        </ul>\n      </div>')
new_ghana = ('      <div class="exp-entry">\n        <div class="exp-row1">\n'
    '          <span class="exp-title">Consular &amp; Administrative Intern</span>\n'
    '          <span class="exp-company">Ghana High Commission, London, UK</span>\n'
    '        </div>\n        <div class="exp-row2">\n'
    '          <span class="exp-tech">Consular operations, document processing, facilities coordination</span>\n'
    '          <span class="exp-date">Mar 2024 &ndash; Aug 2024</span>\n'
    '        </div>\n        <ul class="exp-bullets">\n          <li>\n'
    '            Managed passport and visa processing, document verification and client-facing\n'
    '            support across consular and administrative departments\n'
    '          </li>\n        </ul>\n      </div>')
content = replace_once(content, old_ghana, new_ghana, 'Ghana combined')

# 10. Cancer Research 3->1 bullet
old_cancer = ('        <ul class="vol-bullets">\n          <li>\n'
    '            Participated in the Cancer Research UK 10 Days of 5K Challenge and completed 10 x 5km\n'
    '            runs (more than 50km total) across March, demonstrating consistency and discipline\n'
    '          </li>\n          <li>\n'
    '            Set up and managed an online fundraising page, contributing to a wider campaign that\n'
    '            raised over &pound;797,424.64, with an additional &pound;159,224.14 through Gift Aid\n'
    '          </li>\n          <li>\n'
    '            Raised funds through outreach and personal network engagement while promoting awareness\n'
    '            of cancer research initiatives\n          </li>\n        </ul>')
new_cancer = ('        <ul class="vol-bullets">\n          <li>\n'
    '            Completed 10 x 5km (50km+) for Cancer Research UK; managed fundraising page\n'
    '            contributing to a campaign that raised over &pound;797,000\n'
    '          </li>\n        </ul>')
content = replace_once(content, old_cancer, new_cancer, 'Cancer Research 3->1')

open('c:/dev/github/isaac-adjei-portfolio/public/resume/cv.html', 'w', encoding='utf-8').write(content)
print("\nSaved.")
