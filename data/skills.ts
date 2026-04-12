const DEV = "https://cdn.jsdelivr.net/gh/devicons/devicon/icons"

export interface Skill {
  name: string
  icon?: string
}

export interface SkillCategory {
  category: string
  columns: number   // icons per row on desktop
  skills: Skill[]
}

export const skillCategories: SkillCategory[] = [
  // --- Languages & Software (README row: 8 cols + TypeScript = 9 → 5+4) ---
  {
    category: "Languages & Software",
    columns: 5,
    skills: [
      { name: "C",          icon: `${DEV}/c/c-original.svg` },
      { name: "C++",        icon: "https://techstack-generator.vercel.app/cpp-icon.svg" },
      { name: "Python",     icon: "https://techstack-generator.vercel.app/python-icon.svg" },
      { name: "Java",       icon: "https://techstack-generator.vercel.app/java-icon.svg" },
      { name: "TypeScript", icon: `${DEV}/typescript/typescript-original.svg` },
      { name: "JavaScript", icon: "https://techstack-generator.vercel.app/js-icon.svg" },
      { name: "HTML",       icon: `${DEV}/html5/html5-original.svg` },
      { name: "CSS",        icon: `${DEV}/css3/css3-original.svg` },
      { name: "MATLAB",     icon: `${DEV}/matlab/matlab-original.svg` },
    ],
  },

  // --- Core Tools (README: 6 cols) ---
  {
    category: "Core Tools",
    columns: 6,
    skills: [
      { name: "Git",     icon: `${DEV}/git/git-original.svg` },
      { name: "GitHub",  icon: "https://techstack-generator.vercel.app/github-icon.svg" },
      { name: "VS Code", icon: `${DEV}/vscode/vscode-original.svg` },
      { name: "Eclipse", icon: `${DEV}/eclipse/eclipse-original.svg` },
      { name: "Postman", icon: `${DEV}/postman/postman-original.svg` },
      { name: "Gradle",  icon: `${DEV}/gradle/gradle-original.svg` },
    ],
  },

  // --- JetBrains Ecosystem (README: 5+4+2 across sub-tables → 5 cols gives 5+4) ---
  {
    category: "JetBrains Ecosystem",
    columns: 5,
    skills: [
      { name: "JetBrains",  icon: "https://resources.jetbrains.com/storage/products/company/brand/logos/jb_beam.svg" },
      { name: "IntelliJ",   icon: `${DEV}/intellij/intellij-original.svg` },
      { name: "PyCharm",    icon: `${DEV}/pycharm/pycharm-original.svg` },
      { name: "CLion",      icon: `${DEV}/clion/clion-original.svg` },
      { name: "WebStorm",   icon: `${DEV}/webstorm/webstorm-original.svg` },
      { name: "DataGrip",   icon: `${DEV}/datagrip/datagrip-original.svg` },
      { name: "PhpStorm",   icon: `${DEV}/phpstorm/phpstorm-original.svg` },
      { name: "RubyMine",   icon: `${DEV}/rubymine/rubymine-original.svg` },
      { name: "GoLand",     icon: `${DEV}/goland/goland-original.svg` },
    ],
  },

  // --- Mobile (README: 2 cols) ---
  {
    category: "Mobile & Languages",
    columns: 2,
    skills: [
      { name: "Android Studio", icon: `${DEV}/androidstudio/androidstudio-original.svg` },
      { name: "Kotlin",         icon: `${DEV}/kotlin/kotlin-original.svg` },
    ],
  },

  // --- AI/ML & Data (README: 6+3) ---
  {
    category: "AI / ML & Data",
    columns: 6,
    skills: [
      { name: "TensorFlow",   icon: `${DEV}/tensorflow/tensorflow-original.svg` },
      { name: "PyTorch",      icon: `${DEV}/pytorch/pytorch-original.svg` },
      { name: "NumPy",        icon: `${DEV}/numpy/numpy-original.svg` },
      { name: "Pandas",       icon: `${DEV}/pandas/pandas-original.svg` },
      { name: "Scikit-Learn", icon: "https://upload.wikimedia.org/wikipedia/commons/0/05/Scikit_learn_logo_small.svg" },
      { name: "Jupyter",      icon: `${DEV}/jupyter/jupyter-original.svg` },
      { name: "OpenCV",       icon: `${DEV}/opencv/opencv-original.svg` },
      { name: "Matplotlib",   icon: "https://upload.wikimedia.org/wikipedia/commons/8/84/Matplotlib_icon.svg" },
      { name: "CUDA",         icon: "https://www.svgrepo.com/download/373541/cuda.svg" },
    ],
  },

  // --- Web: Frontend (README: 3 cols) ---
  {
    category: "Frontend",
    columns: 3,
    skills: [
      { name: "Next.js",      icon: `${DEV}/nextjs/nextjs-original.svg` },
      { name: "React",        icon: "https://techstack-generator.vercel.app/react-icon.svg" },
      { name: "Tailwind CSS", icon: `${DEV}/tailwindcss/tailwindcss-original.svg` },
      { name: "Bootstrap",    icon: `${DEV}/bootstrap/bootstrap-original.svg` },
    ],
  },

  // --- Web: Backend (README: 7 cols + WordPress = 8 → 4+4) ---
  {
    category: "Backend",
    columns: 4,
    skills: [
      { name: "Node.js",    icon: `${DEV}/nodejs/nodejs-original.svg` },
      { name: "Express",    icon: `${DEV}/express/express-original.svg` },
      { name: "Django",     icon: `${DEV}/django/django-plain.svg` },
      { name: "Flask",      icon: `${DEV}/flask/flask-original.svg` },
      { name: "PHP",        icon: `${DEV}/php/php-original.svg` },
      { name: "WordPress",  icon: `${DEV}/wordpress/wordpress-original.svg` },
      { name: "Apache",     icon: `${DEV}/apache/apache-original.svg` },
      { name: "Composer",   icon: `${DEV}/composer/composer-original.svg` },
    ],
  },

  // --- Databases (README: 4 cols) ---
  {
    category: "Databases",
    columns: 4,
    skills: [
      { name: "MySQL",      icon: "https://techstack-generator.vercel.app/mysql-icon.svg" },
      { name: "PostgreSQL", icon: `${DEV}/postgresql/postgresql-original.svg` },
      { name: "MongoDB",    icon: `${DEV}/mongodb/mongodb-original.svg` },
      { name: "Firebase",   icon: `${DEV}/firebase/firebase-plain.svg` },
    ],
  },

  // --- Cloud & DevOps (README: 6 cols) ---
  {
    category: "Cloud & DevOps",
    columns: 6,
    skills: [
      { name: "AWS",            icon: "https://techstack-generator.vercel.app/aws-icon.svg" },
      { name: "Azure",          icon: `${DEV}/azure/azure-original.svg` },
      { name: "Google Cloud",   icon: `${DEV}/googlecloud/googlecloud-original.svg` },
      { name: "Docker",         icon: "https://techstack-generator.vercel.app/docker-icon.svg" },
      { name: "Kubernetes",     icon: "https://techstack-generator.vercel.app/kubernetes-icon.svg" },
      { name: "GitHub Actions", icon: `${DEV}/githubactions/githubactions-original.svg` },
    ],
  },

  // --- Cyber Security (README: 6 cols) ---
  {
    category: "Cyber Security",
    columns: 6,
    skills: [
      { name: "Bash",       icon: `${DEV}/bash/bash-original.svg` },
      { name: "Linux",      icon: `${DEV}/linux/linux-original.svg` },
      { name: "Kali Linux", icon: "https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/kalilinux.svg" },
      { name: "PowerShell", icon: "https://upload.wikimedia.org/wikipedia/commons/2/2f/PowerShell_5.0_icon.png" },
      { name: "Wireshark",  icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Wireshark_icon.svg/200px-Wireshark_icon.svg.png" },
      { name: "Nmap",       icon: "https://nmap.org/images/nmap-logo-256x256.png" },
    ],
  },

  // --- Embedded & Hardware (README: 6+4) ---
  {
    category: "Embedded & Hardware",
    columns: 6,
    skills: [
      { name: "Arduino",      icon: `${DEV}/arduino/arduino-original.svg` },
      { name: "Raspberry Pi", icon: `${DEV}/raspberrypi/raspberrypi-original.svg` },
      { name: "Embedded C",   icon: `${DEV}/embeddedc/embeddedc-original.svg` },
      { name: "KiCad",        icon: "https://upload.wikimedia.org/wikipedia/commons/5/59/KiCad-Logo.svg" },
      { name: "Eagle",        icon: "https://www.svgrepo.com/download/436018/eagle.svg" },
      { name: "Proteus",      icon: "https://upload.wikimedia.org/wikipedia/commons/4/4f/ProteusLogo.svg" },
      { name: "SolidWorks",   icon: "https://upload.wikimedia.org/wikipedia/en/d/d2/SolidWorks_Logo.svg" },
      { name: "Simulink",     icon: "https://upload.wikimedia.org/wikipedia/commons/3/36/Simulink_Logo_%28non-wordmark%29.png" },
      { name: "Fusion 360",   icon: "https://seeklogo.com/images/A/autodesk-fusion-360-logo-7F72A76397-seeklogo.com.png" },
      { name: "AutoCAD",      icon: "https://seeklogo.com/images/A/autocad-logo-C9817CB828-seeklogo.com.png" },
    ],
  },

  // --- Robotics (README: 4 cols) ---
  {
    category: "Robotics",
    columns: 4,
    skills: [
      { name: "ROS",           icon: `${DEV}/ros/ros-original.svg` },
      { name: "NVIDIA Jetson", icon: "https://www.svgrepo.com/download/373541/cuda.svg" },
      { name: "Gazebo",        icon: `${DEV}/gazebo/gazebo-original.svg` },
      { name: "PyBullet",      icon: "https://raw.githubusercontent.com/bulletphysics/bullet3/master/docs/pybullet_logo.png" },
    ],
  },

  // --- Gaming Ecosystem (README: 5+4) ---
  {
    category: "Gaming Ecosystem",
    columns: 5,
    skills: [
      { name: "Unity",         icon: `${DEV}/unity/unity-original.svg` },
      { name: "Unreal Engine", icon: `${DEV}/unrealengine/unrealengine-original.svg` },
      { name: "NVIDIA",        icon: "https://www.svgrepo.com/download/373541/cuda.svg" },
      { name: "Intel",         icon: "https://upload.wikimedia.org/wikipedia/commons/8/85/Intel_logo_2023.svg" },
      { name: "AMD",           icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/AMD_Logo.svg/200px-AMD_Logo.svg.png" },
      { name: "Steam",         icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Steam_icon_logo.svg/200px-Steam_icon_logo.svg.png" },
      { name: "PlayStation",   icon: "https://www.svgrepo.com/download/452087/playstation.svg" },
      { name: "EA",            icon: "https://www.svgrepo.com/download/330343/ea.svg" },
      { name: "Ubisoft",       icon: "https://www.svgrepo.com/download/349545/ubisoft.svg" },
    ],
  },

  // --- Creative & Productivity (README: 5+4) ---
  {
    category: "Creative & Productivity",
    columns: 5,
    skills: [
      { name: "Photoshop",    icon: "https://cdn.worldvectorlogo.com/logos/adobe-photoshop-2.svg" },
      { name: "Illustrator",  icon: `${DEV}/illustrator/illustrator-plain.svg` },
      { name: "After Effects",icon: "https://cdn.worldvectorlogo.com/logos/after-effects-1.svg" },
      { name: "Premiere Pro", icon: `${DEV}/premierepro/premierepro-original.svg` },
      { name: "Blender",      icon: `${DEV}/blender/blender-original.svg` },
      { name: "Figma",        icon: `${DEV}/figma/figma-original.svg` },
      { name: "Canva",        icon: `${DEV}/canva/canva-original.svg` },
      { name: "Notion",       icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Notion-logo.svg/200px-Notion-logo.svg.png" },
      { name: "Obsidian",     icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/2023_Obsidian_logo.svg/200px-2023_Obsidian_logo.svg.png" },
    ],
  },
]
