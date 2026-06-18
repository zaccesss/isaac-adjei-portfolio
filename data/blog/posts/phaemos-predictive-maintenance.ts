import type { BlogPost } from "../index"

const _phaemos_predictive_maintenance: BlogPost = {
    slug: "phaemos-predictive-maintenance",
    title: "Phaemos: Building a Predictive Maintenance Platform from Firmware to Dashboard",
    date: "2026-05-14",
    type: "blog",
    projectSlug: "phaemos",
    cover_image: "/images/projects/phaemos/main.svg",
    description:
      "How I am building Phaemos - a full-stack predictive maintenance platform with four hardware nodes (ESP32, STM32 Black Pill, Arduino Nano, Raspberry Pi Pico 2W), 11 sensors, a FastAPI backend, Isolation Forest ML and a live Next.js dashboard.",
    tags: ["FastAPI", "Next.js", "ESP32", "STM32", "ML", "IoT", "Python", "MicroPython"],
    published: true,
    content: [
      {
        type: "p",
        text: "[Phaemos](/projects/phaemos) is a smart maintenance platform I am actively building. The name comes from Ancient Greek roots meaning an ordered system that reveals. The tagline is: reveal before failure. That is exactly what it does: collects real-time sensor data from hardware nodes, scores every reading with a machine learning model and raises alerts before a fault becomes visible to the naked eye.",
      },
      {
        type: "h2",
        text: "Why Predictive Maintenance?",
      },
      {
        type: "p",
        text: "Industrial equipment fails. The question is whether you find out before or after it does. Reactive maintenance waits for failure then repairs. Preventive maintenance follows a fixed schedule, replacing parts whether or not they actually need replacing. Predictive maintenance uses real sensor data to intervene only when the data suggests something is genuinely wrong.",
      },
      {
        type: "p",
        text: "The third approach is more efficient, less expensive and far more interesting to build. It requires sensors, connectivity, a reliable data pipeline, a machine learning model and a usable interface for the people who act on the alerts. Phaemos is all of that.",
      },
      {
        type: "h2",
        text: "Hardware Layer",
      },
      {
        type: "p",
        text: "The updated hardware architecture uses four nodes. The ESP32 is the primary IoT gateway, consolidating 11 sensors over I2C and analogue inputs and POSTing consolidated JSON telemetry to the backend every 5 seconds. The sensors include BME280 (temperature, humidity, pressure), MPU6050 (vibration and acceleration), INA219 (current and voltage monitoring), MLX90614 (contactless IR surface temperature), VL53L0X (distance), MQ-2 (gas and smoke detection), AS5600 (shaft RPM via magnetic encoding), DS18B20 (contact temperature), MAX4466 (microphone/acoustic level), LDR (ambient light) and FC-28 (water ingress detection). Output components on the ESP32 include a SSD1306 OLED, WS2812B RGB LED strip, passive buzzer and a 4-channel relay module for triggering external actuators.",
      },
      {
        type: "p",
        text: "The STM32 Black Pill F411CEU6 is the vibration specialist node. It samples an MPU6050 at 100Hz over I2C in bare HAL C, accumulates one second of acceleration data, runs a short-window FFT and transmits the peak vibration frequency and magnitude over UART to the ESP32. Rather than sending raw acceleration values, the single peak frequency gives the ML model a far richer vibration signal - bearing wear, imbalance and cavitation produce characteristic resonant frequencies that raw acceleration cannot distinguish.",
      },
      {
        type: "p",
        text: "The Arduino Nano is the secondary sensor node. It reads a BME280, LDR and FC-28 moisture sensor and relays formatted CSV strings to the ESP32 over serial every 2 seconds. The Raspberry Pi Pico 2W is the ambient node, running MicroPython. It reads a BME280 and LDR, displays locally on a SSD1306 OLED and POSTs its own telemetry payload to the API independently over Wi-Fi, operating completely standalone from the ESP32.",
      },
      {
        type: "h2",
        text: "Backend: FastAPI and PostgreSQL",
      },
      {
        type: "p",
        text: "The backend is a [FastAPI](https://fastapi.tiangolo.com) application in Python 3.11, backed by PostgreSQL 15 and Redis. On every incoming telemetry POST it: validates the device API key, stores the reading, evaluates all alert rules for that device, scores the reading through the ML model, updates the device status and last-seen timestamp and returns a 200 response. The target is under 200ms end to end.",
      },
      {
        type: "p",
        text: "Every significant action writes to an immutable audit log: who triggered it, when, what changed. The API uses JWT authentication with bcrypt password hashing and three role levels: admin (full access), technician (can create and update tickets) and viewer (read only). Role enforcement happens at both the API route level and the frontend route level so neither side trusts the other alone.",
      },
      {
        type: "h2",
        text: "The ML Pipeline: Isolation Forest",
      },
      {
        type: "p",
        text: "The anomaly detection model is a scikit-learn Isolation Forest. It is unsupervised: it needs no labelled fault data to train. It learns the normal operating envelope from real baseline telemetry and scores each new reading from 0 to 1. Scores above 0.7 trigger an alert and auto-generate a maintenance ticket. Scores above 0.85 attach a diagnostic recommendation string to that ticket.",
      },
      {
        type: "p",
        text: "The feature vector for each reading includes raw sensor values, rolling means and standard deviations over the last 10 readings, total vibration magnitude and time-of-day encoding. The rolling statistics are critical: a single spike is noise, but a sustained drift in the rolling mean for temperature or vibration frequency is a genuine signal. Time-of-day encoding captures the fact that thermal behaviour differs significantly between startup, steady state and shutdown.",
      },
      {
        type: "h2",
        text: "Frontend: Next.js Live Dashboard",
      },
      {
        type: "p",
        text: "The Next.js frontend polls the API every 5 seconds and renders live Recharts line charts for each sensor metric. Anomalous readings are highlighted red on the chart in real time as they arrive. Device cards show current status (online, warning, fault, offline) with colour coding. The ticket system lets technicians acknowledge alerts, add notes, update status and close resolved issues. All views are role-gated at the UI level.",
      },
      {
        type: "h2",
        text: "Infrastructure and Security",
      },
      {
        type: "p",
        text: "The full stack runs with Docker Compose locally and deploys to [Vercel](https://vercel.com) (frontend) and Render (backend and database). The CHANGELOG tracks every version: what was added, what changed, what security issue was addressed. The most recent unreleased version added GitHub Actions CI (backend linting and frontend type-checking), gitleaks secret scanning, Dependabot for automated dependency updates and a biweekly workflow that opens a security issue automatically if npm audit reports production vulnerabilities.",
      },
      {
        type: "h2",
        text: "What Building This Taught Me",
      },
      {
        type: "p",
        text: "The interesting problems were all at the boundaries. Making the ESP32 reliably deliver data over Wi-Fi under noisy conditions. Ensuring the FastAPI ingest endpoint handled concurrent posts without dropping readings. Keeping the Next.js dashboard live without hammering the backend. Designing the feature vector so the Isolation Forest actually learned useful patterns rather than memorising noise.",
      },
      {
        type: "p",
        text: "Building a system that spans embedded firmware, a REST API, a machine learning pipeline and a production frontend taught me more than any single-layer project could. Each layer has its own failure modes and its own debugging tools. Getting them to work together reliably is a different class of problem from getting any one of them to work in isolation.",
      },
      {
        type: "quote",
        text: "The most expensive sensor is the one you did not install before the machine failed.",
        source: "Predictive maintenance principle",
      },
      {
        type: "h2",
        text: "References",
      },
      {
        type: "ol-links",
        items: [
          { text: "Phaemos project page - full hardware and software overview", url: "/projects/phaemos" },
          { text: "FastAPI documentation - the Python framework powering the Phaemos backend", url: "https://fastapi.tiangolo.com" },
          { text: "scikit-learn: IsolationForest - API reference and algorithm details", url: "https://scikit-learn.org/stable/modules/generated/sklearn.ensemble.IsolationForest.html" },
          { text: "MQTT specification - the messaging protocol designed for IoT sensor networks", url: "https://mqtt.org/mqtt-specification/" },
          { text: "Wikipedia: Predictive maintenance - background, methods and industry applications", url: "https://en.wikipedia.org/wiki/Predictive_maintenance" },
          { text: "FreeRTOS - the RTOS kernel used on the STM32 vibration node", url: "https://www.freertos.org" },
          { text: "Wikipedia: Isolation forest - explanation of the anomaly detection algorithm", url: "https://en.wikipedia.org/wiki/Isolation_forest" },
        ],
      },
    ],
  }

export default _phaemos_predictive_maintenance
