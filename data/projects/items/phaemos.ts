import type { Project } from "../index"

const _phaemos: Project = {
    id: "phaemos",
    title: "PHAEMOS - Smart Maintenance Platform",
    description:
      "End-to-end IoT and predictive maintenance platform - four hardware nodes, FastAPI backend, Isolation Forest anomaly detection, Next.js live dashboard with alert and ticket workflows, actively being built",
    longDescription:
      "Machines fail. Not suddenly - gradually, silently, invisibly. PHAEMOS exists to reveal what machines cannot say about themselves.\n\nPHAEMOS (pronounced FAY-mos - coined from Ancient Greek phaen, to reveal and mos, system or order) is a full-stack IoT and predictive maintenance platform built from hardware up. It collects real-time sensor data from four hardware nodes, ingests it through a FastAPI backend, scores every reading with a machine learning anomaly detection model and surfaces everything on a live Next.js dashboard with alert management and an automated maintenance ticket workflow.\n\nThe updated hardware architecture uses four nodes: an ESP32 as the primary IoT gateway consolidating 11 sensors (BME280 for temperature, humidity and pressure; MPU6050 for vibration; INA219 for current and voltage monitoring; MLX90614 for contactless IR surface temperature; VL53L0X for distance; MQ-2 for gas and smoke; AS5600 for shaft RPM via magnetic encoding; DS18B20 for contact temperature; MAX4466 microphone; LDR for ambient light; FC-28 for water ingress detection) and driving a SSD1306 OLED, WS2812B RGB LED strip, passive buzzer and 4-channel relay module. The STM32 Black Pill F411CEU6 samples an MPU6050 at 100Hz via I2C, computes a short-window FFT in HAL C and transmits peak vibration frequency over UART. An Arduino Nano reads a secondary BME280, LDR and FC-28 and relays formatted serial strings. A Raspberry Pi Pico 2W running MicroPython reads a BME280 and LDR, displays locally on an OLED and POSTs ambient telemetry independently over Wi-Fi.\n\nThe backend is a FastAPI application in Python 3.11 backed by PostgreSQL 15 and Redis. On every incoming telemetry POST it validates the device API key, stores the reading across a 25-field telemetry schema, evaluates all alert rules, scores the reading through the ML model and returns a 200 response in under 200ms. Every significant action is written to an immutable audit log. JWT authentication with bcrypt hashing enforces Admin, Technician and Viewer roles at both API route and UI level.\n\nThe ML pipeline is a scikit-learn Isolation Forest - unsupervised, requiring no labelled fault data. It learns the normal operating envelope and scores each reading from 0 to 1. Scores above 0.7 trigger an alert and auto-generate a maintenance ticket. Scores above 0.85 attach a diagnostic recommendation. Features include raw readings, rolling means and standard deviations across all sensor channels, vibration magnitude and time-of-day encoding.\n\nThe Next.js frontend polls the API every 5 seconds with live Recharts charts per sensor metric, anomalous readings highlighted red and device cards showing current status. The full stack runs with Docker Compose and deploys to Vercel (frontend) and Render (backend and database).",
    technologies: [
      "Next.js",
      "TypeScript",
      "FastAPI",
      "Python",
      "MicroPython",
      "PostgreSQL",
      "Redis",
      "scikit-learn",
      "Docker",
      "ESP32",
      "STM32",
      "Arduino Nano",
      "Raspberry Pi Pico",
      "Recharts",
      "Tailwind CSS",
      "Vercel",
    ],
    category: "iot",
    featured: true,
    images: [
      "/images/projects/phaemos/dashboard.svg",
      "/images/projects/phaemos/main.svg",
      "/images/projects/phaemos/pipeline.svg",
    ],
    github: "https://github.com/zaccesss/phaemos",
    demo: "https://phaemos.com",
    date: "2025 - Present",
    highlights: [
      "Four hardware nodes: ESP32 primary (11 sensors), STM32 Black Pill (100Hz FFT vibration), Arduino Nano (secondary BME280/moisture) and Raspberry Pi Pico 2W (MicroPython ambient node)",
      "FastAPI backend processes every telemetry POST in under 200ms - validate, store across 25-field schema, evaluate alert rules, score ML model and respond",
      "Isolation Forest ML: unsupervised anomaly detection - score above 0.7 triggers alert and auto-generates ticket, above 0.85 attaches diagnostic recommendation",
      "STM32 samples MPU6050 at 100Hz in HAL C and computes FFT per second, giving the ML model a richer vibration signal than raw acceleration values",
      "Next.js live dashboard: Recharts charts polling every 5 seconds, anomalous readings highlighted red, device status cards, role-gated views",
      "Full Docker Compose stack - Vercel (frontend), Render (backend and database), JWT auth with RBAC across Admin, Technician and Viewer roles",
    ],
  }

export default _phaemos
