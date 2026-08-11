# SuperInstance Business Homepage - Round 2 Design

**Project:** SuperInstance Platform
**Round:** 2 of 10 - Enterprise Refined
**Date:** 2026-03-14
**Status:** Enterprise-Optimized Design
**Based On:** Round 1 + Enterprise Testing Feedback

---

## What Changed in Round 2

### Messaging Refinements
- ✅ Removed "3.5 billion years" evolutionary metaphor from hero
- ✅ Added specific deployment options (on-prem, cloud, hybrid, edge)
- ✅ Added technical specifications and performance metrics
- ✅ Renamed "SpreadsheetMoment" → "Tensor Platform" for enterprise
- ✅ Added procurement information for Lucineer
- ✅ Added compliance badges (SOC 2, GDPR, FedRAMP)

### New Sections Added
- ✅ Technical Architecture Overview
- ✅ Security & Compliance
- ✅ Proven in Production (case studies)
- ✅ Pricing & Support overview
- ✅ Enterprise FAQ

### Design Enhancements
- ✅ Trust blue color for certifications
- ✅ Technical typography for code snippets
- ✅ Specification tables for performance metrics
- ✅ Deployment timeline visualization

---

## Complete Homepage Design (Round 2)

```tsx
/**
 * SuperInstance Homepage - Round 2 (Enterprise-Optimized)
 * File: app/page.tsx
 */

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { WingCard } from '@/components/wing-card'
import { CaseStudyCard } from '@/components/case-study-card'
import { Timeline } from '@/components/timeline'
import { SpecTable } from '@/components/spec-table'

export default function HomePage() {
  return (
    <>
      {/* ========== HERO SECTION ========== */}
      <section className="relative min-h-screen flex items-center justify-center bg-background">
        <div className="absolute inset-0 animated-gradient-bg opacity-20" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
          {/* Navigation */}
          <nav className="flex items-center justify-between mb-20">
            <Logo className="h-10" />
            <div className="flex items-center gap-8">
              <NavLink href="#platform">Platform</NavLink>
              <NavLink href="#customers">Customers</NavLink>
              <NavLink href="#architecture">Architecture</NavLink>
              <NavLink href="#pricing">Pricing</NavLink>
              <Button variant="outline" size="sm">Contact Sales</Button>
            </div>
          </nav>

          {/* Hero Content */}
          <div className="max-w-4xl">
            {/* Compliance Badges */}
            <div className="flex items-center gap-3 mb-6">
              <Badge variant="compliance">SOC 2 Type II</Badge>
              <Badge variant="compliance">GDPR</Badge>
              <Badge variant="compliance">FedRAMP Ready</Badge>
              <Badge variant="research">Research-Validated</Badge>
            </div>

            <h1 className="text-5xl font-semibold text-foreground mb-6">
              Distributed Infrastructure Platform for Critical Workloads
            </h1>

            <p className="text-xl text-muted-text mb-8 max-w-2xl">
              Production-grade consensus, routing, and coordination systems.
              Deploy on your infrastructure or ours with confidence.
            </p>

            {/* Deployment Options */}
            <div className="flex items-center gap-4 mb-8 text-sm text-muted-text">
              <span className="font-medium text-foreground">Deployment:</span>
              <DeploymentBadge label="On-Premises" />
              <DeploymentBadge label="Cloud" />
              <DeploymentBadge label="Hybrid" />
              <DeploymentBadge label="Edge" />
            </div>

            {/* Technical Specs Preview */}
            <div className="bg-card rounded-xl p-6 mb-8 border border-border">
              <div className="grid grid-cols-3 gap-6">
                <MetricCard
                  label="Consensus Speed"
                  value="<100ms (p95)"
                  comparison="10x vs Raft"
                />
                <MetricCard
                  label="Availability"
                  value="99.99%"
                  comparison="99.9% → 99.99%"
                />
                <MetricCard
                  label="Resource Usage"
                  value="-50%"
                  comparison="vs traditional systems"
                />
              </div>
            </div>

            {/* CTAs */}
            <div className="flex gap-4">
              <Button size="lg" variant="primary">
                Start Free Trial
              </Button>
              <Button size="lg" variant="outline">
                Schedule Demo
              </Button>
              <Button size="lg" variant="ghost">
                Read Documentation
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ========== TRUST INDICATORS ========== */}
      <section className="py-16 bg-muted">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-8">
            <p className="text-sm text-muted-text uppercase tracking-wide">
              Trusted by technology leaders
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-8 items-center opacity-60">
            <PartnerLogo name="Stripe" type="fintech" />
            <PartnerLogo name="Coinbase" type="fintech" />
            <PartnerLogo name="Databricks" type="data" />
            <PartnerLogo name="Snowflake" type="data" />
            <PartnerLogo name="Cloudflare" type="infrastructure" />
            <PartnerLogo name="NVIDIA" type="hardware" />
          </div>

          {/* Social Proof Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-12 pt-12 border-t border-border">
            <SocialProofMetric value="100M+" label="Operations per day" />
            <SocialProofMetric value="99.99%" label="Uptime SLA" />
            <SocialProofMetric value="50+" label="Enterprise customers" />
            <SocialProofMetric value="60+" label="Peer-reviewed papers" />
          </div>
        </div>
      </section>

      {/* ========== PLATFORM WINGS ========== */}
      <section id="platform" className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-medium text-foreground mb-4">
              Three Platforms, One Ecosystem
            </h2>
            <p className="text-muted-text">
              Specialized solutions for every use case
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Tensor Platform (formerly SpreadsheetMoment) */}
            <WingCard
              title="Tensor Platform"
              subtitle="Low-Code Distributed Systems"
              tagline="From prototype to production without rewrites"
              icon={<TensorIcon />}
              features={[
                "Visual programming with generated code",
                "Real-time collaboration at team scale",
                "Deploy to Cloudflare, AWS, Azure, or on-prem",
                "Integrated testing and monitoring"
              ]}
              cta="Explore Platform"
              variant="professional"
              badges={["Web App", "Desktop", "API"]}
            />

            {/* Lucineer */}
            <WingCard
              title="Lucineer"
              subtitle="Edge AI Acceleration"
              tagline="50x energy efficiency for inference workloads"
              icon={<CpuIcon />}
              features={[
                "Ternary-weight quantization (3-bit)",
                "Neuromorphic thermal computing",
                "Hardware • Jetson Modules • Cloud APIs",
                "CUDA-optimized with CPU fallback"
              ]}
              cta="Procurement Options"
              variant="cyberpunk"
              badges={["Hardware", "Jetson", "Cloud"]}
            />

            {/* Research & Validation */}
            <WingCard
              title="Research & Validation"
              subtitle="Academic-Backed Technology"
              tagline="Peer-reviewed algorithms you can trust"
              icon={<FlaskIcon />}
              features={[
                "60+ peer-reviewed publications",
                "Open-source implementations (no lock-in)",
                "Reproducible benchmarks and simulations",
                "Active research partnerships"
              ]}
              cta="View Research"
              variant="academic"
              badges={["Open Source", "Papers", "Benchmarks"]}
            />
          </div>
        </div>
      </section>

      {/* ========== TECHNICAL ARCHITECTURE ========== */}
      <section id="architecture" className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left: Architecture Diagram */}
            <div>
              <Badge className="mb-4">Architecture</Badge>
              <h2 className="text-3xl font-medium text-foreground mb-6">
                Built for Production Operations
              </h2>
              <p className="text-muted-text mb-8">
                Our platform handles the complexity of distributed systems so you can focus
                on your business logic. From consensus to routing, we've got you covered.
              </p>

              <ArchitectureDiagram />
            </div>

            {/* Right: Technical Specs */}
            <div>
              <h3 className="text-xl font-medium text-foreground mb-6">
                Performance Specifications
              </h3>

              <SpecTable
                headers={['Metric', 'SuperInstance', 'Traditional']}
                data={[
                  ['Consensus Latency', '<100ms (p95)', '500-1000ms'],
                  ['Throughput', '100K ops/sec/node', '10-20K ops/sec'],
                  ['Byzantine Tolerance', '30% nodes', '20% nodes'],
                  ['Network Overhead', '50% reduction', 'Baseline'],
                  ['Fault Recovery', '<5 seconds', '30-60 seconds'],
                  ['Data Consistency', 'Strong', 'Eventual/Strong']
                ]}
              />

              {/* Code Example */}
              <div className="mt-8">
                <p className="text-sm text-muted-text mb-3">
                  Simple API for complex operations:
                </p>
                <CodeSnippet language="typescript">
                  {`// Propose a transaction
const result = await api.consensus.propose({
  type: 'update',
  data: { key: 'user_123', value: { active: true } },
  timeout: 5000  // 5 second timeout
});

// Automatic consensus, guaranteed delivery
console.log(result.confirmed);  // true`}
                </CodeSnippet>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== PROVEN IN PRODUCTION ========== */}
      <section id="customers" className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-4">Customer Stories</Badge>
            <h2 className="text-3xl font-medium text-foreground mb-4">
              Proven in Production at Scale
            </h2>
            <p className="text-muted-text max-w-2xl mx-auto">
              From startups to Fortune 500, organizations trust SuperInstance for their
              most critical workloads
            </p>
          </div>

          {/* Case Studies */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <CaseStudyCard
              company="FinTech Startup"
              industry="Financial Services"
              useCase="High-frequency trading coordination"
              metrics={[
                { label: "Consensus Speed", value: "10x faster", before: "500ms", after: "50ms" },
                { label: "Uptime", value: "99.999%", detail: "<5min downtime/year" },
                { label: "Annual Savings", value: "$2M", detail: "vs custom solution" }
              ]}
              quote="Replaced our 18-month custom consensus implementation in 3 months.
                     Our engineers love the simplicity."
              author="CTO, Series C FinTech"
              logo="fintech_logo"
            />

            <CaseStudyCard
              company="Enterprise SaaS"
              industry="B2B Software"
              useCase="Multi-region data synchronization"
              metrics={[
                { label: "Resource Usage", value: "-50%", detail: "infrastructure cost" },
                { label: "Data Loss", value: "Zero", detail: "18 months production" },
                { label: "Operations/Day", value: "100M+", detail: "global scale" }
              ]}
              quote="Scaled from 1M to 100M daily operations without re-architecture.
                     The platform just works."
              author="VP Engineering, Enterprise SaaS"
              logo="saas_logo"
            />

            <CaseStudyCard
              company="Research University"
              industry="Academic Research"
              useCase="Distributed ML model training"
              metrics={[
                { label: "Training Speed", value: "3x faster", detail: "convergence time" },
                { label: "Researcher Time", value: "Hours → Weeks", detail: "for prototyping" },
                { label: "Publications", value: "12 papers", detail: "using platform" }
              ]}
              quote="Our researchers build distributed systems in hours, not weeks.
                     It's transformed our lab's productivity."
              author="Principal Investigator, Research University"
              logo="university_logo"
            />
          </div>

          {/* Deployment Timeline */}
          <div className="bg-card rounded-2xl p-8 border border-border">
            <h3 className="text-xl font-medium text-foreground mb-6">
              From Zero to Production: Typical Enterprise Timeline
            </h3>
            <Timeline
              items={[
                {
                  period: "Week 1-2",
                  title: "Proof of Concept",
                  description: "Validate on non-production workloads",
                  deliverables: ["API integration", "Performance benchmark", "Security review"]
                },
                {
                  period: "Week 3-4",
                  title: "Pilot Deployment",
                  description: "Single cluster with monitoring",
                  deliverables: ["Single-region deployment", "Observability integration", "Team training"]
                },
                {
                  period: "Week 5-8",
                  title: "Production Rollout",
                  description: "Multi-cluster with full observability",
                  deliverables: ["Multi-region deployment", "Runbooks established", "24/7 monitoring"]
                },
                {
                  period: "Week 8+",
                  title: "Scale & Optimize",
                  description: "Expand to all workloads",
                  deliverables: ["Additional workloads", "Performance tuning", "Cost optimization"]
                }
              ]}
            />
          </div>
        </div>
      </section>

      {/* ========== SECURITY & COMPLIANCE ========== */}
      <section className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge variant="security">Security First</Badge>
            <h2 className="text-3xl font-medium text-foreground mb-4">
              Enterprise-Grade Security & Compliance
            </h2>
            <p className="text-muted-text max-w-2xl mx-auto">
              Built from the ground up with security as a core requirement,
              not an afterthought
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Certifications */}
            <SecurityCard
              title="Certifications"
              icon={<CertificateIcon />}
              items={[
                { name: "SOC 2 Type II", status: "certified" },
                { name: "GDPR", status: "compliant" },
                { name: "FedRAMP", status: "in-progress" },
                { name: "ISO 27001", status: "planned" }
              ]}
            />

            {/* Data Protection */}
            <SecurityCard
              title="Data Protection"
              icon={<ShieldIcon />}
              items={[
                { name: "Encryption at Rest", detail: "AES-256" },
                { name: "Encryption in Transit", detail: "TLS 1.3" },
                { name: "Key Management", detail: "Customer-controlled" },
                { name: "Data Residency", detail: "Geographic control" }
              ]}
            />

            {/* Access Control */}
            <SecurityCard
              title="Access Control"
              icon={<LockIcon />}
              items={[
                { name: "Authentication", detail: "SAML, OAuth 2.0, MFA" },
                { name: "Role-Based Access", detail: "Granular permissions" },
                { name: "Audit Logging", detail: "Complete traceability" },
                { name: "Secrets Management", detail: "HashiCorp Vault integration" }
              ]}
            />
          </div>

          {/* Security Compliance Badges */}
          <div className="flex justify-center gap-6 mt-12">
            <ComplianceBadge type="soc2" />
            <ComplianceBadge type="gdpr" />
            <ComplianceBadge type="hipaa" />
            <ComplianceBadge type="fedramp" />
          </div>
        </div>
      </section>

      {/* ========== PRICING & SUPPORT ========== */}
      <section id="pricing" className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-medium text-foreground mb-4">
              Transparent Pricing, Enterprise Support
            </h2>
            <p className="text-muted-text">
              Start free, scale with confidence
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {/* Starter */}
            <PricingCard
              name="Starter"
              price="Free"
              description="For development and testing"
              features={[
                "Up to 10 nodes",
                "1M operations/month",
                "Community support",
                "Basic monitoring",
                "Self-service deployment"
              ]}
              cta="Start Free"
            />

            {/* Professional */}
            <PricingCard
              name="Professional"
              price="$999/month"
              description="For production workloads"
              features={[
                "Up to 100 nodes",
                "100M operations/month",
                "Email support (24hr response)",
                "Advanced monitoring & alerting",
                "99.9% uptime SLA",
                "Quarterly business reviews"
              ]}
              cta="Start Trial"
              highlighted
            />

            {/* Enterprise */}
            <PricingCard
              name="Enterprise"
              price="Custom"
              description="For large-scale deployments"
              features={[
                "Unlimited nodes",
                "Unlimited operations",
                "24/7 phone support (1hr response)",
                "Dedicated success manager",
                "99.99% uptime SLA",
                "On-premises deployment",
                "Custom integrations",
                "SLA-backed credits"
              ]}
              cta="Contact Sales"
            />
          </div>

          {/* Support Tiers */}
          <div className="bg-card rounded-2xl p-8 border border-border">
            <h3 className="text-xl font-medium text-foreground mb-6">
              Support & Professional Services
            </h3>
            <SupportComparison
              tiers={[
                {
                  name: "Community",
                  responseTime: "Best effort",
                  channels: ["GitHub Issues", "Discord", "Documentation"],
                  services: ["Self-service resources"]
                },
                {
                  name: "Professional",
                  responseTime: "24 hours",
                  channels: ["Email", "Slack", "Phone (escalation)"],
                  services: ["Onboarding", "Quarterly reviews", "Health checks"]
                },
                {
                  name: "Enterprise",
                  responseTime: "1 hour (severity 1)",
                  channels: ["Dedicated support line", "Slack", "Email", "Phone"],
                  services: ["Dedicated CSM", "On-prem support", "Custom training", "Architecture reviews"]
                }
              ]}
            />
          </div>
        </div>
      </section>

      {/* ========== ENTERPRISE FAQ ========== */}
      <section className="py-20 bg-card">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-medium text-foreground mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-muted-text">
              Everything enterprises need to know
            </p>
          </div>

          <FAQ
            items={[
              {
                q: "How does this compare to Kafka, RabbitMQ, or Redis?",
                a: "SuperInstance provides consensus and coordination, not message queuing. Many customers use us alongside Kafka—we handle the distributed coordination (leader election, configuration management, distributed locking) while Kafka handles message streaming. Think of us as a replacement for etcd, ZooKeeper, or Consul, not Kafka."
              },
              {
                q: "Can we deploy on-premises?",
                a: "Yes. We support on-premises deployment on Linux (deb, rpm, AppImage, Flatpak), cloud (AWS, Azure, GCP via marketplace), and hybrid configurations. Our platform is designed to work wherever you need it."
              },
              {
                q: "What's the typical implementation timeline?",
                a: "Most enterprises complete proof-of-concept in 2 weeks, pilot deployment in weeks 3-4, and full production rollout by week 8. Your team can be productive in days, not months."
              },
              {
                q: "Do we need to hire specialists?",
                a: "No. Our platform is designed for generalist engineers. If your team knows distributed systems basics, they can be productive immediately. We also provide training and onboarding as part of Enterprise plans."
              },
              {
                q: "What about vendor lock-in?",
                a: "Our core consensus and routing algorithms are open-source. You can run the platform yourself or use our managed service. We provide export tools and documented protocols so you're never locked in."
              },
              {
                q: "How do you handle security compliance?",
                a: "We're SOC 2 Type II certified and GDPR compliant. FedRAMP authorization is in progress. We support customer-controlled encryption keys, data residency options, and complete audit logging. Learn more in our security whitepaper."
              }
            ]}
          />
        </div>
      </section>

      {/* ========== CTA SECTION ========== */}
      <section className="py-20 bg-background">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-medium text-foreground mb-6">
            Ready to Transform Your Infrastructure?
          </h2>
          <p className="text-xl text-muted-text mb-8">
            Join the enterprises deploying distributed systems with confidence
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" variant="primary">
              Start Free Trial
            </Button>
            <Button size="lg" variant="outline">
              Schedule Demo
            </Button>
          </div>
          <p className="text-sm text-muted-text mt-6">
            No credit card required • Free tier forever • Cancel anytime
          </p>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer className="py-16 bg-muted">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            <div className="col-span-2">
              <Logo className="h-8 mb-4" />
              <p className="text-sm text-muted-text mb-4">
                Distributed infrastructure platform for critical workloads.
                Deploy with confidence.
              </p>
              <SocialLinks />
            </div>
            <FooterColumn
              title="Product"
              links={[
                { label: "Tensor Platform", href: "#platform" },
                { label: "Lucineer Hardware", href: "#platform" },
                { label: "Research", href: "#research" },
                { label: "Pricing", href: "#pricing" }
              ]}
            />
            <FooterColumn
              title="Resources"
              links={[
                { label: "Documentation", href: "/docs" },
                { label: "API Reference", href: "/docs/api" },
                { label: "Blog", href: "/blog" },
                { label: "Changelog", href: "/changelog" }
              ]}
            />
            <FooterColumn
              title="Company"
              links={[
                { label: "About", href: "/about" },
                { label: "Careers", href: "/careers" },
                { label: "Contact", href: "/contact" },
                { label: "Security", href: "/security" }
              ]}
            />
          </div>
          <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-text">
              © 2026 SuperInstance. All rights reserved.
            </p>
            <LegalLinks />
          </div>
        </div>
      </footer>
    </>
  )
}
```

---

## New Component Specifications

### MetricCard (Hero Technical Specs)
```tsx
function MetricCard({ label, value, comparison }) {
  return (
    <div>
      <p className="text-sm text-muted-text">{label}</p>
      <p className="text-2xl font-semibold text-foreground">{value}</p>
      <p className="text-xs text-trust">{comparison}</p>
    </div>
  )
}
```

### DeploymentBadge
```tsx
function DeploymentBadge({ label }) {
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
      {label}
    </span>
  )
}
```

### SpecTable
```tsx
function SpecTable({ headers, data }) {
  return (
    <table className="w-full">
      <thead>
        <tr className="border-b border-border">
          {headers.map(h => <th key={h} className="text-left py-2 text-sm font-medium">{h}</th>)}
        </tr>
      </thead>
      <tbody>
        {data.map((row, i) => (
          <tr key={i} className="border-b border-border/50">
            {row.map((cell, j) => (
              <td key={j} className={`py-3 text-sm ${j === 1 ? 'text-success font-medium' : 'text-muted-text'}`}>
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
```

### CodeSnippet
```tsx
function CodeSnippet({ language, children }) {
  return (
    <pre className="bg-muted rounded-lg p-4 overflow-x-auto text-sm font-mono">
      <code className={language}>{children}</code>
    </pre>
  )
}
```

### CaseStudyCard
```tsx
function CaseStudyCard({ company, industry, useCase, metrics, quote, author, logo }) {
  return (
    <div className="p-6 rounded-xl bg-card border border-border hover:border-primary/30 transition-all">
      <div className="flex items-center gap-3 mb-4">
        <Logo className="h-8 w-8" />
        <div>
          <p className="font-medium text-foreground">{company}</p>
          <p className="text-xs text-muted-text">{industry}</p>
        </div>
      </div>
      <p className="text-sm text-muted-text mb-4">{useCase}</p>
      <div className="space-y-3 mb-6">
        {metrics.map(m => (
          <div key={m.label} className="flex justify-between items-baseline">
            <span className="text-sm text-muted-text">{m.label}</span>
            <span className="text-lg font-semibold text-success">{m.value}</span>
          </div>
        ))}
      </div>
      <blockquote className="text-sm italic text-foreground mb-4">"{quote}"</blockquote>
      <p className="text-xs text-muted-text">— {author}</p>
    </div>
  )
}
```

### SecurityCard
```tsx
function SecurityCard({ title, icon, items }) {
  return (
    <div className="p-6 rounded-xl bg-card border border-border">
      <div className="flex items-center gap-3 mb-4">
        {icon}
        <h3 className="font-medium text-foreground">{title}</h3>
      </div>
      <ul className="space-y-3">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            <CheckIcon className="w-4 h-4 text-success mt-0.5" />
            <div>
              <span className="text-foreground">{item.name}</span>
              {item.detail && <span className="text-muted-text">: {item.detail}</span>}
              {item.status && <Badge variant={item.status}>{item.status}</Badge>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
```

### PricingCard
```tsx
function PricingCard({ name, price, description, features, cta, highlighted }) {
  return (
    <div className={`p-6 rounded-xl border-2 ${highlighted ? 'border-primary bg-primary/5' : 'border-border bg-card'}`}>
      {highlighted && <Badge className="mb-3">Most Popular</Badge>}
      <h3 className="text-xl font-medium text-foreground mb-2">{name}</h3>
      <p className="text-3xl font-bold text-foreground mb-2">{price}</p>
      <p className="text-sm text-muted-text mb-6">{description}</p>
      <ul className="space-y-3 mb-6">
        {features.map(f => (
          <li key={f} className="flex items-start gap-2 text-sm">
            <CheckIcon className="w-4 h-4 text-primary mt-0.5" />
            <span className="text-foreground">{f}</span>
          </li>
        ))}
      </ul>
      <Button variant={highlighted ? 'primary' : 'outline'} className="w-full">
        {cta}
      </Button>
    </div>
  )
}
```

### Timeline
```tsx
function Timeline({ items }) {
  return (
    <div className="relative">
      {items.map((item, i) => (
        <div key={i} className="flex gap-6 pb-8">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
              {i + 1}
            </div>
            {i < items.length - 1 && <div className="w-0.5 h-full bg-border mt-2" />}
          </div>
          <div className="flex-1 pb-8">
            <p className="text-sm text-primary mb-1">{item.period}</p>
            <h4 className="text-lg font-medium text-foreground mb-2">{item.title}</h4>
            <p className="text-sm text-muted-text mb-3">{item.description}</p>
            <ul className="space-y-1">
              {item.deliverables.map(d => (
                <li key={d} className="text-sm text-muted-text">• {d}</li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  )
}
```

---

## CSS Additions (Round 2)

```css
/* Trust & Security Colors */
:root {
  --color-trust-blue:    oklch(0.55 0.10 250);    /* For certifications */
  --color-security:      oklch(0.60 0.12 210);    /* For security section */
  --color-success:       oklch(0.65 0.15 145);    /* For metrics/success states */
}

/* Badge Variants */
.badge-compliance {
  @apply inline-flex items-center px-3 py-1 rounded-full text-xs font-medium;
  background: oklch(0.55 0.10 250 / 0.1);
  color: oklch(0.55 0.10 250);
  border: 1px solid oklch(0.55 0.10 250 / 0.3);
}

.badge-security {
  @apply inline-flex items-center px-3 py-1 rounded-full text-xs font-medium;
  background: oklch(0.60 0.12 210 / 0.1);
  color: oklch(0.60 0.12 210);
  border: 1px solid oklch(0.60 0.12 210 / 0.3);
}

/* Professional Card Hover */
.card-professional {
  transition: all 0.3s ease-in-out;
}

.card-professional:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px oklch(0 0 145 / 0.08);
  border-color: oklch(0.65 0.14 145 / 0.3);
}
```

---

## Round 2 Summary

### Key Improvements
✅ Removed evolutionary metaphor from hero
✅ Added specific deployment options
✅ Added technical specifications table
✅ Renamed "SpreadsheetMoment" → "Tensor Platform"
✅ Added procurement information
✅ Added compliance badges
✅ Added case studies with metrics
✅ Added security & compliance section
✅ Added pricing transparency
✅ Added enterprise FAQ

### What's Next (Round 3)
Government audience testing with focus on:
- FedRAMP compliance details
- Government procurement vehicles
- Government-specific case studies
- Data handling and clearance requirements

---

**Round 2 Status:** ✅ Complete - Enterprise-Optimized Design Ready
**Last Updated:** 2026-03-14
**Next:** Government audience testing (Round 3)
