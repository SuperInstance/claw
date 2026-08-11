# FABRIC-MCP

**The Temporal Event Bus for Agentic Ecosystems.**

FABRIC-MCP is a high-performance, Model Context Protocol (MCP) server designed to transform LLM agents from stateless request/response handlers into **situational crew members**. It provides a unified, time-ordered ring buffer (The Event Bus) and a T-minus commitment engine to manage agentic promises and situational awareness.

## 🧠 Core Concepts

### 1. The Event Bus (The Circulatory System)
A high-speed, asynchronous ring buffer that captures every significant state change in the workspace. Every agent, tool, and filesystem watcher publishes to the bus, creating a continuous "synaptic trace" of all activity.

### 2. The T-Minus Commitment Engine (The Promise Engine)
Allows agents to make time-bounded commitments to the system and to each other. The engine tracks these promises, detects overdue deadlines, and emits alarm events, ensuring accountability in autonomous workflows.

### 3. Situational Context ()
Instead of scanning massive file trees to understand the current state, agents can simply query the  resource. This provides a compressed, high-fidelity "chord" of the most recent event per channel, active commitments, and online agents.

---

## 🛠 Tech Stack

- **Language:** Rust (for performance, safety, and concurrency)
- **Runtime:**  (async async-await)
- **Persistence:**  (via )
- **Protocol:** Model Context Protocol (MCP) via 
- **Temporal Logic:** Hybrid Monotonic T-plus + Wall-clock timestamps

---

## 🚀 Quick Start

### Prerequisites
- [Rust & Cargo](https://rustup.rs/)
- [GitHub CLI (Work seamlessly with GitHub from the command line.

USAGE
  gh <command> <subcommand> [flags]

CORE COMMANDS
  auth:          Authenticate gh and git with GitHub
  browse:        Open repositories, issues, pull requests, and more in the browser
  codespace:     Connect to and manage codespaces
  gist:          Manage gists
  issue:         Manage issues
  org:           Manage organizations
  pr:            Manage pull requests
  project:       Work with GitHub Projects.
  release:       Manage releases
  repo:          Manage repositories

GITHUB ACTIONS COMMANDS
  cache:         Manage GitHub Actions caches
  run:           View details about workflow runs
  workflow:      View details about GitHub Actions workflows

ALIAS COMMANDS
  co:            Alias for "pr checkout"

ADDITIONAL COMMANDS
  agent-task:    Work with agent tasks (preview)
  alias:         Create command shortcuts
  api:           Make an authenticated GitHub API request
  attestation:   Work with artifact attestations
  completion:    Generate shell completion scripts
  config:        Manage configuration for gh
  extension:     Manage gh extensions
  gpg-key:       Manage GPG keys
  label:         Manage labels
  preview:       Execute previews for gh features
  ruleset:       View info about repo rulesets
  search:        Search for repositories, issues, and pull requests
  secret:        Manage GitHub secrets
  ssh-key:       Manage SSH keys
  status:        Print information about relevant issues, pull requests, and notifications across repositories
  variable:      Manage GitHub Actions variables

HELP TOPICS
  accessibility: Learn about GitHub CLI's accessibility experiences
  actions:       Learn about working with GitHub Actions
  environment:   Environment variables that can be used with gh
  exit-codes:    Exit codes used by gh
  formatting:    Formatting options for JSON data exported from gh
  mintty:        Information about using gh with MinTTY
  reference:     A comprehensive reference of all gh commands

FLAGS
  --help      Show help for command
  --version   Show gh version

EXAMPLES
  $ gh issue create
  $ gh repo clone cli/cli
  $ gh pr checkout 321

LEARN MORE
  Use `gh <command> <subcommand> --help` for more information about a command.
  Read the manual at https://cli.github.com/manual
  Learn about exit codes using `gh help exit-codes`
  Learn about accessibility experiences using `gh help accessibility`)](https://cli.github.com/)

### Development Setup

1. **Clone the repository:**
   

2. **Build the project:**
   

3. **Run the development server:**
   

### Connecting to an MCP Client (e.g., Claude Desktop)
Add the following to your :



---

## 🗺 Roadmap

- [x] **Sprint 1: Core Foundation** (Clock, Event, Ingest/Eviction)
- [ ] **Sprint 2: The Query Engine** (Filtering, Search, Chord/Snapshot)
- [ ] **Sprint 3: The Commitment Engine** (T-minus tracking, Deadline Alarms)
- [ ] **Sprint 4: MCP Interface** (Tool & Resource implementation)
- [ ] **Sprint 5: Environmental Awareness** (Filesystem & Git Watchers)

---

## 📖 Documentation

For deep technical specifications, please refer to the  directory:
- [Internal Architecture](./docs/architecture/INTERNAL_MECHANICS.md)
- [Protocol & API Reference](./docs/api/PROTOCOL_SPEC.md)
- [Implementation Roadmap](./docs/implementation/ROADMAP.md)
- [Engineering Onboarding](./docs/onboarding/ONBOARDING.md)

---

## 🤝 Contributing

This project follows the **Hermit Crab Growth Framework**. We value developers who don't just write code, but who leave behind the "synaptic traces" (documentation and architecture handover) required for their successors to thrive. 

If you contribute, please ensure you follow the **Succession Protocol** defined in our documentation.
