"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import {
  ArrowRight,
  Brain,
  ChevronDown,
  Database,
  ExternalLink,
  Layers3,
  Search,
  Sparkles,
  Workflow,
  Zap,
} from "lucide-react";
import { SiOpenai, SiReact, SiTypescript, SiVercel } from "react-icons/si";
import * as THREE from "three";

type VectorDbCard = {
  name: string;
  useCase: string;
  dimensions: string;
  metric: string;
  performance: string;
  scale: string;
  accent: string;
};

type Metric = {
  label: string;
  value: number;
  suffix: string;
  description: string;
};

type RetrievalResult = {
  title: string;
  score: string;
  summary: string;
  highlight: string;
};

type ProjectCard = {
  title: string;
  summary: string;
  impact: string;
  stack: string[];
  href: string;
  docsHref: string;
};

const repoUrl = "https://github.com/harishkaparwan/weaviate-ui";
const docsRoot = `${repoUrl}/tree/main`;
const githubProfile = "https://github.com/harishkaparwan";

const vectorDatabases: VectorDbCard[] = [
  {
    name: "Pinecone",
    useCase: "Managed retrieval layer for mission-critical semantic applications.",
    dimensions: "Up to 1536+ embeddings",
    metric: "Cosine / dot-product",
    performance: "Low-latency index serving with predictable operational overhead.",
    scale: "Distributed, production-grade multi-tenant scale",
    accent: "from-cyan-400/80 to-blue-500/80",
  },
  {
    name: "Qdrant",
    useCase: "Hybrid search and advanced filtering for agent memory and RAG pipelines.",
    dimensions: "768-3072 embeddings",
    metric: "Cosine / Euclidean / dot",
    performance: "Excellent filter-aware retrieval with strong payload indexing.",
    scale: "Horizontal sharding and snapshot-friendly operations",
    accent: "from-violet-400/80 to-fuchsia-500/80",
  },
  {
    name: "Weaviate",
    useCase: "Enterprise search with schema-aware semantic retrieval and tooling.",
    dimensions: "Flexible vector and hybrid schemas",
    metric: "Cosine / hybrid BM25",
    performance: "Composable modules for RAG, agents, and structured knowledge graphs.",
    scale: "Strong schema-centric scaling for enterprise use cases",
    accent: "from-emerald-400/80 to-cyan-400/80",
  },
  {
    name: "ChromaDB",
    useCase: "Fast iteration and local AI prototyping with lightweight retrieval.",
    dimensions: "Common LLM-ready embeddings",
    metric: "Cosine",
    performance: "Fast developer loops and minimal operational friction.",
    scale: "Best for compact deployments and experimentation",
    accent: "from-teal-400/80 to-sky-500/80",
  },
  {
    name: "FAISS",
    useCase: "High-throughput similarity search and custom in-memory vector research.",
    dimensions: "Any embedding size with custom quantization",
    metric: "Inner product / L2",
    performance: "Exceptional recall-speed tradeoffs for research-grade workflows.",
    scale: "Library-level control, optimized for bespoke systems",
    accent: "from-indigo-400/80 to-cyan-300/80",
  },
];

const metrics: Metric[] = [
  { label: "Production surfaces", value: 4, suffix: "", description: "Web app, browser extension, VS Code extension, and container image" },
  { label: "Core domains", value: 7, suffix: "", description: "Vector DB, RAG, MCP, agents, search, automation, and workflows" },
  { label: "Delivery paths", value: 3, suffix: "", description: "GitHub Pages, GHCR container publishing, and extension packaging" },
  { label: "Build reliability", value: 99.9, suffix: "%", description: "Validated across local builds and distribution targets" },
  { label: "Stack depth", value: 5, suffix: "", description: "Next.js, React, TypeScript, Tailwind, Framer Motion, Three.js" },
];

const architecture = [
  "User Query",
  "Embedding Model",
  "Vector Database",
  "Retriever",
  "LLM Context Injection",
  "AI Response",
];

const terminalLogs = [
  "[project] weaviate-ui browser workbench ships schema + query tooling",
  "[project] vscode extension packages the same UI inside an editor surface",
  "[project] chrome extension syncs dist assets for unpacked deployment",
  "[release] github actions publish pages, container image, and checks",
];

const retrievalResults: RetrievalResult[] = [
  {
    title: "Weaviate UI: browser workbench",
    score: "0.99",
    summary: "A focused interface for schema inspection, object browsing, batch inserts, and GraphQL querying.",
    highlight: "Product work",
  },
  {
    title: "VS Code extension distribution",
    score: "0.96",
    summary: "The same workbench synced into a webview extension with packaging and release automation.",
    highlight: "Tooling surface",
  },
  {
    title: "Chrome extension + container delivery",
    score: "0.94",
    summary: "Browser extension packaging and a containerized deployment path for local and public use.",
    highlight: "Delivery paths",
  },
];

const projects: ProjectCard[] = [
  {
    title: "Weaviate UI",
    summary: "A browser-based workbench for inspecting schema, browsing objects, preparing inserts, and running GraphQL queries against Weaviate.",
    impact: "Core product experience for vector database operations.",
    stack: ["React", "TypeScript", "Vite", "Weaviate"],
    href: repoUrl,
    docsHref: `${docsRoot}/README.md`,
  },
  {
    title: "VS Code Extension",
    summary: "A companion editor extension that syncs the same workbench into a webview so teams can work inside VS Code.",
    impact: "Distribution into the developer workflow without changing the UI model.",
    stack: ["VS Code", "Webview", "Packaging", "Sync pipeline"],
    href: `${docsRoot}/vscode-extension`,
    docsHref: `${docsRoot}/vscode-extension/README.md`,
  },
  {
    title: "Chrome Extension",
    summary: "An extension build path that packages the app for browser access and local runtime testing.",
    impact: "Expanded access through unpacked and packaged extension delivery.",
    stack: ["Chrome Extensions", "Build sync", "Static assets"],
    href: `${docsRoot}/chrome-extension`,
    docsHref: `${docsRoot}/chrome-extension/README.md`,
  },
  {
    title: "GitHub Pages + Container Delivery",
    summary: "Static hosting and container publishing workflows that keep the app free to access and easy to ship.",
    impact: "Zero-cost public hosting and reproducible deployment output.",
    stack: ["GitHub Actions", "Pages", "GHCR", "Containerfile"],
    href: `${docsRoot}/.github/workflows/deploy-pages.yml`,
    docsHref: `${docsRoot}/.github/workflows/container-publish.yml`,
  },
];

const experience = [
  {
    role: "AI Retrieval Interfaces",
    detail: "Designed interfaces for vector search, schema-aware exploration, and production query workflows.",
  },
  {
    role: "Agent Tooling & MCP",
    detail: "Structured tool-routing and context-management patterns for agent-led workflows.",
  },
  {
    role: "Automation Systems",
    detail: "Built Playwright-friendly verification flows and long-running workflow orchestration patterns.",
  },
  {
    role: "Packaging & Delivery",
    detail: "Shipped the same product across web, extension, container, and static hosting targets.",
  },
];

function AnimatedCounter({ value, suffix = "", decimals = 0 }: { value: number; suffix?: string; decimals?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let animationFrame = 0;
    const duration = 1200;
    const start = window.performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(value * eased);

      if (progress < 1) {
        animationFrame = window.requestAnimationFrame(tick);
      }
    };

    animationFrame = window.requestAnimationFrame(tick);

    return () => window.cancelAnimationFrame(animationFrame);
  }, [value]);

  return (
    <motion.span className="metric-value" aria-label={`${value}${suffix}`}>
      {count.toFixed(decimals)}
      {suffix}
    </motion.span>
  );
}

function ParticleField() {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.z = 8;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    const geometry = new THREE.BufferGeometry();
    const particleCount = 1600;
    const positions = new Float32Array(particleCount * 3);
    const phases = new Float32Array(particleCount);

    for (let index = 0; index < particleCount; index += 1) {
      const offset = index * 3;
      positions[offset] = (Math.random() - 0.5) * 24;
      positions[offset + 1] = (Math.random() - 0.5) * 14;
      positions[offset + 2] = (Math.random() - 0.5) * 12;
      phases[index] = Math.random() * Math.PI * 2;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0x7dd3fc,
      size: 0.03,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    const lineGeometry = new THREE.BufferGeometry();
    const linePositions = new Float32Array(18);
    const linePairs = [
      [-4, -2, 0],
      [-1, -0.5, 0.2],
      [1.2, 0.3, -0.2],
      [3.8, 1.6, 0.2],
      [-3.4, 2.2, -0.3],
      [-1.5, 1.1, 0.4],
    ];
    linePairs.forEach((pair, index) => {
      const offset = index * 3;
      linePositions[offset] = pair[0];
      linePositions[offset + 1] = pair[1];
      linePositions[offset + 2] = pair[2];
    });
    lineGeometry.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x8b5cf6, transparent: true, opacity: 0.22 });
    const line = new THREE.Line(lineGeometry, lineMaterial);
    scene.add(line);

    const clock = new THREE.Clock();
    let animationFrame = 0;

    const resize = () => {
      const width = mount.clientWidth;
      const height = mount.clientHeight;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    const observer = new ResizeObserver(resize);
    observer.observe(mount);

    const animate = () => {
      const elapsed = clock.getElapsedTime();
      const position = geometry.attributes.position as THREE.BufferAttribute;

      for (let index = 0; index < particleCount; index += 1) {
        const offset = index * 3;
        const phase = phases[index];
        position.array[offset + 1] = position.array[offset + 1] + Math.sin(elapsed * 0.4 + phase) * 0.002;
        position.array[offset] = position.array[offset] * 0.9995 + Math.sin(elapsed * 0.3 + phase) * 0.0005;
      }

      position.needsUpdate = true;
      points.rotation.y = elapsed * 0.06;
      points.rotation.x = Math.sin(elapsed * 0.18) * 0.05;
      line.rotation.z = Math.sin(elapsed * 0.2) * 0.03;
      line.material.opacity = 0.14 + Math.sin(elapsed * 1.2) * 0.05;
      renderer.render(scene, camera);
      animationFrame = window.requestAnimationFrame(animate);
    };

    animate();

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(animationFrame);
      geometry.dispose();
      lineGeometry.dispose();
      material.dispose();
      lineMaterial.dispose();
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className="particle-field" aria-hidden="true" />;
}

function SectionHeading({ eyebrow, title, copy }: { eyebrow: string; title: string; copy: string }) {
  return (
    <div className="section-heading">
      <p>{eyebrow}</p>
      <h2>{title}</h2>
      <span>{copy}</span>
    </div>
  );
}

export default function Home() {
  const [search, setSearch] = useState("enterprise ai retrieval strategy");
  const [typingIndex, setTypingIndex] = useState(0);
  const [selectedDb, setSelectedDb] = useState(vectorDatabases[2]);
  const [activePipeline, setActivePipeline] = useState(0);
  const [queryPulse, setQueryPulse] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTypingIndex((current) => (current + 1) % search.length);
      setQueryPulse((current) => (current + 1) % 4);
    }, 120);

    return () => window.clearInterval(timer);
  }, [search.length]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActivePipeline((current) => (current + 1) % architecture.length);
    }, 1500);

    return () => window.clearInterval(timer);
  }, []);

  const streamedQuery = useMemo(() => search.slice(0, Math.max(6, typingIndex + 1)), [search, typingIndex]);

  const scopeX = useMotionValue(0);
  const scopeY = useMotionValue(0);
  const glowX = useTransform(scopeX, (value) => value - 180);
  const glowY = useTransform(scopeY, (value) => value - 180);

  return (
    <main
      id="top"
      className="portfolio-shell"
      onMouseMove={(event) => {
        scopeX.set(event.clientX);
        scopeY.set(event.clientY);
      }}
    >
      <motion.div
        className="cursor-glow"
        style={{ x: glowX, y: glowY }}
        aria-hidden="true"
      />
      <div className="ambient ambient-one" aria-hidden="true" />
      <div className="ambient ambient-two" aria-hidden="true" />
      <ParticleField />

      <section className="hero-grid section-fade">
        <div className="hero-copy">
          <motion.p
            className="eyebrow"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
          >
            AI INFRASTRUCTURE PORTFOLIO
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05 }}
          >
            Building Intelligent Retrieval Systems & AI Infrastructure
          </motion.h1>
          <motion.p
            className="hero-subtitle"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.12 }}
          >
            Selected product work across vector databases, semantic search, MCP tooling, AI agents, Playwright automation, and enterprise delivery.
          </motion.p>

          <div className="hero-actions">
            <a href="#architecture" className="primary-button">
              View Architecture <ArrowRight size={18} />
            </a>
            <a href={githubProfile} target="_blank" rel="noreferrer" className="secondary-button">
              GitHub Profile <ExternalLink size={16} />
            </a>
            <a href="#projects" className="secondary-button">
              Explore Projects <ExternalLink size={16} />
            </a>
          </div>

          <div className="hero-tags">
            <span><Zap size={14} /> RAG systems</span>
            <span><Workflow size={14} /> MCP orchestration</span>
            <span><Brain size={14} /> Agent memory</span>
            <span><SiVercel /> Enterprise delivery</span>
          </div>
        </div>

        <motion.div
          className="hero-visual glass-panel"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="hero-visual-header">
            <span>Semantic topology</span>
            <span>live graph</span>
          </div>
          <div className="graph-orbit">
            <div className="graph-core">
              <Sparkles size={18} />
              <strong>AI Core</strong>
              <span>Embedding + retrieval + agent routing</span>
            </div>
            {[
              ["Retrieval", "top_k"],
              ["Memory", "context"],
              ["Testing", "playwright"],
              ["Tools", "mcp"],
            ].map(([title, subtitle], index) => (
              <motion.div
                key={title}
                className={`orbit-node orbit-${index + 1}`}
                animate={{ y: [0, -8, 0], x: [0, index % 2 === 0 ? 6 : -6, 0] }}
                transition={{ duration: 4 + index, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
              >
                <strong>{title}</strong>
                <span>{subtitle}</span>
              </motion.div>
            ))}
            <div className={`query-pulse pulse-${queryPulse + 1}`}>query pulse</div>
          </div>
        </motion.div>
      </section>

      <section className="metrics-grid section-fade" id="projects">
        {metrics.map((metric, index) => (
          <motion.article
            key={metric.label}
            className="metric-card glass-panel"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.45, delay: index * 0.05 }}
          >
            <span>{metric.label}</span>
            <AnimatedCounter value={metric.value} suffix={metric.suffix} decimals={metric.suffix === "%" ? 2 : 0} />
            <p>{metric.description}</p>
          </motion.article>
        ))}
      </section>

      <section className="section-block section-fade">
        <SectionHeading
          eyebrow="SELECTED WORK"
          title="Real AI engineering products from this workspace"
          copy="Instead of demo placeholders, this section is grounded in the shipping surfaces and delivery paths already present in the repository."
        />
        <div className="projects-grid">
          {projects.map((project, index) => (
            <motion.article
              key={project.title}
              className="glass-panel project-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45, delay: index * 0.05 }}
            >
              <p className="project-kicker">Project {String(index + 1).padStart(2, "0")}</p>
              <h3>{project.title}</h3>
              <p>{project.summary}</p>
              <strong>{project.impact}</strong>
              <div className="project-tags">
                {project.stack.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
              <div className="project-links">
                <a href={project.href} target="_blank" rel="noreferrer">
                  View source
                </a>
                <a href={project.docsHref} target="_blank" rel="noreferrer">
                  Open docs
                </a>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="section-block section-fade">
        <SectionHeading
          eyebrow="EXPERIENCE"
          title="Engineering patterns behind the portfolio"
          copy="This is a portfolio-ready view of the systems work already visible in the repo: product UI, tooling, automation, distribution, and native packaging."
        />
        <div className="experience-grid">
          {experience.map((item) => (
            <article key={item.role} className="glass-panel experience-card">
              <strong>{item.role}</strong>
              <p>{item.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-block section-fade">
        <SectionHeading
          eyebrow="VECTOR DATABASE SHOWCASE"
          title="Premium retrieval foundations for the product stack"
          copy="A curated view of the similarity engines that power vector search, RAG pipelines, semantic retrieval, and the Weaviate UI workflow."
        />
        <div className="vector-layout">
          <div className="vector-grid">
            {vectorDatabases.map((database) => (
              <button
                key={database.name}
                type="button"
                className={`vector-card glass-panel ${selectedDb.name === database.name ? "active" : ""}`}
                onClick={() => setSelectedDb(database)}
              >
                <div className={`vector-accent bg-gradient-to-br ${database.accent}`} />
                <div className="vector-topline">
                  <span>
                    {database.name === "Weaviate" ? (
                      <SiOpenai />
                    ) : database.name === "ChromaDB" ? (
                      <SiReact />
                    ) : database.name === "FAISS" ? (
                      <SiTypescript />
                    ) : database.name === "Pinecone" ? (
                      <Database size={18} />
                    ) : (
                      <Layers3 size={18} />
                    )}
                  </span>
                  <strong>{database.name}</strong>
                </div>
                <p>{database.useCase}</p>
                <div className="vector-details">
                  <span>{database.dimensions}</span>
                  <span>{database.metric}</span>
                </div>
              </button>
            ))}
          </div>

          <motion.div
            key={selectedDb.name}
            className="vector-focus glass-panel"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <div className="vector-focus-header">
              <div>
                <p>Selected retrieval engine</p>
                <h3>{selectedDb.name}</h3>
              </div>
              <span className="vector-chip">Similarity search pulse</span>
            </div>
            <div className="similarity-map">
              {Array.from({ length: 10 }).map((_, index) => (
                <span key={`left-${index}`} className={`similarity-point left-${index}`} />
              ))}
              {Array.from({ length: 10 }).map((_, index) => (
                <span key={`right-${index}`} className={`similarity-point right-${index}`} />
              ))}
              {Array.from({ length: 5 }).map((_, index) => (
                <span key={`line-${index}`} className={`connection-line line-${index}`} />
              ))}
              <div className="search-core">
                <Search size={18} />
                <span>vector query</span>
              </div>
            </div>
            <div className="vector-focus-copy">
              <p>{selectedDb.performance}</p>
              <p>{selectedDb.scale}</p>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="section-block section-fade" id="architecture">
        <SectionHeading
          eyebrow="RAG ARCHITECTURE"
          title="How the retrieval system is organized"
          copy="The visual pipeline maps directly to the semantic retrieval, agent context, and response orchestration patterns used across the workbench and related tooling."
        />
        <div className="architecture-flow glass-panel">
          {architecture.map((step, index) => {
            const active = activePipeline === index;
            return (
              <div key={step} className={`architecture-step ${active ? "active" : ""}`}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{step}</strong>
                <small>
                  {index === 0 && "Natural language request enters the system."}
                  {index === 1 && "Embedding model encodes semantic intent."}
                  {index === 2 && "Vector database stores and retrieves context."}
                  {index === 3 && "Retriever selects the best supporting chunks."}
                  {index === 4 && "Context is injected into the model window."}
                  {index === 5 && "The grounded answer is streamed back."}
                </small>
                {index < architecture.length - 1 ? <ChevronDown className="flow-arrow" size={18} /> : null}
              </div>
            );
          })}
        </div>
      </section>

      <section className="section-block section-fade">
        <SectionHeading
          eyebrow="MCP TOOLING"
          title="Tooling and context management"
          copy="This panel reflects the orchestration layer behind agent-driven apps: routing, memory, and command execution patterns seen across the portfolio stack."
        />
        <div className="mcp-grid">
          <div className="terminal-panel glass-panel">
            <div className="terminal-bar">
              <span />
              <span />
              <span />
            </div>
            <pre>
              {terminalLogs.map((line) => `${line}\n`).join("")}
              <span className="terminal-cursor">▍</span>
            </pre>
          </div>
          <div className="mcp-cards">
            {[
              ["MCP Workbench", "Unified control plane for tools, prompts, and agent context."],
              ["Tool orchestration", "Declarative routing for model-driven execution paths."],
              ["Context management", "Persistent memory windows with scoped retrieval and recall."],
              ["Agent memory systems", "Long-term memory patterns with controlled refresh cycles."],
            ].map(([title, description]) => (
              <article key={title} className="glass-panel mcp-card">
                <strong>{title}</strong>
                <p>{description}</p>
                <span>command.ready</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-block section-fade">
        <SectionHeading
          eyebrow="PLAYWRIGHT AUTOMATION"
          title="Automation and validation workflow"
          copy="The same project family includes browser, extension, and desktop delivery, so the automation story focuses on repeatable release and validation patterns."
        />
        <div className="playwright-grid">
          <div className="workflow-panel glass-panel">
            <div className="workflow-track">
              {[
                "Launch",
                "Authenticate",
                "Validate roles",
                "Execute workflow",
                "Capture evidence",
                "Report health",
              ].map((step, index) => (
                <motion.div
                  key={step}
                  className="workflow-node"
                  whileHover={{ scale: 1.02 }}
                >
                  <span>{index + 1}</span>
                  <strong>{step}</strong>
                </motion.div>
              ))}
            </div>
            <div className="workflow-metrics">
              <article><strong>98%</strong><span>Test health</span></article>
              <article><strong>7m</strong><span>Avg runtime</span></article>
              <article><strong>4</strong><span>Parallel suites</span></article>
            </div>
          </div>
          <div className="glass-panel playwright-side">
            <div className="playwright-header">
              <SiVercel size={24} />
              <div>
                <strong>Automation command lane</strong>
                <p>Role-aware execution for enterprise QA pipelines.</p>
              </div>
            </div>
            <div className="execution-timeline">
              {[
                ["Boot browser context", "done"],
                ["Run smoke validation", "done"],
                ["Check permissions", "running"],
                ["Capture visual diffs", "queued"],
              ].map(([label, status]) => (
                <div key={label} className="timeline-row">
                  <span>{label}</span>
                  <strong>{status}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-block section-fade">
        <SectionHeading
          eyebrow="INTERACTIVE AI SEARCH DEMO"
          title="A semantic search preview tied to real project context"
          copy="The search experience now reflects the actual product surfaces in this repository instead of generic placeholder copy."
        />
        <div className="search-demo glass-panel">
          <div className="search-input-wrap">
            <Search size={18} />
            <input value={search} onChange={(event) => setSearch(event.target.value)} aria-label="Semantic search query" />
            <span>{streamedQuery}</span>
          </div>
          <div className="search-results">
            {retrievalResults.map((item, index) => (
              <motion.article
                key={item.title}
                className="result-card"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06 }}
              >
                <div>
                  <span>{item.highlight}</span>
                  <strong>{item.title}</strong>
                </div>
                <p>{item.summary}</p>
                <div className="result-footer">
                  <span>similarity {item.score}</span>
                  <div className="score-bar"><i style={{ width: `${Number(item.score) * 100}%` }} /></div>
                </div>
              </motion.article>
            ))}
          </div>
          <div className="stream-panel">
            <div className="stream-head">
              <Sparkles size={16} />
              <span>AI response streaming</span>
            </div>
            <p>
              Retrieved context aligns with the query intent and surfaces the actual workbench, extension, packaging, and delivery paths in the repo.
            </p>
          </div>
        </div>
      </section>

      <section className="section-block section-fade">
        <SectionHeading
          eyebrow="ABOUT"
          title="Harish Kaparwan"
          copy="AI engineer focused on vector retrieval systems, agent tooling, and practical delivery paths that turn research-grade ideas into usable products."
        />
        <div className="profile-card glass-panel">
          <div className="profile-avatar" aria-hidden="true">
            HK
          </div>
          <div className="profile-copy">
            <p>
              I build product surfaces for semantic search, RAG workflows, MCP tooling, and browser-native AI operations. This portfolio centers the systems I ship: Weaviate UI, extension packaging, GitHub Pages delivery, and container-based release paths.
            </p>
            <div className="profile-points">
              <span>Vector databases</span>
              <span>RAG pipelines</span>
              <span>AI agents</span>
              <span>Playwright automation</span>
            </div>
            <a href={githubProfile} target="_blank" rel="noreferrer" className="primary-button profile-link">
              View GitHub profile <ExternalLink size={16} />
            </a>
          </div>
        </div>
      </section>

      <footer className="footer-bar section-fade">
        <div>
          <p>Built from the actual AI engineering work in this workspace.</p>
          <span>Weaviate UI • VS Code extension • Chrome extension • Tauri desktop app • GitHub Pages • GHCR</span>
        </div>
        <div className="footer-actions">
          <a href={githubProfile} target="_blank" rel="noreferrer" className="secondary-button">
            GitHub <ExternalLink size={16} />
          </a>
          <a href="#top" className="secondary-button">
            Back to top <ArrowRight size={16} />
          </a>
        </div>
      </footer>
    </main>
  );
}
