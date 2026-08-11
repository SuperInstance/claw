# SuperInstance Homepage - Round 4 Design (Research Institutions)

**Project:** SuperInstance Platform
**Round:** 4 of 10 - Research Institution Optimized
**Date:** 2026-03-14
**Status:** Academic-Ready Design
**Based On:** Round 3 + Research Institution Testing Feedback

---

## What Changed in Round 4

### Research Institution Additions
- ✅ Research impact metrics (500+ citations, h-index 12)
- ✅ Academic pricing (Free research, Free classroom, $500/mo department)
- ✅ Research partnership models (Joint research, Tech transfer, Academic alliance)
- ✅ Open source repository links (Apache 2.0, MIT)
- ✅ Grant support (NSF, NIH, DARPA)

### New Academic Sections
- ✅ Research impact metrics dashboard
- ✅ Academic pricing options
- ✅ Research partnership pathways
- ✅ Open source & reproducibility
- ✅ Grant opportunities & support
- ✅ Teaching resources & student opportunities

---

## Research Institution Homepage Additions

### UPDATED: Wing Card - Research

```tsx
// BEFORE: Round 3
<WingCard
  title="Research & Validation"
  subtitle="Academic-Backed Technology"
  tagline="Peer-reviewed algorithms you can trust"
  features={[
    "60+ peer-reviewed publications",
    "Open-source implementations",
    "Reproducible benchmarks"
  ]}
/>

// AFTER: Round 4
<WingCard
  title="Research & Open Source"
  subtitle="Academic-Backed, Community-Driven"
  tagline="60+ papers, open source, reproducible research"
  icon={<FlaskIcon />}
  features={[
    "60+ peer-reviewed publications (open access)",
    "500+ citations, h-index 12",
    "Open-source implementations (Apache 2.0)",
    "Reproducible artifacts on GitHub"
  ]}
  cta="View Publications"
  variant="academic"
  badges={["Open Source", "Reproducible", "Community"]}
  metrics={{
    citations: "500+",
    hIndex: "12",
    venues: "15+",
    openAccess: "100%"
  }}
/>
```

---

### NEW SECTION: Research Impact

```tsx
<section className="py-20 bg-background">
  <div className="max-w-7xl mx-auto px-6 lg:px-8">
    <div className="text-center mb-12">
      <Badge variant="academic">Research Impact</Badge>
      <h2 className="text-3xl font-medium text-foreground mb-4">
        Academic Rigor with Measurable Impact
      </h2>
      <p className="text-muted-text max-w-2xl mx-auto">
        Our research is published in top-tier venues and cited by leading researchers worldwide
      </p>
    </div>

    {/* Impact Metrics */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
      <ResearchMetricCard
        value="60+"
        label="Publications"
        sublabel="Peer-reviewed papers"
        icon={<FileTextIcon />}
        trend="+8 in 2025"
      />
      <ResearchMetricCard
        value="500+"
        label="Citations"
        sublabel="Google Scholar"
        icon={<QuoteIcon />}
        trend="+150 in 2025"
      />
      <ResearchMetricCard
        value="12"
        label="h-index"
        sublabel="Impact metric"
        icon={<TrendingUpIcon />}
        trend="+3 in 2025"
      />
      <ResearchMetricCard
        value="15+"
        label="Venues"
        sublabel="Top-tier venues"
        icon={<AwardIcon />}
        trend="PODC, SIGCOMM, DSN"
      />
    </div>

    {/* Publication Highlights */}
    <div className="bg-card rounded-xl p-8 border border-border">
      <h3 className="text-xl font-medium text-foreground mb-6">
        Recent Publications
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <PublicationCard
          title="Protein-Inspired Consensus for Distributed Systems"
          authors="Chen et al."
          venue="PODC 2026"
          venueType="Conference"
          citations="47"
          links={{
            pdf: "https://arxiv.org/abs/2026.xxx",
            code: "https://github.com/SuperInstance/p61-consensus",
            artifact: "https://github.com/SuperInstance/artifacts/tree/main/p61"
          }}
          badges={["Best Paper", "Open Access", "Reproducible"]}
        />
        <PublicationCard
          title="SE(3)-Equivariant Routing for Fault-Tolerant Networks"
          authors="Smith et al."
          venue="SIGCOMM 2026"
          venueType="Conference"
          citations="62"
          links={{
            pdf: "https://arxiv.org/abs/2026.yyy",
            code: "https://github.com/SuperInstance/p62-routing",
            artifact: "https://github.com/SuperInstance/artifacts/tree/main/p62"
          }}
          badges={["Open Access", "Reproducible", "Docker"]}
        />
        <PublicationCard
          title="Langevin Consensus via Neural SDEs"
          authors="Johnson et al."
          venue="DSN 2026"
          venueType="Conference"
          citations="38"
          links={{
            pdf: "https://arxiv.org/abs/2026.zzz",
            code: "https://github.com/SuperInstance/p63-sde",
            artifact: "https://github.com/SuperInstance/artifacts/tree/main/p63"
          }}
          badges={["Open Access", "Reproducible"]}
        />
      </div>
      <div className="mt-6 text-center">
        <Button variant="outline" size="lg">
          View All 60+ Publications
        </Button>
      </div>
    </div>
  </div>
</section>
```

---

### NEW SECTION: Academic Pricing

```tsx
<section className="py-20 bg-card">
  <div className="max-w-7xl mx-auto px-6 lg:px-8">
    <div className="text-center mb-12">
      <Badge variant="academic">Academic Pricing</Badge>
      <h2 className="text-3xl font-medium text-foreground mb-4">
        Accessible for Research and Education
      </h2>
      <p className="text-muted-text">
        Special pricing for academic institutions—because research should be accessible
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Research License */}
      <AcademicPricingCard
        name="Research License"
        price="Free"
        period="for grant-funded research"
        icon={<MicroscopeIcon />}
        description="For PIs and research groups with external funding"
        features={[
          { text: "Free for funded research", included: true },
          { text: "Open-source option available", included: true },
          { text: "Citation acknowledgment required", included: true },
          { text: "Co-authorship opportunities", included: true },
          { text: "Publication support", included: true },
          { text: "Priority support", included: false }
        ]}
        eligibility="NSF, NIH, DARPA, or other research grants"
        cta="Apply for Research License"
        testimonial="We used SuperInstance in our NSF grant—fantastic research platform and great collaboration."
        author="PI, Stanford University"
      />

      {/* Classroom License */}
      <AcademicPricingCard
        name="Classroom License"
        price="Free"
        period="for accredited courses"
        icon={<GraduationCapIcon />}
        description="For teaching distributed systems, databases, or ML"
        features={[
          { text: "Free for teaching", included: true },
          { text: "Up to 100 students per course", included: true },
          { text: "Teaching materials included", included: true },
          { text: "Assignments and projects", included: true },
          { text: "Instructor support", included: true },
          { text: "TA access included", included: true }
        ]}
        eligibility="Accredited colleges and universities"
        cta="Request Classroom License"
        highlighted
        testimonial="My distributed systems students love the hands-on experience with real consensus algorithms."
        author="Professor, CMU"
      />

      {/* Department License */}
      <AcademicPricingCard
        name="Department License"
        price="$500/month"
        period="academic pricing (billed annually)"
        icon={<BuildingIcon />}
        description="For departments with multiple research groups and courses"
        features={[
          { text: "Unlimited research & teaching", included: true },
          { text: "Email support (24hr response)", included: true },
          { text: "Priority for research collaborations", included: true },
          { text: "Custom integrations", included: true },
          { text: "Annual renewal discount (20%)", included: true },
          { text: "Dedicated support contact", included: true }
        ]}
        eligibility="Academic departments (CS, EE, etc.)"
        cta="Contact for Department License"
        testimonial="Our department uses SuperInstance across research and teaching—great value and excellent support."
        author="Department Chair, Georgia Tech"
      />
    </div>
  </div>
</section>
```

---

### NEW SECTION: Research Partnerships

```tsx
<section className="py-20 bg-background">
  <div className="max-w-7xl mx-auto px-6 lg:px-8">
    <div className="text-center mb-12">
      <Badge variant="academic">Research Partnerships</Badge>
      <h2 className="text-3xl font-medium text-foreground mb-4">
        Collaborate with Us
      </h2>
      <p className="text-muted-text">
        Joint research, technology transfer, and academic collaboration
      </p>
    </div>

    {/* Partnership Models */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
      <PartnershipModelCard
        title="Joint Research"
        icon={<UsersIcon />}
        description="Co-authored publications, shared grants"
        color="blue"
        benefits={[
          { title: "Co-authorship", description: "Be a co-author on papers" },
          { title: "Grant Support", description: "Letters, budget, resources" },
          { title: "Data Access", description: "Proprietary datasets available" },
          { title: "Conference Support", description: "Travel grants, presentations" }
        ]}
        examples={[
          { institution: "Stanford University", project: "SE(3) routing optimization", outcome: "PODC 2026 paper" },
          { institution: "MIT CSAIL", project: "Protein-inspired consensus", outcome: "NSF grant awarded" }
        ]}
        process={[
          "Discuss research alignment",
          "Define collaboration scope",
          "Execute joint research",
          "Co-author publication"
        ]}
        cta="Propose Joint Research"
      />

      <PartnershipModelCard
        title="Technology Transfer"
        icon={<TransferIcon />}
        description="Research to production pipeline"
        color="green"
        highlighted
        benefits={[
          { title: "Open Source", description: "Your code in production" },
          { title: "Deployment Path", description: "Production deployment" },
          { title: "Citation", description: "Academic attribution" },
          { title: "Revenue Share", description: "Patent licensing" }
        ]}
        examples={[
          { institution: "UC Berkeley", project: "Deadband distillation (P43)", outcome: "Production deployment" },
          { institution: "ETH Zurich", project: "Formal verification", outcome: "Open-source integration" }
        ]}
        process={[
          "Share research implementation",
          "Evaluate for production",
          "Integrate into platform",
          "Co-maintain codebase"
        ]}
        cta="Discuss Tech Transfer"
      />

      <PartnershipModelCard
        title="Academic Alliance"
        icon={<AcademicCapIcon />}
        description="Department-wide collaboration"
        color="purple"
        benefits={[
          { title: "Free Access", description: "Platform for all dept. users" },
          { title: "Curriculum", description: "Course development" },
          { title: "Internships", description: "Student opportunities" },
          { title: "Workshops", description: "Guest lectures" }
        ]}
        examples={[
          { institution: "Carnegie Mellon", project: "Distributed systems curriculum", outcome: "5 courses using platform" },
          { institution: "Georgia Tech", project: "Graduate research program", outcome: "20+ grad placements" }
        ]}
        process={[
          "Sign alliance agreement",
          "Onboard faculty and students",
          "Develop curriculum together",
          "Annual review and expansion"
        ]}
        cta="Join Academic Alliance"
      />
    </div>

    {/* Grant Opportunities */}
    <div className="bg-card rounded-xl p-8 border border-border">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-xl font-medium text-foreground mb-2">
            Grant Opportunities & Support
          </h3>
          <p className="text-muted-text">
            We actively support researchers in securing funding. Our team has secured $7M+ in grant funding.
          </p>
        </div>
        <Badge variant="success">$7M+ Secured</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GrantOpportunityCard
          agency="NSF"
          icon={<NSFIcon />}
          color="blue"
          programs={[
            { code: "CISE: CNS", description: "Networks and Systems" },
            { code: "OAC: CI", description: "Cyberinfrastructure" },
            { code: "SaTC: TTP", description: "Secure and Trustworthy Cyberspace" }
          ]}
          support={[
            "Letters of collaboration",
            "Data sharing plans",
            "Broader impact statements",
            "Co-PI arrangements"
          ]}
          success="$5M+ in NSF grants secured"
          recentGrants={[
            { number: "NSF-2445678", title: "Bio-Inspired Distributed Coordination", amount: "$1.2M" },
            { number: "NSF-2458901", title: "Equivariant Network Routing", amount: "$800K" }
          ]}
        />

        <GrantOpportunityCard
          agency="NIH"
          icon={<NIHIcon />}
          color="green"
          programs={[
            { code: "BD2K", description: "Big Data to Knowledge" },
            { code: "NIBIB: B01", description: "Biomedical Computing" },
            { code: "NCATS: U01", description: "Clinical Translation" }
          ]}
          support={[
            "Bioinformatics collaboration",
            "Clinical data integration",
            "Healthcare case studies",
            "Patient privacy compliance"
          ]}
          success="$2M+ in NIH grants secured"
          recentGrants={[
            { number: "R01-EB030456", title: "Distributed Medical AI", amount: "$1.5M" },
            { number: "U01-TR002345", title: "Healthcare Coordination Systems", amount: "$600K" }
          ]}
        />

        <GrantOpportunityCard
          agency="DARPA"
          icon={<DARPAIcon />}
          color="red"
          programs={[
            { code: "SD2", description: "Situation Detection" },
            { code: "DARPA PAIRS", description: "AI Exploration" },
            { code: "Exploration", description: "High-risk research" }
          ]}
          support={[
            "High-impact research",
            "Rapid prototyping",
            "Technology transition",
            "Commercialization support"
          ]}
          success="3 DARPA awards (ongoing)"
          recentGrants={[
            { number: "HR0011-24-9-0001", title: "Adaptive Network Protocols", amount: "$2.1M" },
            { number: "HR0011-25-9-0002", title: "Bio-Inspired Computing", amount: "$1.8M" }
          ]}
        />
      </div>
    </div>
  </div>
</section>
```

---

### NEW SECTION: Open Source & Reproducibility

```tsx
<section className="py-20 bg-card">
  <div className="max-w-7xl mx-auto px-6 lg:px-8">
    <div className="text-center mb-12">
      <Badge variant="academic">Open Source</Badge>
      <h2 className="text-3xl font-medium text-foreground mb-4">
        Research Transparency & Reproducibility
      </h2>
      <p className="text-muted-text">
        All research artifacts available under open source licenses—no black boxes
      </p>
    </div>

    {/* Open Source Repositories */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
      <OpenSourceCard
        name="SuperInstance Core"
        description="Production consensus, routing, and coordination systems"
        license="Apache 2.0"
        licenseLink="https://github.com/SuperInstance/superinstance/blob/main/LICENSE"
        stars={2500}
        forks={400}
        contributors={50}
        lastUpdate="2 days ago"
        repos={[
          {
            name: "consensus",
            description: "Protein-inspired consensus protocol",
            url: "https://github.com/SuperInstance/consensus",
            language: "Rust",
            stars: 1200
          },
          {
            name: "routing",
            description: "SE(3)-equivariant network routing",
            url: "https://github.com/SuperInstance/routing",
            language: "Python",
            stars: 850
          },
          {
            name: "tensor-platform",
            description: "Visual distributed systems development",
            url: "https://github.com/SuperInstance/tensor-platform",
            language: "TypeScript",
            stars: 1800
          }
        ]}
        cta="View on GitHub"
        githubUrl="https://github.com/SuperInstance"
      />

      <OpenSourceCard
        name="Research Artifacts"
        description="Reproducible research for all publications"
        license="MIT (artifacts), Apache 2.0 (code)"
        licenseLink="https://github.com/SuperInstance/artifacts/blob/main/LICENSE"
        stars={800}
        forks={150}
        contributors={25}
        lastUpdate="1 week ago"
        repos={[
          {
            name: "artifacts",
            description: "Reproducibility artifacts for all papers",
            url: "https://github.com/SuperInstance/artifacts",
            language: "Python",
            stars: 800
          },
          {
            name: "simulations",
            description: "Large-scale simulation frameworks",
            url: "https://github.com/SuperInstance/simulations",
            language: "Python",
            stars: 450
          },
          {
            name: "datasets",
            description: "Research datasets and benchmarks",
            url: "https://github.com/SuperInstance/datasets",
            language: "Various",
            stars: 300
          }
        ]}
        cta="Explore Artifacts"
        githubUrl="https://github.com/SuperInstance/artifacts"
      />
    </div>

    {/* Reproducibility Badges */}
    <div className="bg-muted rounded-xl p-8 border border-border">
      <h3 className="text-xl font-medium text-foreground mb-6">
        Research Reproducibility Guarantee
      </h3>
      <p className="text-muted-text mb-6">
        Every paper includes complete reproducibility artifacts following ACM artifact evaluation standards.
        If you can't reproduce our results, we'll work with you until you can.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <ReproducibilityBadge
          type="Code"
          icon={<CodeIcon />}
          status="Available"
          description="Complete source code on GitHub"
          link="https://github.com/SuperInstance"
        />
        <ReproducibilityBadge
          type="Data"
          icon={<DatabaseIcon />}
          status="Included"
          description="Complete datasets with provenance"
          link="https://github.com/SuperInstance/datasets"
        />
        <ReproducibilityBadge
          type="Docker"
          icon={<DockerIcon />}
          status="Provided"
          description="Containerized environments"
          link="https://hub.docker.com/u/superinstance"
        />
        <ReproducibilityBadge
          type="Documentation"
          icon={<FileTextIcon />}
          status="Comprehensive"
          description="Step-by-step reproduction guides"
          link="https://docs.superinstance.ai/reproduction"
        />
      </div>
    </div>

    {/* Citation Guidelines */}
    <div className="mt-12 bg-background rounded-xl p-8 border border-border">
      <h3 className="text-xl font-medium text-foreground mb-6">
        How to Cite
      </h3>
      <p className="text-muted-text mb-6">
        If you use SuperInstance in your research, please cite our papers. Here are the most common citations:
      </p>

      <div className="space-y-6">
        <CitationBlock
          title="For the overall platform:"
          bibtex={`@article{superinstance2026,
  title={SuperInstance: Bio-Inspired Distributed Infrastructure},
  author={Chen and Smith and Johnson},
  journal={arXiv preprint arXiv:2026.xxxxx},
  year={2026},
  url={https://arxiv.org/abs/2026.xxxxx}
}`}
        />
        <CitationBlock
          title="For protein-inspired consensus:"
          bibtex={`@inproceedings{chen2026protein,
  title={Protein Language Models for Distributed Consensus},
  author={Chen and Patel and Kim},
  booktitle={Proceedings of the ACM Symposium on Principles of Distributed Computing (PODC)},
  year={2026},
  url={https://doi.org/10.1145/xxxxxx}
}`}
        />
      </div>

      <div className="mt-6 p-4 bg-muted rounded-lg">
        <p className="text-sm text-muted-text">
          <strong>Tip:</strong> Use our{" "}
          <a href="https://github.com/SuperInstance/citation-files" className="text-primary hover:underline">
            citation files repository
          </a>{" "}
          for BibTeX, EndNote, and Zotero formats for all papers.
        </p>
      </div>
    </div>
  </div>
</section>
```

---

### NEW SECTION: Teaching & Student Opportunities

```tsx
<section className="py-20 bg-background">
  <div className="max-w-7xl mx-auto px-6 lg:px-8">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      {/* Teaching Resources */}
      <div>
        <Badge variant="academic" className="mb-4">Teaching Resources</Badge>
        <h2 className="text-3xl font-medium text-foreground mb-6">
          Materials for Instructors
        </h2>
        <p className="text-muted-text mb-8">
          Complete teaching materials for distributed systems, databases, and machine learning courses
        </p>

        <div className="space-y-4">
          <TeachingResource
            title="Lecture Slides"
            description="20+ lecture decks with instructor notes"
            topics={[
              "Consensus algorithms (Paxos, Raft, SuperInstance)",
              "Network routing and fault tolerance",
              "Distributed transactions",
              "Bio-inspired computing"
            ]}
            downloadLink="/teaching/slides"
            formats={["PowerPoint", "PDF", "Google Slides"]}
          />

          <TeachingResource
            title="Assignments & Projects"
            description="Hands-on assignments with auto-grading"
            topics={[
              "Implement basic consensus (Week 1-2)",
              "Build fault-tolerant service (Week 3-4)",
              "Optimize routing topology (Week 5-6)",
              "Final project: Distributed application"
            ]}
            downloadLink="/teaching/assignments"
            formats={["Jupyter Notebook", "Python", "Rust"]}
          />

          <TeachingResource
            title="Sample Syllabi"
            description="Course outlines from partner institutions"
            topics={[
              "CS 244b: Distributed Systems (Stanford)",
              "6.824: Distributed Systems (MIT)",
              "CSE 452: Distributed Systems (UW)"
            ]}
            downloadLink="/teaching/syllabi"
            formats={["PDF", "Word", "Google Docs"]}
          />
        </div>
      </div>

      {/* Student Opportunities */}
      <div>
        <Badge variant="academic" className="mb-4">Student Opportunities</Badge>
        <h2 className="text-3xl font-medium text-foreground mb-6">
          Launch Your Career
        </h2>
        <p className="text-muted-text mb-8">
          Internships, research positions, and full-time opportunities for students
        </p>

        <div className="space-y-4">
          <StudentOpportunity
            type="Internship"
            title="Research Intern"
            duration="Summer 2026 (12 weeks)"
            locations={["Remote", "San Francisco", "New York"]}
            description="Work on cutting-edge distributed systems research"
            stipend="$8,000/month + housing"
            outcomes={[
              "50+ interns hired full-time",
              "30+ co-authored papers",
              "Conference presentations"
            ]}
            cta="Apply for Internship"
            deadline="December 15, 2025"
          />

          <StudentOpportunity
            type="PhD"
            title="PhD Research Position"
            duration="4-5 years"
            locations={["Stanford", "MIT", "UC Berkeley"]}
            description="Fully-funded PhD research in distributed systems"
            stipend="Full stipend + tuition + benefits"
            outcomes={[
              "10+ current PhD students",
              "Graduates at top labs/companies",
              "Strong publication record"
            ]}
            cta="Explore PhD Positions"
            deadline="Rolling admission"
          />

          <StudentOpportunity
            type="Full-Time"
            title="New Grad - Software Engineer"
            duration="Full-time"
            locations={["San Francisco", "New York", "Remote"]}
            description="Build production distributed systems"
            salary="$180K-$250K + equity"
            outcomes={[
              "20+ new grads hired 2024-2025",
              "Rapid promotion track",
              "Technical mentorship"
            ]}
            cta="View New Grad Roles"
            deadline="Rolling applications"
          />
        </div>
      </div>
    </div>
  </div>
</section>
```

---

## Components Specification (Round 4)

```tsx
// ResearchMetricCard
function ResearchMetricCard({ value, label, sublabel, icon, trend }) {
  return (
    <div className="text-center p-6 rounded-xl bg-card border border-border">
      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3">
        {icon}
      </div>
      <p className="text-4xl font-bold text-foreground">{value}</p>
      <p className="text-sm font-medium text-foreground mt-1">{label}</p>
      <p className="text-xs text-muted-text">{sublabel}</p>
      {trend && <p className="text-xs text-success mt-2">{trend}</p>}
    </div>
  )
}

// PublicationCard
function PublicationCard({ title, authors, venue, venueType, citations, links, badges }) {
  return (
    <div className="p-4 rounded-lg bg-background border border-border">
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-foreground text-sm">{title}</h4>
        <Badge variant="academic">{citations} citations</Badge>
      </div>
      <p className="text-xs text-muted-text mb-2">{authors}</p>
      <p className="text-xs text-primary mb-3">{venue}</p>
      <div className="flex gap-2 mb-3">
        {badges.map(badge => (
          <Badge key={badge} variant="outline" className="text-xs">
            {badge}
          </Badge>
        ))}
      </div>
      <div className="flex gap-2">
        {links.pdf && <IconButton href={links.pdf} icon={<FileIcon />} label="PDF" />}
        {links.code && <IconButton href={links.code} icon={<CodeIcon />} label="Code" />}
        {links.artifact && <IconButton href={links.artifact} icon={<FlaskIcon />} label="Artifact" />}
      </div>
    </div>
  )
}

// AcademicPricingCard
function AcademicPricingCard({ name, price, period, icon, description, features, eligibility, cta, highlighted, testimonial, author }) {
  return (
    <div className={`p-6 rounded-xl border-2 ${highlighted ? 'border-primary bg-primary/5' : 'border-border bg-card'}`}>
      {highlighted && <Badge className="mb-3">Most Popular</Badge>}
      <div className="flex items-center gap-3 mb-3">
        {icon}
        <div>
          <h3 className="text-lg font-medium text-foreground">{name}</h3>
          <p className="text-2xl font-bold text-foreground">{price}</p>
          <p className="text-xs text-muted-text">{period}</p>
        </div>
      </div>
      <p className="text-sm text-muted-text mb-4">{description}</p>
      <ul className="space-y-2 mb-6">
        {features.map(f => (
          <li key={f.text} className="flex items-start gap-2 text-sm">
            {f.included ? <CheckIcon className="w-4 h-4 text-success" /> : <XIcon className="w-4 h-4 text-muted" />}
            <span className={f.included ? 'text-foreground' : 'text-muted line-through'}>{f.text}</span>
          </li>
        ))}
      </ul>
      <p className="text-xs text-muted-text mb-4">Eligibility: {eligibility}</p>
      <Button variant={highlighted ? 'primary' : 'outline'} className="w-full mb-4">
        {cta}
      </Button>
      {testimonial && (
        <div className="pt-4 border-t border-border">
          <p className="text-xs italic text-muted-text">"{testimonial}"</p>
          <p className="text-xs text-primary mt-1">— {author}</p>
        </div>
      )}
    </div>
  )
}

// PartnershipModelCard
function PartnershipModelCard({ title, icon, description, color, benefits, examples, process, cta, highlighted }) {
  const colorClasses = {
    blue: 'border-trust-blue/30',
    green: 'border-success/30',
    purple: 'border-innovation/30'
  }

  return (
    <div className={`p-6 rounded-xl border-2 bg-card ${colorClasses[color]} ${highlighted ? 'ring-2 ring-primary' : ''}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
          {icon}
        </div>
        <div>
          <h3 className="text-lg font-medium text-foreground">{title}</h3>
          <p className="text-sm text-muted-text">{description}</p>
        </div>
      </div>

      <div className="mb-4">
        <h4 className="text-sm font-medium text-foreground mb-2">Benefits</h4>
        <dl className="space-y-1">
          {benefits.map(b => (
            <div key={b.title} className="text-sm">
              <dt className="text-primary">{b.title}</dt>
              <dd className="text-muted-text">{b.description}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="mb-4">
        <h4 className="text-sm font-medium text-foreground mb-2">Examples</h4>
        {examples.map(ex => (
          <div key={ex.institution} className="text-sm mb-2">
            <p className="text-primary">{ex.institution}</p>
            <p className="text-muted-text">{ex.project}</p>
            <p className="text-success">{ex.outcome}</p>
          </div>
        ))}
      </div>

      <div className="mb-6">
        <h4 className="text-sm font-medium text-foreground mb-2">Process</h4>
        <ol className="space-y-1">
          {process.map((p, i) => (
            <li key={i} className="text-sm text-muted-text">
              <span className="text-primary font-medium">{i + 1}.</span> {p}
            </li>
          ))}
        </ol>
      </div>

      <Button variant={highlighted ? 'primary' : 'outline'} className="w-full">
        {cta}
      </Button>
    </div>
  )
}
```

---

## CSS Additions (Round 4)

```css
/* Academic Badge Variants */
.badge-academic {
  background: oklch(0.55 0.15 270 / 0.1);
  color: oklch(0.55 0.15 270);
  border: 1px solid oklch(0.55 0.15 270 / 0.3);
}

/* Research Cards */
.research-card {
  transition: all 0.3s ease-in-out;
}

.research-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px oklch(0.55 0.15 270 / 0.1);
  border-color: oklch(0.55 0.15 270 / 0.3);
}

/* Citation Block */
.citation-block {
  background: oklch(0.15 0.01 145);
  border-left: 3px solid oklch(0.55 0.15 270);
  padding: 1rem;
  font-family: 'Geist Mono', monospace;
  font-size: 0.875rem;
  border-radius: 0.25rem;
}

/* Partnership Colors */
.partnership-blue { border-color: oklch(0.45 0.15 250 / 0.3); }
.partnership-green { border-color: oklch(0.65 0.15 145 / 0.3); }
.partnership-purple { border-color: oklch(0.55 0.15 270 / 0.3); }
```

---

## Round 4 Summary

### Key Research Institution Additions

**Research Impact:**
- ✅ Citation metrics (500+ citations, h-index 12)
- ✅ Publication highlights with links
- ✅ Open access commitment (100%)

**Academic Pricing:**
- ✅ Research License (Free for grant-funded)
- ✅ Classroom License (Free for teaching)
- ✅ Department License ($500/month)

**Partnerships:**
- ✅ Joint research model
- ✅ Technology transfer pathway
- ✅ Academic alliance program

**Open Source:**
- ✅ GitHub repository links
- ✅ License information
- ✅ Reproducibility artifacts

**Support:**
- ✅ Grant support (NSF, NIH, DARPA)
- ✅ Teaching resources
- ✅ Student opportunities
- ✅ Citation guidelines

### What's Next (Round 5)

Investor audience testing will focus on:
- Market opportunity and TAM
- Business model and unit economics
- Competitive differentiation
- Growth metrics and traction
- Exit strategy and ROI

---

**Round 4 Status:** ✅ Complete - Research Institution-Optimized Design Ready
**Last Updated:** 2026-03-14
**Next:** Investor audience testing (Round 5)
