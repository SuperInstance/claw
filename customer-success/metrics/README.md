# Customer Success - Success Metrics and Health Scores

**Version:** 1.0.0
**Last Updated:** 2026-03-15
**Owner:** Customer Success Operations

---

## Overview

This document defines the metrics, health scores, and key performance indicators (KPIs) used to measure customer success, predict churn, identify upsell opportunities, and drive continuous improvement at Spreadsheet Moment.

---

## Health Score Framework

### Health Score Definition

The **Customer Health Score** is a composite metric (0-100) that indicates the overall health and likelihood of retention for each customer account. It combines multiple data points into a single, actionable score.

### Health Score Components

**Component 1: Product Engagement (40 points)**

**Weekly Active Usage (15 points)**
- 15 points: 7+ days/week active
- 12 points: 5-6 days/week active
- 9 points: 3-4 days/week active
- 5 points: 1-2 days/week active
- 0 points: Inactive

**Feature Depth (10 points)**
- 10 points: 5+ advanced features used
- 8 points: 3-4 advanced features used
- 5 points: 1-2 advanced features used
- 2 points: Basic features only
- 0 points: No feature usage

**Session Duration (10 points)**
- 10 points: 30+ minutes average
- 8 points: 15-29 minutes average
- 5 points: 5-14 minutes average
- 2 points: < 5 minutes average
- 0 points: No meaningful sessions

**Collaboration Activity (5 points)**
- 5 points: 3+ collaborators
- 3 points: 1-2 collaborators
- 1 point: No collaboration but sharing enabled
- 0 points: No collaboration

---

**Component 2: Account Strength (25 points)**

**Account Age (5 points)**
- 5 points: 90+ days
- 3 points: 30-89 days
- 1 point: 7-29 days
- 0 points: < 7 days

**Data Volume (5 points)**
- 5 points: 1000+ cells across all spreadsheets
- 3 points: 100-999 cells
- 1 point: 10-99 cells
- 0 points: < 10 cells

**Spreadsheet Count (5 points)**
- 5 points: 10+ spreadsheets
- 3 points: 3-9 spreadsheets
- 1 point: 1-2 spreadsheets
- 0 points: No spreadsheets

**Integration Usage (5 points)**
- 5 points: 3+ integrations active
- 3 points: 1-2 integrations
- 0 points: No integrations

**Mobile Usage (5 points)**
- 5 points: Regular mobile usage
- 3 points: Occasional mobile usage
- 0 points: No mobile usage

---

**Component 3: Value Realization (20 points)**

**Time to First Value (5 points)**
- 5 points: Achieved first value within 24 hours
- 3 points: Achieved within 7 days
- 1 point: Achieved within 30 days
- 0 points: Not yet achieved

**Feature Adoption (5 points)**
- 5 points: 50%+ of available features used
- 3 points: 25-49% of features used
- 1 point: 10-24% of features used
- 0 points: < 10% of features used

**Workflow Integration (5 points)**
- 5 points: Daily workflow integration
- 3 points: Weekly workflow integration
- 1 point: Occasional use
- 0 points: No workflow integration

**Success Milestones (5 points)**
- 5 points: 5+ milestones achieved
- 3 points: 3-4 milestones achieved
- 1 point: 1-2 milestones achieved
- 0 points: No milestones

---

**Component 4: Sentiment and Satisfaction (15 points)**

**NPS Score (5 points)**
- 5 points: Promoter (9-10)
- 3 points: Passive (7-8)
- 0 points: Detractor (0-6)

**Support Sentiment (5 points)**
- 5 points: Positive sentiment (4.5+ stars)
- 3 points: Neutral sentiment (3-4 stars)
- 0 points: Negative sentiment (< 3 stars)

**Feature Requests (5 points)**
- 5 points: Active constructive feedback
- 3 points: Occasional feedback
- 1 point: Rare feedback
- 0 points: No feedback

---

### Health Score Interpretation

**Score Ranges:**

**90-100: Excellent (Green)**
- Characteristics: Highly engaged, power users, advocates
- Risk Level: Very Low
- Action: Cultivate as champions, request testimonials, case studies

**70-89: Healthy (Green)**
- Characteristics: Regular usage, good adoption, satisfied
- Risk Level: Low
- Action: Encourage advanced features, nurture relationships

**50-69: At Risk (Yellow)**
- Characteristics: Inconsistent usage, limited adoption
- Risk Level: Medium
- Action: Proactive outreach, training offers, check-ins

**30-49: Critical (Orange)**
- Characteristics: Minimal usage, disengaged
- Risk Level: High
- Action: Immediate intervention, success plan, executive sponsorship

**0-29: Imminent Churn (Red)**
- Characteristics: No usage, negative sentiment
- Risk Level: Very High
- Action: Retention campaign, discount offers, feedback collection

---

## Engagement Metrics Tracking

### Daily Metrics

**Daily Active Users (DAU)**
- Definition: Unique users with meaningful activity
- Measurement: Authentication + 1+ actions
- Target: 30% of total users

**Daily Session Duration**
- Definition: Average time spent per session
- Measurement: Session start to end timestamps
- Target: 15+ minutes

**Daily Feature Usage**
- Definition: Features used per user
- Measurement: Feature event tracking
- Target: 3+ features per user

### Weekly Metrics

**Weekly Active Users (WAU)**
- Definition: Unique users active in 7-day period
- Measurement: DAU aggregation
- Target: 50% of total users

**Weekly Active Rate**
- Definition: WAU / Total Users
- Target: > 50%

**Feature Adoption Rate**
- Definition: Users using feature / Total users
- Measurement: Feature-specific tracking
- Target: Varies by feature (20-60%)

### Monthly Metrics

**Monthly Active Users (MAU)**
- Definition: Unique users active in 30-day period
- Measurement: WAU aggregation
- Target: 70% of total users

**Stickiness (WAU/MAU)**
- Definition: How often monthly users use weekly
- Target: > 60%

**Retention Rate**
- Definition: Users retained month-over-month
- Target: > 85%

---

## Churn Prediction Indicators

### Leading Indicators (Early Warning)

**Usage Decline Patterns**
- 50%+ decrease in session frequency (7 days)
- 60%+ decrease in feature usage (14 days)
- 70%+ decrease in time spent (7 days)

**Engagement Loss Signals**
- No logins for 14+ days
- No new spreadsheets created (30 days)
- No collaboration activity (30 days)
- No advanced feature usage (60 days)

**Sentiment Deterioration**
- NPS score drop of 3+ points
- Negative support interactions (2+ in month)
- Increase in support tickets related to frustration
- Declining satisfaction survey scores

**Account Changes**
- User count decrease (team accounts)
- Plan downgrade
- Payment method changes
- Key user departures

### Lagging Indicators (Confirmed Risk)

**Churn Behaviors**
- Export/download all data
- Cancel subscription
- Request account deletion
- Public negative feedback

**Competitor Activity**
- Mention of competitor in support tickets
- Search queries about alternatives
- Competitor tool integration

### Churn Risk Scoring

**High Risk (Score: 70-100)**
- 3+ leading indicators present
- 1+ lagging indicator present
- Health score below 40
- Recent negative sentiment

**Medium Risk (Score: 40-69)**
- 2 leading indicators present
- Health score 40-59
- Declining engagement trend

**Low Risk (Score: 0-39)**
- 0-1 leading indicators present
- Health score 60+
- Stable or growing engagement

---

## Upsell Opportunity Signals

### Expansion Signals

**Usage-Based Signals**
- Approaching plan limits (80%+)
- Regular hitting of feature caps
- Request for advanced features
- Increase in team size/activity

**Behavioral Signals**
- Consistent power user behavior
- Exploration of premium features
- Requests for enterprise capabilities
- Advanced use cases

**Organizational Signals**
- Team expansion/hiring
- Department-wide adoption
- Parent company interest
- Budget increase

**Engagement Signals**
- High product satisfaction
- Advocacy behavior (referrals, testimonials)
- Participation in beta programs
- Feature request volume

### Upsell Readiness Score

**Score Components:**

**Need Indication (40 points)**
- Plan limit proximity (15 points)
- Feature request quality (15 points)
- Use case complexity (10 points)

**Timing Readiness (30 points)**
- Budget cycle alignment (10 points)
- Project timing (10 points)
- Decision maker readiness (10 points)

**Relationship Strength (30 points)**
- Trust level (10 points)
- Champion identification (10 points)
- Stakeholder engagement (10 points)

**Upsell Score Interpretation:**
- 80-100: Immediate opportunity
- 60-79: Cultivate for next quarter
- 40-59: Long-term opportunity
- < 40: Not ready

---

## Customer Satisfaction Surveys

### Net Promoter Score (NPS)

**Survey Question:**
"How likely are you recommend Spreadsheet Moment to a colleague or friend?"

**Scale:** 0-10

**Score Calculation:**
- NPS = % Promoters (9-10) - % Detractors (0-6)

**Survey Triggers:**
- 30 days after signup
- 90 days after signup
- 180 days after signup
- After major feature use
- After support interaction
- Quarterly for long-term users

**Benchmark Targets:**
- SaaS Industry Average: 30
- Good: 50
- Excellent: 70+
- Spreadsheet Moment Target: 60

---

### Customer Satisfaction Score (CSAT)

**Survey Question:**
"How satisfied are you with [specific aspect]?"

**Scale:** 1-5 stars

**Survey Aspects:**
- Overall satisfaction
- Product features
- Ease of use
- Customer support
- Value for money
- Reliability

**Survey Triggers:**
- After support ticket resolution
- After onboarding completion
- After feature adoption
- After training session
- Monthly random sample

**Benchmark Targets:**
- Industry Average: 4.0/5.0
- Good: 4.3/5.0
- Excellent: 4.7/5.0
- Spreadsheet Moment Target: 4.5/5.0

---

### Customer Effort Score (CES)

**Survey Question:**
"How easy was it to [complete task]?"

**Scale:** 1-7 (1 = Very Difficult, 7 = Very Easy)

**Survey Tasks:**
- Resolve support issue
- Complete onboarding
- Set up integration
- Create complex spreadsheet
- Use advanced features

**Survey Triggers:**
- After support resolution
- After onboarding
- After feature use
- After setup completion

**Benchmark Targets:**
- Industry Average: 5.0/7.0
- Good: 5.5/7.0
- Excellent: 6.2/7.0
- Spreadsheet Moment Target: 6.0/7.0

---

## Success Dashboard Templates

### Executive Dashboard

**Key Metrics:**
- Total Customer Health Score
- Customer Lifetime Value (CLV)
- Net Revenue Retention (NRR)
- Gross Revenue Retention (GRR)
- NPS Trend
- Churn Rate

**Visualizations:**
- Health score distribution (pie chart)
- Revenue retention trend (line chart)
- NPS over time (line chart)
- Churn by cohort (bar chart)
- Top risk accounts (table)

**Refresh Rate:** Daily

---

### CSM Dashboard

**Key Metrics:**
- Assigned accounts health
- At-risk accounts list
- Upsell opportunities pipeline
- Support ticket volume
- Customer activity feed
- Scheduled check-ins

**Visualizations:**
- Account health scores (list with indicators)
- Engagement trends (sparklines)
- Upsell pipeline (funnel chart)
- Activity timeline (feed)
- Action items (task list)

**Refresh Rate:** Real-time

---

### Product Dashboard

**Key Metrics:**
- Feature adoption rates
- User engagement patterns
- Time to value metrics
- Usage frequency distribution
- Power user identification
- Feature request themes

**Visualizations:**
- Feature adoption heatmap
- Engagement funnel
- User segments (pie chart)
- Feature request word cloud
- Power user activity (scatter plot)

**Refresh Rate:** Weekly

---

### Support Dashboard

**Key Metrics:**
- Ticket volume by type
- Response time metrics
- Resolution rate
- Customer satisfaction by ticket
- Churn correlation with support
- Feature request extraction

**Visualizations:**
- Ticket volume trend (line chart)
- Response time distribution (histogram)
- Satisfaction by category (bar chart)
- Churn prediction correlation (scatter plot)
- Common issues (word cloud)

**Refresh Rate:** Daily

---

## Metrics Calculation Formulas

### Customer Health Score

```
Health Score = (Product Engagement × 0.40) +
               (Account Strength × 0.25) +
               (Value Realization × 0.20) +
               (Sentiment and Satisfaction × 0.15)
```

### Net Revenue Retention (NRR)

```
NRR = (Starting MRR + Expansion - Downgrade - Churn) / Starting MRR × 100
```

### Customer Lifetime Value (CLV)

```
CLV = (ARPU × Gross Margin) / Churn Rate

Where:
ARPU = Average Revenue Per User
Gross Margin = Revenue - Cost of Goods Sold
Churn Rate = Customer churn percentage
```

### Time to First Value (TTFV)

```
TTFV = Timestamp of first valuable action - Timestamp of signup
```

### Stickiness

```
Stickiness = DAU / MAU × 100
```

### Viral Coefficient

```
Viral Coefficient = (Invitations Sent × Conversion Rate) / Total Users
```

---

## Data Collection and Privacy

### Data Sources

**Product Analytics:**
- User activity logs
- Feature usage events
- Session tracking
- Error monitoring

**CRM Data:**
- Account information
- Subscription details
- Communication history
- Support tickets

**Survey Data:**
- NPS responses
- CSAT ratings
- CES scores
- Open-ended feedback

**Financial Data:**
- Revenue metrics
- Payment history
- Subscription changes
- Refund data

### Privacy Considerations

**Data Anonymization:**
- Personal data removal for analysis
- Aggregation for reporting
- Pseudonymization for tracking

**Consent Management:**
- Opt-in for surveys
- Data usage permissions
- Communication preferences

**Data Retention:**
- Activity data: 90 days detailed, 365 days aggregated
- Survey data: 730 days
- Support tickets: 1825 days
- Financial data: 2555 days (regulatory)

**Access Control:**
- Role-based access
- Data access logging
- Audit trails

---

## Alert Thresholds and Triggers

### Health Score Alerts

**Critical Alerts:**
- Health score drops below 40
- Health score drops by 20+ points in 7 days
- Key account health score below 50

**Warning Alerts:**
- Health score drops below 60
- Health score drops by 10+ points in 7 days
- Multiple accounts from same company at-risk

### Churn Risk Alerts

**High Priority:**
- Account cancellation request
- Data export activity
- Competitor mention in support
- Payment failure (3+ days)

**Medium Priority:**
- Usage decline > 50%
- No activity 14+ days
- Negative survey response
- Support ticket escalation

### Opportunity Alerts

**Upsell Ready:**
- Health score > 80
- Upsell score > 80
- Plan limit approaching (90%+)
- Feature request for premium capability

**Advocate Potential:**
- NPS score 9-10
- High product engagement
- Community participation
- Referral activity

---

## Related Documentation

- [Onboarding Documentation](../onboarding/README.md)
- [Education Program](../education/README.md)
- [Playbooks](../playbooks/README.md)
- [Support Operations](../../support/operations/README.md)

---

## Contact Information

**Customer Success Operations:**
- Lead: [Name] - [Email]
- Data Analyst: [Name] - [Email]
- Dashboard Admin: [Name] - [Email]

**For questions about metrics:**
- Email: metrics@spreadsheetmoment.com
- Slack: #cs-metrics
- Documentation: docs.spreadsheetmoment.com/metrics

---

*Last Updated: 2026-03-15 | Next Review: 2026-04-15*
