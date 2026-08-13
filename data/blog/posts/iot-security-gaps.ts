import type { BlogPost } from "../index"

const _iot_security_gaps: BlogPost = {
    slug: "iot-security-gaps",
    title: "Security Gaps in Consumer IoT: A Survey of Common Attack Vectors",
    date: "2025-11-30",
    type: "research",
    cover_image: "/images/blog/covers/iot-security-gaps.webp",
    description:
      "A technical review of the most common vulnerabilities in consumer IoT devices: hardcoded credentials, unencrypted traffic, insufficient update mechanisms and insecure interfaces, with reference to real incidents, CVEs and regulatory standards.",
    tags: ["IoT", "Security", "Research", "Embedded", "Networking"],
    published: true,
    content: [
      {
        type: "p",
        text: "The Internet of Things (IoT) refers to the billions of physical devices connected to the internet: smart speakers, thermostats, security cameras, industrial sensors and medical monitors, all sending and receiving data without direct human interaction. Consumer IoT devices are everywhere and most of them are insecure by design. In 2022 there were over 14 billion connected IoT devices globally, a number that will exceed 25 billion by 2030 according to Statista. Each of those devices is a potential entry point. The security research community has documented the same categories of vulnerability repeatedly for a decade. The problems persist not because they are hard to fix but because market incentives do not reward fixing them.",
      },
      {
        type: "p",
        text: "This post surveys the most common vulnerability classes in consumer IoT, with reference to real incidents and concrete examples. It is not a penetration testing guide. It is a record of what goes wrong, why it keeps going wrong and what the engineering looks like when it is done correctly.",
      },
      {
        type: "h2",
        text: "Hardcoded Credentials",
      },
      {
        type: "p",
        text: "The most common and embarrassing vulnerability in consumer IoT is the hardcoded default credential. A router, IP camera or smart plug ships with a default username and password that is identical across every unit of that model. The Mirai botnet, discovered in 2016, exploited exactly this. It scanned the public IPv4 address space for Telnet on port 23, attempted login with 61 known default username-password pairs compiled from device manuals and firmware dumps and infected approximately 600,000 devices within weeks. The resulting botnet conducted DDoS attacks that peaked at 1.1 Tbps against DNS provider Dyn, taking down Twitter, Spotify, Reddit and dozens of other major services for several hours.",
      },
      {
        type: "p",
        text: "The vulnerability is trivially discoverable. [Shodan](https://www.shodan.io), a search engine that indexes internet-connected devices, returns results for default credentials with simple queries. Researchers at Symantec found in 2019 that 98% of IoT traffic was unencrypted and that the most attacked device types were routers and IP cameras, both categories notorious for unchanged default credentials. The fix is not technically difficult: force credential change at first boot, generate a unique random password per unit or use device-specific secrets derived from hardware identifiers. The reason it does not happen is that it adds friction to unboxing, which affects return rates.",
      },
      {
        type: "h2",
        text: "Unencrypted Traffic",
      },
      {
        type: "p",
        text: "Many IoT devices transmit data in plaintext. Sensor readings, authentication tokens, control commands and firmware update payloads travel over the network without encryption. On an unprotected Wi-Fi network this means any nearby observer can capture and read the traffic with a passive packet capture tool. On the public internet it means any network device between the client and server can inspect or modify the data.",
      },
      {
        type: "p",
        text: "The consequences range from privacy violations to active compromise. A smart thermostat that sends occupancy data in plaintext leaks home presence patterns. An IP camera that streams over unencrypted RTSP exposes live video to anyone on the local network. A smart lock that sends unlock commands without authentication or encryption can be trivially replayed: capture one valid command and you can unlock the door indefinitely.",
      },
      {
        type: "p",
        text: "The KRACK attack (Key Reinstallation Attack, CVE-2017-13077 through 13088) demonstrated that even WPA2 Wi-Fi encryption offers no protection if the device implementation has flaws in the four-way handshake. Devices that relied on Wi-Fi encryption alone and transmitted application data in plaintext remained vulnerable even with encryption nominally in place. The lesson is that transport-layer encryption must be implemented at the application level, not assumed from the network layer.",
      },
      {
        type: "h2",
        text: "Insufficient Update Mechanisms",
      },
      {
        type: "p",
        text: "Firmware vulnerabilities are discovered regularly throughout the lifetime of a product. A device with no OTA update capability remains vulnerable to every vulnerability found after it ships. A 2018 study by Armis found that 48% of IoT devices ran outdated operating system versions and that the average time between vulnerability disclosure and patching on IoT devices was 12 months, compared to 3 days for enterprise software.",
      },
      {
        type: "p",
        text: "The Ripple20 disclosure in 2020 (19 CVEs in the Treck TCP/IP library) affected hundreds of millions of devices including medical equipment, industrial controllers and consumer routers. Many of the affected devices had no update mechanism. Some that did had mechanisms that accepted unsigned firmware, meaning an attacker who could intercept the update delivery could substitute a malicious image. CVE-2020-11896, the most severe Ripple20 vulnerability with a CVSS score of 10.0, allowed unauthenticated remote code execution on affected devices via crafted IPv4 packets.",
      },
      {
        type: "p",
        text: "A secure OTA update mechanism requires: TLS for the download connection, cryptographic signature verification of the firmware binary before applying, rollback protection so a device cannot be downgraded to a known-vulnerable version and a fallback image so a failed update does not brick the device. Each of these adds cost and complexity. None of them are optional for a device with a multi-year expected lifetime.",
      },
      {
        type: "h2",
        text: "Insecure Network Services",
      },
      {
        type: "p",
        text: "Many consumer IoT devices expose network services that serve no user-facing purpose: Telnet on port 23, SSH with a root account and a known password, HTTP management interfaces on port 80 or 8080 with no authentication, UPnP endpoints that can be queried and manipulated from the local network. The attack surface of a device is directly proportional to the number of services it exposes.",
      },
      {
        type: "p",
        text: "The Shodan IoT report consistently finds hundreds of thousands of devices with exposed Telnet, FTP and HTTP management interfaces. In 2021, security researcher Paul Marrapese discovered a vulnerability in Kalay, a cloud platform used by tens of millions of IoT devices including baby monitors and security cameras (CVE-2021-28372). The flaw allowed an attacker who knew a device's UID to intercept authentication and gain live audio and video access. The root cause was an authentication protocol that was designed for ease of setup rather than security.",
      },
      {
        type: "h2",
        text: "Physical Access and Debug Interfaces",
      },
      {
        type: "p",
        text: "Many IoT devices ship with UART debug consoles, JTAG headers or SWD pads populated on the PCB. These are left in production firmware because disabling them requires effort and test infrastructure changes. An attacker with physical access to the device can connect to the UART console and interact with a root shell, read flash memory over JTAG or extract firmware for offline analysis.",
      },
      {
        type: "p",
        text: "The teardown community has documented this extensively. Cheap IP cameras from Aliexpress commonly expose a UART console on unpopulated pads that gives immediate root access. The Ubiquiti EdgeRouter in 2019 was found to have an accessible UART shell that required no authentication. Physical access attacks are not theoretical: they are how most IoT firmware gets dumped for vulnerability research and they are how attackers gain a persistent foothold on devices they can physically reach.",
      },
      {
        type: "h2",
        text: "The Regulatory Response",
      },
      {
        type: "p",
        text: "Regulation has started to address the worst practices. ETSI EN 303 645, published in 2020, defines a baseline cybersecurity standard for consumer IoT. The 13 provisions include: no universal default passwords, a means to manage reports of vulnerabilities, software should be kept updated, credentials and security-sensitive data shall be stored securely and communication security shall be used. The UK Product Security and Telecommunications Infrastructure Act 2022 made ETSI EN 303 645 compliance a legal requirement for consumer connectable products sold in the UK from April 2024.",
      },
      {
        type: "p",
        text: "The [OWASP](https://owasp.org) IoT Top 10 (2018 edition) provides a complementary checklist of the most critical vulnerability categories: weak passwords, insecure network services, insecure ecosystem interfaces, lack of secure update mechanism, use of insecure or outdated components, insufficient privacy protection, insecure data transfer and storage, lack of device management, insecure default settings and lack of physical hardening.",
      },
      {
        type: "h2",
        text: "What Better Design Looks Like",
      },
      {
        type: "ul",
        items: [
          "Force unique credentials at first boot with a minimum entropy requirement - no shared defaults across units",
          "Encrypt all communications: TLS 1.2 or higher for HTTP and [MQTT](https://mqtt.org), DTLS for constrained devices using CoAP",
          "Sign all firmware images with an asymmetric key pair, verify the signature before applying any update",
          "Implement a secure boot chain: the bootloader verifies the firmware hash before execution",
          "Add rollback protection: a monotonic counter in OTP memory prevents downgrades to known-vulnerable versions",
          "Disable all debug interfaces (UART, JTAG, SWD) in production builds and lock fuse bits where available",
          "Expose only services the device genuinely needs: close every other port and disable every other protocol",
          "Rate-limit authentication attempts and lock accounts after repeated failures",
          "Log security events to a remote syslog or cloud endpoint so anomalies are detectable",
          "Implement certificate pinning for cloud connections so a compromised CA cannot enable man-in-the-middle attacks",
        ],
      },
      {
        type: "quote",
        text: "Security is not a feature you add at the end. It is a constraint you design around from the beginning.",
        source: "Commonly attributed to Bruce Schneier, security researcher",
      },
      {
        type: "h2",
        text: "References",
      },
      {
        type: "ol-links",
        items: [
          { text: "Krebs on Security: KrebsOnSecurity Hit With Record DDoS (Mirai, 2016)", url: "https://krebsonsecurity.com/2016/09/krebsonsecurity-hit-with-record-ddos/" },
          { text: "Wikipedia: Mirai (malware) - the botnet that exploited default credentials on IoT devices", url: "https://en.wikipedia.org/wiki/Mirai_(malware)" },
          { text: "OWASP IoT Top 10 - the standard vulnerability checklist for connected devices", url: "https://owasp.org/www-project-internet-of-things/" },
          { text: "NIST Cybersecurity for IoT Program - guidance, frameworks and research", url: "https://www.nist.gov/programs-projects/nist-cybersecurity-iot-program" },
          { text: "Wikipedia: Internet of things - Security section covering attack surfaces and regulatory response", url: "https://en.wikipedia.org/wiki/Internet_of_things#Security" },
          { text: "Shodan - the search engine for internet-connected devices", url: "https://www.shodan.io" },
          { text: "Cloudflare DDoS coverage and incident analysis", url: "https://blog.cloudflare.com/tag/ddos/" },
          { text: "JSOF Research: Ripple20 - 19 Zero-Day Vulnerabilities (2020)", url: "https://www.jsof-tech.com/disclosures/ripple20/" },
          { text: "Vanhoef, M. & Piessens, F.: Key Reinstallation Attacks (KRACK) - ACM CCS 2017", url: "https://papers.mathyvanhoef.com/ccs2017.pdf" },
          { text: "NVD: CVE-2021-28372 Kalay Platform vulnerability", url: "https://nvd.nist.gov/vuln/detail/CVE-2021-28372" },
          { text: "ETSI EN 303 645: Cyber Security for Consumer IoT baseline requirements", url: "https://www.etsi.org/committee/1372-cyber" },
          { text: "UK Product Security and Telecommunications Infrastructure Act 2022", url: "https://www.legislation.gov.uk/ukpga/2022/46/contents" },
          { text: "Armis Security Research", url: "https://www.armis.com/research/" },
        ],
      },
    ],
  }

export default _iot_security_gaps
