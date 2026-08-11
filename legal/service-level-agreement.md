# Service Level Agreement (SLA)
**Spreadsheet Moment Platform**

**Last Updated:** March 15, 2026
**Effective Date:** March 15, 2026
**Version:** 2.0

---

## Table of Contents
1. [Overview](#1-overview)
2. [Service Commitment](#2-service-commitment)
3. [Uptime Guarantee](#3-uptime-guarantee)
4. [Response Time Commitments](#4-response-time-commitments)
5. [Service Credits](#5-service-credits)
6. [Maintenance Windows](#6-maintenance-windows)
7. [Exclusions and Exceptions](#7-exclusions-and-exceptions)
8. [Monitoring and Reporting](#8-monitoring-and-reporting)
9. [Credit Request Process](#9-credit-request-process)
10. [Service Tiers](#10-service-tiers)
11. [Emergency Support](#11-emergency-support)
12. [General Provisions](#12-general-provisions)
13. [Contact Information](#13-contact-information)

---

## 1. Overview

### 1.1 Purpose
This Service Level Agreement (SLA) describes the service levels and performance commitments for the Spreadsheet Moment platform (the "Service"). This SLA applies to all paid subscribers.

### 1.2 Scope
This SLA covers:
- **Platform Availability:** Uptime and availability commitments
- **Response Time:** API response time commitments
- **Support Response:** Customer support response time commitments
- **Service Credits:** Credits for failure to meet commitments

### 1.3 Applicability
This SLA applies to:
- **Pro Plan:** Monthly and annual subscribers
- **Enterprise Plan:** Custom SLA available
- **Free Plan:** No SLA coverage

### 1.4 Definitions

| Term | Definition |
|------|------------|
| **"Downtime"** | Period when the Service is unavailable to perform analysis or access spreadsheets |
| **"Scheduled Maintenance"** | Planned maintenance windows with advance notice |
| **"Unscheduled Downtime"** | Downtime outside scheduled maintenance windows |
| **"Response Time"** | Time from request receipt to response completion |
| **"Service Credit"** | Credit applied to future invoices for SLA breaches |
| **"Customer"** | Any paid subscriber to the Service |

---

## 2. Service Commitment

### 2.1 Our Commitment
We are committed to providing a reliable, high-performance Service. We strive to:
- Maintain high availability and uptime
- Deliver fast response times
- Provide excellent customer support
- Minimize service disruptions

### 2.2 Performance Standards
Our performance standards are designed to:
- Be measurable and objective
- Reflect industry best practices
- Provide meaningful protection for customers
- Balance service quality with operational flexibility

---

## 3. Uptime Guarantee

### 3.1 Uptime Commitment
We commit to maintaining the following uptime percentages:

#### 3.1.1 Pro Plan
**Uptime Commitment:** 99.9% monthly uptime

**Downtime Allowance:** Maximum 43.2 minutes per month

**Calculation:**
```
Monthly Minutes: 43,200
99.9% Uptime: 43,176.8 minutes
Downtime Allowance: 43.2 minutes
```

#### 3.1.2 Enterprise Plan
**Uptime Commitment:** 99.95% monthly uptime

**Downtime Allowance:** Maximum 21.6 minutes per month

**Calculation:**
```
Monthly Minutes: 43,200
99.95% Uptime: 43,178.4 minutes
Downtime Allowance: 21.6 minutes
```

#### 3.1.3 Custom SLA
For Enterprise customers with custom SLA requirements:
- Available for contracts with minimum annual commitment of $10,000
- Custom uptime commitments up to 99.99%
- Includes dedicated support and account management

### 3.2 Uptime Measurement

#### 3.2.1 Measurement Method
- **Monitoring:** Continuous monitoring from multiple geographic locations
- **Intervals:** Monitoring checks every 60 seconds
- **Locations:** Monitoring from 5+ locations worldwide
- **Verification:** Third-party monitoring service verification

#### 3.2.2 Availability Definition
The Service is considered "available" when:
- Platform is accessible via HTTPS
- Authentication is functional
- Core features (upload, analysis, results) are operational
- API endpoints respond with appropriate status codes

#### 3.2.3 Downtime Definition
The Service is considered "unavailable" when:
- Platform is not accessible via HTTPS
- Authentication is not functional
- Core features are not operational
- API endpoints do not respond or respond with errors

**NOT Downtime:**
- Individual feature issues (if core features operational)
- Performance degradation (if Service is accessible)
- Third-party service outages (e.g., cloud storage providers)
- Customer-specific issues (e.g., account suspension)

### 3.3 Uptime Calculation

#### 3.3.1 Monthly Uptime Percentage
```
Monthly Uptime % = (Total Minutes in Month - Downtime) / Total Minutes in Month × 100
```

**Example:**
```
Total Minutes in Month: 43,200
Downtime: 30 minutes
Monthly Uptime %: (43,200 - 30) / 43,200 × 100 = 99.93%
```

#### 3.3.2 Uptime Measurement Period
- **Calendar Month:** First day to last day of the month
- **Prorated First Month:** For new subscribers, from activation to end of month
- **Prorated Final Month:** For cancellations, from start of month to cancellation date

---

## 4. Response Time Commitments

### 4.1 API Response Times

#### 4.1.1 Pro Plan
**API Response Time Commitment:** 95th percentile response time under 500ms

**Applies to:**
- Spreadsheet upload API
- Analysis initiation API
- Results retrieval API
- Authentication API

**Measurement:**
- Measured from request receipt to response delivery
- Excludes time for large file uploads
- Measured at our API edge locations
- 95th percentile over calendar month

#### 4.1.2 Enterprise Plan
**API Response Time Commitment:** 95th percentile response time under 250ms

**Includes:**
- Dedicated infrastructure where possible
- Priority routing
- Enhanced monitoring
- Performance optimization

#### 4.1.3 Response Time Measurement

**What's Measured:**
- API endpoint response time
- Database query time
- Processing time

**What's Not Measured:**
- Network latency between customer and our servers
- Large file upload/download time
- Customer's application processing time
- Third-party service response time (e.g., cloud storage)

### 4.2 Web Interface Response Times

#### 4.2.1 Page Load Times
**Target:**
- **Initial Load:** Under 3 seconds (95th percentile)
- **Subsequent Loads:** Under 2 seconds (95th percentile)

**Includes:**
- HTML document load
- CSS and JavaScript load
- Initial rendering

**Excludes:**
- Large spreadsheet upload time
- Large analysis result load time
- Customer's network speed

#### 4.2.2 Feature Response Times
**Target:**
- **Spreadsheet Upload:** Start upload within 2 seconds of clicking
- **Analysis Start:** Start analysis within 5 seconds of submission
- **Results Display:** Display results within 3 seconds of completion

### 4.3 Analysis Processing Times

#### 4.3.1 Pro Plan
**Processing Time Targets:**
- **Small Spreadsheets (< 1,000 rows):** Under 1 minute
- **Medium Spreadsheets (1,000 - 10,000 rows):** Under 5 minutes
- **Large Spreadsheets (10,000 - 100,000 rows):** Under 15 minutes
- **Very Large Spreadsheets (> 100,000 rows):** Best effort

#### 4.3.2 Enterprise Plan
**Processing Time Targets:**
- **Small Spreadsheets (< 1,000 rows):** Under 30 seconds
- **Medium Spreadsheets (1,000 - 10,000 rows):** Under 2 minutes
- **Large Spreadsheets (10,000 - 100,000 rows):** Under 10 minutes
- **Very Large Spreadsheets (> 100,000 rows):** Under 30 minutes

**Note:** These are targets, not SLA commitments. Processing times may vary based on spreadsheet complexity.

---

## 5. Service Credits

### 5.1 Uptime Service Credits

If we fail to meet our uptime commitment, you are eligible for service credits:

#### 5.1.1 Pro Plan Credits

| Monthly Uptime | Service Credit |
|----------------|----------------|
| 99.0% to < 99.9% | 10% of monthly fee |
| 95.0% to < 99.0% | 25% of monthly fee |
| < 95.0% | 50% of monthly fee |

#### 5.1.2 Enterprise Plan Credits

| Monthly Uptime | Service Credit |
|----------------|----------------|
| 99.5% to < 99.95% | 10% of monthly fee |
| 99.0% to < 99.5% | 25% of monthly fee |
| < 99.0% | 50% of monthly fee |

#### 5.1.3 Maximum Credits
- **Maximum Credit per Month:** 50% of monthly fee
- **Credit Form:** Applied as a credit to future invoices
- **Credit Expiration:** Credits expire after 12 months if not used

### 5.2 API Response Time Credits

If we fail to meet our API response time commitment:

**Credit:** 5% of monthly fee

**Condition:** API response time exceeds commitment for two consecutive months.

### 5.3 Support Response Time Credits

If we fail to meet our support response time commitment:

**Credit:** 5% of monthly fee

**Condition:** Average response time exceeds commitment for two consecutive months.

### 5.4 Service Credit Terms and Conditions

#### 5.4.1 Credit Eligibility
- **Paid Subscribers:** Only paid subscribers are eligible for service credits
- **Request Required:** Credits must be requested within 30 days of the end of the billing cycle
- **Verification:** We will verify the SLA breach before applying credits
- **Non-Transferable:** Credits are non-transferable and have no cash value

#### 5.4.2 Credit Application
- **Automatic:** Credits are automatically applied to eligible accounts
- **Notification:** We will notify you when a credit is applied
- **Invoice Deduction:** Credits are automatically deducted from future invoices
- **Refund Option:** For account cancellations, unused credits will be refunded

#### 5.4.3 Limitations
- **Maximum Credits:** Total credits per month cannot exceed 50% of monthly fee
- **No Double Recovery:** Credits are the sole and exclusive remedy for SLA breaches
- **No Consequential Damages:** We are not liable for consequential damages from service failures

---

## 6. Maintenance Windows

### 6.1 Scheduled Maintenance

#### 6.1.1 Maintenance Schedule
- **Frequency:** Generally once per month
- **Duration:** Maximum 2 hours per maintenance window
- **Time:** Typically scheduled during off-peak hours (2:00 AM - 6:00 AM UTC)
- **Notice:** At least 7 days' advance notice

#### 6.1.2 Maintenance Impact
During maintenance windows:
- **Planned Downtime:** Service may be temporarily unavailable
- **Degraded Performance:** Performance may be degraded before or after maintenance
- **Feature Unavailability:** Some features may be unavailable during maintenance

**Note:** Scheduled maintenance does not count toward downtime calculations for SLA purposes.

### 6.2 Emergency Maintenance

#### 6.2.1 Emergency Maintenance Definition
Emergency maintenance is maintenance required to:
- Address critical security vulnerabilities
- Resolve significant service disruptions
- Prevent imminent service failure
- Address data integrity issues

#### 6.2.2 Emergency Maintenance Notice
- **Advance Notice:** Best effort, but may be minimal in emergencies
- **Notification:** Email and in-app notification
- **Duration:** As long as necessary to resolve the emergency

#### 6.2.3 Emergency Maintenance and SLA
Emergency maintenance counts toward downtime calculations for SLA purposes, unless:
- Maintenance is required to address a critical security vulnerability, AND
- Maintenance is completed within 4 hours, AND
- Maintenance affects less than 10% of customers

### 6.3 Maintenance Calendar
We publish a maintenance calendar at:
**URL:** https://spreadsheetmoment.com/status/maintenance

The calendar includes:
- Scheduled maintenance windows
- Recent maintenance activities
- Upcoming planned maintenance

---

## 7. Exclusions and Exceptions

### 7.1 SLA Exclusions
The following are excluded from SLA commitments:

#### 7.1.1 Force Majeure Events
- **Natural Disasters:** Earthquakes, floods, hurricanes, tornadoes
- **War and Terrorism:** Acts of war, terrorism, or civil unrest
- **Government Actions:** Government regulations, orders, or restrictions
- **Infrastructure Failures:** Power grid failures, internet backbone failures
- **Other:** Other events beyond our reasonable control

#### 7.1.2 Third-Party Services
- **Cloud Storage Providers:** Google Drive, Microsoft OneDrive, Dropbox
- **Payment Processors:** Stripe, PayPal
- **Authentication Providers:** Google, Microsoft, Apple
- **CDN Providers:** Cloudflare, Akamai
- **DNS Providers:** Cloudflare, AWS Route 53

**Note:** We work closely with third-party providers to minimize disruptions, but their outages are excluded from our SLA.

#### 7.1.3 Customer Issues
- **Customer Network:** Issues with customer's network or internet connection
- **Customer Equipment:** Issues with customer's devices or equipment
- **Customer Configuration:** Misconfiguration by customer
- **Customer Exceeds Limits:** Customer exceeding resource limits or quotas
- **Customer Account Issues:** Account suspension due to policy violations

#### 7.1.4 Beta and Preview Features
- **Beta Features:** Features labeled "beta," "preview," or "early access"
- **New Features:** Newly released features (for 30 days after release)
- **Experimental Features:** Experimental or research features

#### 7.1.5 Free Trial and Free Plan
- **Free Trial:** Users during free trial period
- **Free Plan:** Users on free plan
- **Evaluation:** Evaluation or test accounts

### 7.2 SLA Exceptions
We may temporarily suspend SLA commitments for:
- **Major Service Upgrades:** Significant platform upgrades or migrations
- **Data Center Moves:** Moving data centers or infrastructure
- **Security Emergencies:** Critical security incidents

**Notice:** We will provide at least 30 days' notice for planned suspensions.

---

## 8. Monitoring and Reporting

### 8.1 Monitoring Systems

#### 8.1.1 Internal Monitoring
We continuously monitor:
- **Platform Availability:** Uptime and downtime
- **Response Times:** API and web interface response times
- **Error Rates:** Error rates by endpoint and feature
- **Resource Utilization:** CPU, memory, disk, network usage
- **Customer Impact:** Number of customers affected by issues

#### 8.1.2 External Monitoring
We use third-party monitoring services to:
- **Verify Uptime:** Independent verification of uptime
- **Geographic Monitoring:** Monitor from multiple locations worldwide
- **Performance Monitoring:** Monitor performance and response times
- **Alerting:** Alert our team to issues

### 8.2 Status Page

#### 8.2.1 Public Status Page
**URL:** https://spreadsheetmoment.com/status

**Includes:**
- Current platform status
- Incident history
- Scheduled maintenance
- Performance metrics

#### 8.2.2 Status Indicators
- **Operational:** All systems operational
- **Degraded Performance:** Performance is degraded
- **Partial Outage:** Some features unavailable
- **Major Outage:** Significant service disruption

#### 8.2.3 Incident Reports
For incidents affecting Service availability:
- **Description:** What happened and impact
- **Timeline:** Incident timeline and resolution
- **Post-Incident Review:** Root cause and prevention measures

### 8.3 Performance Reports

#### 8.3.1 Monthly Performance Reports
Available to all paid subscribers:
- **Uptime:** Monthly uptime percentage
- **Downtime:** Total downtime and incidents
- **Response Times:** API and web interface response times
- **Incidents:** Summary of incidents and resolutions

#### 8.3.2 Accessing Reports
- **Email:** Sent monthly to subscribers
- **Dashboard:** Available in account dashboard
- **API:** Available via API for Enterprise customers

---

## 9. Credit Request Process

### 9.1 How to Request Credits

#### 9.1.1 Automatic Credits
For uptime violations:
- **Automatic:** Credits are automatically calculated and applied
- **Notification:** We will notify you when a credit is applied
- **No Action Required:** No need to submit a request

#### 9.1.2 Manual Requests
For response time or support response time violations:

**Submit Request:**
- **Email:** sla@spreadsheetmoment.com
- **Subject Line:** SLA Credit Request - [Your Account Email]
- **Required Information:**
  - Account email or ID
  - Month or period affected
  - Description of the violation
  - Supporting evidence (if available)

#### 9.1.3 Request Timeline
- **Within 30 Days:** Submit requests within 30 days of the end of the billing cycle
- **Review Time:** We will review requests within 5 business days
- **Application Time:** Credits applied within 10 business days of approval

### 9.2 Credit Verification

#### 9.2.1 Verification Process
We will verify:
- **Subscription Status:** Confirm account was in good standing
- **Violation Occurred:** Confirm the SLA violation occurred
- **Impact:** Confirm the impact on your account
- **Exclusions:** Confirm no exclusions apply

#### 9.2.2 Supporting Evidence
We may request:
- **Screenshots:** Screenshots showing the service disruption
- **Timestamps:** Timestamps showing when the issue occurred
- **Error Messages:** Error messages received
- **Traceroutes:** Network traces showing connectivity issues

#### 9.2.3 Dispute Resolution
If we deny a credit request:
- **Explanation:** We will provide an explanation for the denial
- **Appeal:** You may appeal the decision within 10 business days
- **Final Decision:** Our decision is final

---

## 10. Service Tiers

### 10.1 Plan Comparison

| Feature | Free Plan | Pro Plan | Enterprise Plan |
|---------|-----------|----------|-----------------|
| **Uptime SLA** | None | 99.9% | 99.95% |
| **API Response Time** | None | < 500ms (95th %ile) | < 250ms (95th %ile) |
| **Support Response Time** | Best effort | 24 hours | 4 hours |
| **Service Credits** | None | Yes | Yes |
| **Priority Support** | No | No | Yes |
| **Dedicated Account Manager** | No | No | Yes |

### 10.2 Pro Plan Details

#### 10.2.1 SLA Coverage
- **Uptime Commitment:** 99.9% monthly
- **Response Time Commitment:** < 500ms (95th percentile)
- **Support Response Time:** 24 hours (business days)

#### 10.2.2 Credits
- **Uptime Credits:** 10-50% based on uptime achieved
- **Response Time Credits:** 5% for two consecutive months of non-compliance
- **Support Credits:** 5% for two consecutive months of non-compliance

### 10.3 Enterprise Plan Details

#### 10.3.1 SLA Coverage
- **Uptime Commitment:** 99.95% monthly
- **Response Time Commitment:** < 250ms (95th percentile)
- **Support Response Time:** 4 hours (24/7)

#### 10.3.2 Additional Benefits
- **Custom SLA:** Available for qualifying customers
- **Dedicated Infrastructure:** Isolated resources where possible
- **Priority Routing:** Network and API priority routing
- **Account Manager:** Dedicated account manager
- **Enhanced Monitoring:** Enhanced monitoring and alerting

#### 10.3.3 Credits
- **Uptime Credits:** 10-50% based on uptime achieved
- **Response Time Credits:** 10% for two consecutive months of non-compliance
- **Support Credits:** 10% for two consecutive months of non-compliance

### 10.4 Custom SLA
For customers with custom SLA requirements:

#### 10.4.1 Eligibility
- **Minimum Commitment:** $10,000 annual commitment
- **Contract:** Custom contract with SLA provisions

#### 10.4.2 Custom Options
- **Uptime:** Up to 99.99% uptime commitment
- **Response Times:** Custom response time commitments
- **Support:** Custom support response times
- **Credits:** Custom credit structures

#### 10.4.3 Pricing
- **Premium:** Custom SLA requires premium pricing
- **Contact:** Contact sales@spreadsheetmoment.com for details

---

## 11. Emergency Support

### 11.1 Severity Levels

#### 11.1.1 Severity 1: Critical
**Definition:** Service is completely unavailable or critical functionality is not working.

**Examples:**
- Platform completely down
- Unable to upload spreadsheets
- Unable to access results
- Data corruption or loss

**Response Time:**
- Pro Plan: 12 hours
- Enterprise Plan: 1 hour

#### 11.1.2 Severity 2: High
**Definition:** Critical functionality is severely degraded but workarounds exist.

**Examples:**
- Significant performance degradation
- Frequent errors or timeouts
- Major feature not working

**Response Time:**
- Pro Plan: 24 hours
- Enterprise Plan: 4 hours

#### 11.1.3 Severity 3: Medium
**Definition:** Non-critical functionality is not working or degraded.

**Examples:**
- Minor feature not working
- Occasional errors
- Performance slightly degraded

**Response Time:**
- Pro Plan: 48 hours
- Enterprise Plan: 8 hours

#### 11.1.4 Severity 4: Low
**Definition:** General questions, minor issues, or feature requests.

**Examples:**
- How-to questions
- Feature requests
- Minor UI issues

**Response Time:**
- Pro Plan: 72 hours
- Enterprise Plan: 24 hours

### 11.2 Support Channels

#### 11.2.1 Pro Plan Support
- **Email:** support@spreadsheetmoment.com
- **Knowledge Base:** Self-service documentation
- **Community:** Community forum (peer support)
- **Response Time:** Varies by severity (see above)

#### 11.2.2 Enterprise Plan Support
- **Email:** enterprise@spreadsheetmoment.com
- **Phone:** Direct line for critical issues
- **Chat:** Live chat during business hours
- **Account Manager:** Dedicated account manager
- **Response Time:** Varies by severity (see above)

### 11.3 Support Process

#### 11.3.1 Submitting a Support Request
- **Best Method:** Email (ensures tracking and documentation)
- **Information Required:**
  - Account email or ID
  - Severity assessment (if known)
  - Detailed description of the issue
  - Steps to reproduce (if applicable)
  - Screenshots or error messages (if applicable)

#### 11.3.2 Support Request Handling
- **Acknowledgment:** Automatic acknowledgment of request receipt
- **Triage:** Initial assessment and severity assignment
- **Investigation:** Investigation and diagnosis
- **Resolution:** Resolution or workaround
- **Follow-Up:** Follow-up to ensure resolution is effective

#### 11.3.3 Escalation
If not resolved within expected timeframe:
- **Automatic Escalation:** Automatic escalation to higher support tier
- **Management Escalation:** Escalation to management for critical issues
- **Engineering Escalation:** Escalation to engineering for technical issues

---

## 12. General Provisions

### 12.1 SLA Modifications

#### 12.1.1 Modifications
We may modify this SLA:
- **Notice:** 30 days' notice for material changes
- **Opportunity to Cancel:** Opportunity to cancel without penalty if changes are unfavorable
- **Continued Use:** Continued use constitutes acceptance of changes

#### 12.1.2 Improvements
We may improve this SLA:
- **Immediate Effect:** Improvements take effect immediately
- **No Notice Required:** No notice required for improvements
- **All Plans:** Improvements apply to all customers unless otherwise specified

### 12.2 SLA and Terms of Service

#### 12.2.1 Relationship to Terms of Service
This SLA is part of our Terms of Service:
- **Terms of Service:** General terms and conditions
- **SLA:** Specific service level commitments
- **Consistency:** In case of conflict, SLA prevails for service level matters

#### 12.2.2 Limitation of Liability
The limitation of liability provisions in our Terms of Service apply to this SLA:
- **Total Liability:** Total liability is limited to fees paid
- **Consequential Damages:** No liability for consequential damages
- **Service Credits:** Service credits are the sole remedy for SLA breaches

### 12.3 Warranty Disclaimer

#### 12.3.1 "AS IS" and "AS AVAILABLE"
THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND.

#### 12.3.2 No Additional Warranties
This SLA does not provide additional warranties beyond those in our Terms of Service.

#### 12.3.3 SLA Not a Warranty
The SLA commitments are not warranties but are service level commitments that may be remedied by service credits.

### 12.4 Force Majeure

#### 12.4.1 Force Majeure Events
We are not liable for failures or delays due to events beyond our reasonable control:
- Natural disasters
- War, terrorism, civil unrest
- Government actions
- Infrastructure failures
- Other events beyond our control

#### 12.4.2 Effect on SLA
Force majeure events are excluded from SLA calculations and do not entitle customers to service credits.

---

## 13. Contact Information

### 13.1 SLA Inquiries
For questions about this SLA:

**Email:** sla@spreadsheetmoment.com
**Subject Line:** SLA Inquiry
**Address:** [Insert Business Address]
**Phone:** [Insert Phone Number]

### 13.2 Support
For technical support:

**Email:** support@spreadsheetmoment.com
**Enterprise:** enterprise@spreadsheetmoment.com
**Knowledge Base:** https://spreadsheetmoment.com/docs
**Community Forum:** https://community.spreadsheetmoment.com

### 13.3 Credit Requests
To request service credits:

**Email:** sla@spreadsheetmoment.com
**Subject Line:** SLA Credit Request - [Your Account Email]

### 13.4 Sales
For Enterprise or custom SLA inquiries:

**Email:** sales@spreadsheetmoment.com
**Subject Line:** Enterprise or Custom SLA Inquiry
**Phone:** [Insert Sales Phone Number]

---

## Acknowledgment

By subscribing to a paid plan, you acknowledge that you have read, understood, and agree to this Service Level Agreement.

---

**Spreadsheet Moment**
*Committed to Excellence and Reliability*

---

*Disclaimer: This document is a template for informational purposes. Consult with a qualified attorney for legal advice specific to your situation and jurisdiction.*
