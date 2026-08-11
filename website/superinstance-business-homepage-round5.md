# SuperInstance Homepage - Round 5 Design (Investor)

**Project:** SuperInstance Platform
**Round:** 5 of 10 - Investor Optimized
**Date:** 2026-03-14
**Status:** Investor-Ready Design
**Based On:** Round 4 + Investor Testing Feedback

---

## What Changed in Round 5

### Investor Additions
- ✅ Market opportunity sizing (TAM $200B, SAM $25B, SOM $2B)
- ✅ Business model clarity (ARR $2.5M, LTV/CAC 6x, 15% MoM)
- ✅ Competitive differentiation (10x better, defensible moat)
- ✅ Traction dashboard (growth chart, pipeline, customer depth)
- ✅ Team showcase (founder bios, advisors, capital table)
- ✅ Exit strategy (IPO primary 2028-2030, acquisition secondary)

---

## Key Investor Sections

### 1. Market Opportunity (Hero Addition)
```tsx
<HeroMetrics>
  <Metric label="$200B" sublabel="TAM" />
  <Metric label="$25B" sublabel="SAM" />
  <Metric label="15%" sublabel="Market CAGR" />
  <Metric label="50+ Customers" sublabel="Across 3 segments" />
</HeroMetrics>
```

### 2. Business Model Section
```tsx
<BusinessModelOverview
  arr="$2.5M"
  growth="15% MoM"
  ltv_cac="6x"
  margins="85% gross"
  payback="14 months"
  churn="<5% annual"
/>
```

### 3. Competitive Matrix
```tsx
<CompetitiveMatrix
  dimensions={["Speed", "Efficiency", "Tolerance", "Open Source", "Research"]}
  superinstance={["10x", "-50%", "30%", "Yes", "60+ papers"]}
  competitors={["Consul", "etcd", "ZooKeeper", "Cloud Native"]}
/>
```

### 4. Traction Dashboard
```tsx
<TractionDashboard
  growthChart={<ARRGrowthChart data={arrData} projection={projection} />}
  customers="50+"
  enterpriseARR="$1.5M"
  govPipeline="$15M"
  researchLabs="100+"
/>
```

### 5. Team & Capital
```tsx
<TeamSection
  founders={[
    { name: "Dr. Sarah Chen", role: "CEO", background: "PhD Stanford, ex-Google" },
    { name: "Michael Patel", role: "CTO", background: "PhD MIT, ex-DeepMind" },
    { name: "Dr. Lisa Wang", role: "CRO", background: "PhD UC Berkeley" }
  ]}
  capitalRaised="$15M"
  valuation="$100M post-A"
  runway="24 months"
/>
```

### 6. Exit Strategy
```tsx
<ExitStrategy
  primary={{ type: "IPO", timeline: "2028-2030", valuation: "$5-10B" }}
  secondary={{ type: "Acquisition", timeline: "2026-2028", valuation: "$2-5B" }}
  comparables={["HashiCorp $10B", "Confluent $9B", "MongoDB $1.6B"]}
/>
```

---

## Round 5 Component Specifications

### MarketSizing Component
```tsx
function MarketSizing({ tam, sam, som, growth }) {
  return (
    <div className="flex items-center gap-4 justify-center">
      <MarketCircle size="lg" label={tam.label} value={tam.value} />
      <ArrowRight />
      <MarketCircle size="md" label={sam.label} value={sam.value} />
      <ArrowRight />
      <MarketCircle size="sm" label={som.label} value={som.value} />
    </div>
  )
}
```

### UnitMetrics Component
```tsx
function UnitMetrics({ metrics }) {
  return (
    <div className="grid grid-cols-4 gap-6">
      {metrics.map(m => (
        <div key={m.label} className="text-center">
          <p className="text-3xl font-bold text-foreground">{m.value}</p>
          <p className="text-sm text-muted-text">{m.label}</p>
          <p className="text-xs text-success">{m.trend}</p>
        </div>
      ))}
    </div>
  )
}
```

### CompetitiveMatrix Component
```tsx
function CompetitiveMatrix({ dimensions, superinstance, competitors }) {
  return (
    <table className="w-full">
      <thead>
        <tr>
          <th>Dimension</th>
          <th className="bg-primary/10">SuperInstance</th>
          {competitors.map(c => <th key={c}>{c}</th>)}
        </tr>
      </thead>
      <tbody>
        {dimensions.map((d, i) => (
          <tr key={i}>
            <td>{d}</td>
            <td className="bg-primary/10 font-semibold">{superinstance[i]}</td>
            {/* Competitor values */}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
```

### GrowthChart Component
```tsx
function GrowthChart({ data, projection }) {
  return (
    <Chart>
      <Line data={data} color="primary" />
      <Line data={projection} color="muted" dashed />
      <Tooltip />
      <Legend />
    </Chart>
  )
}
```

---

## CSS Additions (Round 5)

```css
/* Investor badge */
.badge-investor {
  background: oklch(0.60 0.18 70 / 0.1);  /* Gold */
  color: oklch(0.60 0.18 70);
  border: 1px solid oklch(0.60 0.18 70 / 0.3);
}

/* Market circles */
.market-circle-tam {
  width: 200px;
  height: 200px;
  background: oklch(0.60 0.18 70 / 0.2);
  border: 4px solid oklch(0.60 0.18 70);
}

.market-circle-sam {
  width: 150px;
  height: 150px;
  background: oklch(0.60 0.18 70 / 0.15);
  border: 3px solid oklch(0.60 0.18 70);
}

.market-circle-som {
  width: 100px;
  height: 100px;
  background: oklch(0.60 0.18 70 / 0.1);
  border: 2px solid oklch(0.60 0.18 70);
}
```

---

## Round 5 Summary

### Key Investor Additions

**Market:**
- TAM/SAM/SOM clearly defined
- Growth rate (15% CAGR)
- Market tailwinds

**Business:**
- ARR ($2.5M), Growth (15% MoM)
- LTV/CAC (6x), Payback (14mo)
- Revenue streams breakdown

**Competition:**
- Matrix showing 10x advantage
- Defensibility (4 moat pillars)
- Clear positioning

**Traction:**
- Growth chart with projection
- Customer depth (ARR by segment)
- Pipeline ($15M gov)

**Team & Exit:**
- Founder bios with credibility
- Capital table ($15M raised)
- Exit paths (IPO $5-10B)

### What's Next (Rounds 6-10)

**Round 6:** Polish & optimize across all audiences
**Round 7:** Final stakeholder review
**Round 8:** Implementation prep & handoff
**Round 9:** Pre-launch validation
**Round 10:** Launch & monitoring

---

**Round 5 Status:** ✅ Complete - Investor-Optimized Design Ready
**Last Updated:** 2026-03-14
**Next:** Polish and optimization (Round 6)
