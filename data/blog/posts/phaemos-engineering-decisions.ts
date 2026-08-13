import type { BlogPost } from "../index"

const _phaemos_engineering_decisions: BlogPost = {
    slug: "phaemos-engineering-decisions",
    title: "PHAEMOS: Engineering Decisions from Breadboard to Distributed IoT System",
    date: "2026-07-27",
    type: "journal",
    cover_image: "/images/blog/covers/phaemos-engineering-decisions.webp",
    description:
      "A case study in the decisions behind PHAEMOS - a multi-node environmental monitoring system. Why these hardware platforms, why this software stack and what I would do differently now.",
    tags: ["PHAEMOS", "IoT", "Embedded", "Python", "Full-Stack"],
    published: true,
    content: [
      {
        type: "p",
        text: "[PHAEMOS](/projects/phaemos) started as a single ESP32 on a breadboard connected to a DHT22 temperature sensor, sending readings to a terminal over UART. It is now a multi-node system with hardware nodes based on ESP32, STM32, Arduino Nano and Raspberry Pi Pico 2W, a [FastAPI](https://fastapi.tiangolo.com) backend with sub-200ms response times, JWT role-based access control, an Isolation Forest anomaly detection model and a Next.js dashboard. The gap between those two states required a lot of decisions. Most of them I got roughly right the first time. Some I got wrong.",
      },
      {
        type: "h2",
        text: "Why Four Different Microcontrollers",
      },
      {
        type: "p",
        text: "The natural question is: why not pick one platform and standardise on it? The answer is that each node has a different job. The ESP32 nodes are the primary connectivity nodes: they have WiFi built in, enough RAM to hold a TLS session and enough processing power to do some local filtering before transmitting. They are the obvious choice for anything that needs to talk to the internet directly.",
      },
      {
        type: "p",
        text: "The STM32 nodes handle situations where timing precision and real-time behaviour matter more than connectivity. The STM32F103 can run a PID controller at 10kHz without breaking a sweat while simultaneously handling three UART peripherals via DMA. An ESP32 can do this too, but the ESP32's [FreeRTOS](https://www.freertos.org) scheduler and WiFi stack add latency variance that is unacceptable for some control loops. The STM32 runs bare-metal or RTOS depending on the node's requirements.",
      },
      {
        type: "p",
        text: "The Arduino Nano nodes are for prototyping new sensor integrations. The Nano's 5V tolerance and the wide library support make it the fastest path from 'I have this sensor' to 'I have data'. Once a sensor integration is working on a Nano and the communication protocol is understood, it gets ported to whichever production platform is appropriate. The Nano nodes are never permanent - they are scaffolding.",
      },
      {
        type: "p",
        text: "The Raspberry Pi Pico 2W is the newest addition. The RP2350's dual-core architecture with one ARM Cortex-M33 core and one RISC-V Hazard3 core is interesting for workloads that benefit from parallelism: one core handles sensor sampling, the other handles WiFi communication and because they are on separate cores (not using a scheduler), there is no preemption latency between them. MicroPython makes it fast to iterate.",
      },
      {
        type: "h2",
        text: "The Backend Choice: FastAPI",
      },
      {
        type: "p",
        text: "The backend is [FastAPI](https://fastapi.tiangolo.com) with PostgreSQL (via [Supabase](https://supabase.com)) and Redis for caching. I chose FastAPI over Express or a Go HTTP server because the team (at the time, me and one other person) was more productive in Python and FastAPI's automatic OpenAPI documentation meant the API spec was always up to date. The async nature of FastAPI means sensor data ingestion endpoints can handle concurrent posts from multiple nodes without thread-blocking.",
      },
      {
        type: "p",
        text: "The sub-200ms response time target comes from the dashboard's requirement to feel live. The actual sensor data latency from node to dashboard is: sensor samples every 5 seconds → node transmits to FastAPI → FastAPI writes to PostgreSQL and invalidates Redis cache → dashboard polls API route → Next.js API route reads from Redis → response. The bottleneck is PostgreSQL write latency, which averages 40-60ms on the Supabase shared tier.",
      },
      {
        type: "h2",
        text: "Anomaly Detection with Isolation Forest",
      },
      {
        type: "p",
        text: "The Isolation Forest model detects anomalous sensor readings. Isolation Forest is an unsupervised algorithm: you train it on normal data and it learns to identify readings that are unusual relative to that baseline. It works by randomly partitioning the feature space with split trees - anomalous points are isolated near the root of the tree with few splits, while normal points require more splits to isolate. The anomaly score is the average depth across many trees.",
      },
      {
        type: "p",
        text: "I chose Isolation Forest over simpler threshold-based anomaly detection because the sensor readings are correlated. A temperature of 35°C is not anomalous in summer but is anomalous at 2am in January. Isolation Forest takes all 25 features (temperature, humidity, pressure, light, gas concentration and derived features like rolling mean and rolling standard deviation over 1-hour and 24-hour windows) into account simultaneously. A threshold approach would need 25 separately tuned thresholds and would miss cross-feature correlations.",
      },
      {
        type: "h2",
        text: "What I Got Wrong",
      },
      {
        type: "p",
        text: "The first version of the communication protocol between nodes and the backend was a flat JSON object with no versioning. When I added new sensor fields, every existing node started sending incomplete objects and the backend rejected them. The fix was adding a protocol version field and making the backend tolerant of missing fields for older protocol versions. I should have built this in from the start.",
      },
      {
        type: "p",
        text: "The Docker Compose deployment was also an afterthought. The initial development setup was three terminal windows running separate processes. Moving to Compose required restructuring the service dependencies and adding proper health checks. Had I written the Compose file first and developed against it, the production deployment would have been cleaner. Infrastructure should be defined before it is needed, not after.",
      },
      {
        type: "p",
        text: "The JWT RBAC implementation required three revisions. The first version put all permissions in the JWT payload, which meant revoking a token required invalidating every issued JWT - stateless JWTs do not support revocation without a token blocklist. The second version added a Redis blocklist but the cache invalidation was buggy. The third version separated authentication (JWT) from authorisation (database lookup per request), which is slower but correct. Security is one place where 'fast but wrong' has real consequences.",
      },
      {
        type: "h2",
        text: "What I Would Do Differently",
      },
      {
        type: "ul",
        items: [
          "Start with a well-defined data schema for sensor payloads and version it from day one",
          "Write the Docker Compose file before writing any service code - it forces you to think about service boundaries",
          "Use MQTT instead of HTTP POST for node-to-backend communication - MQTT's QoS levels and retained messages are designed exactly for this use case",
          "Consider InfluxDB or TimescaleDB instead of PostgreSQL for time-series data - the query patterns for sensor data (recent N readings, aggregates over time windows) are much faster on a time-series database",
          "Automate the model retraining pipeline from the start - manually re-running the Isolation Forest notebook when data distribution shifts is a recurring manual step that should not be manual",
        ],
      },
      {
        type: "h2",
        text: "References and Related",
      },
      {
        type: "ol-links",
        items: [
          { text: "FreeRTOS - the kernel used on the STM32 node in Phaemos", url: "https://www.freertos.org" },
          { text: "scikit-learn: IsolationForest - the anomaly detection algorithm used in Phaemos", url: "https://scikit-learn.org/stable/modules/generated/sklearn.ensemble.IsolationForest.html" },
          { text: "FastAPI documentation - the Python framework powering the Phaemos backend", url: "https://fastapi.tiangolo.com" },
          { text: "MQTT specification - the protocol used for node-to-backend communication", url: "https://mqtt.org/mqtt-specification/" },
          { text: "Designing Data-Intensive Applications - Kleppmann - informed the backend architecture decisions", url: "https://dataintensive.net/" },
          { text: "Docker documentation - Compose file reference", url: "https://docs.docker.com/compose/" },
          { text: "TimescaleDB - time-series PostgreSQL extension (considered as alternative data store)", url: "https://docs.timescale.com/" },
        ],
      },
    ],
  }

export default _phaemos_engineering_decisions
