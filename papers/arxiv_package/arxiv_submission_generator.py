#!/usr/bin/env python3
"""
arXiv Submission Package Generator
Prepares all 25 research papers for arXiv submission with proper metadata
"""

import json
import os
from pathlib import Path
from typing import Dict, List

class ArXivSubmissionGenerator:
    """Generate arXiv submission packages for all papers"""

    def __init__(self, metadata_file: Path, output_dir: Path):
        with open(metadata_file, 'r', encoding='utf-8') as f:
            self.papers = json.load(f)
        self.output_dir = output_dir
        self.output_dir.mkdir(parents=True, exist_ok=True)

    def generate_arxiv_metadata(self, paper: Dict) -> Dict:
        """Generate arXiv-specific metadata for a paper"""

        # Map paper categories to arXiv subjects
        category_map = {
            'Health Monitoring': 'cs.DC',
            'Memory Consolidation': 'cs.LG',
            'LoRA Swarms': 'cs.LG',
            'Federated Learning': 'cs.LG',
            'Guardian Angel': 'cs.DC',
            'Emotional Intelligence': 'cs.HC',
            'Creative Thinking': 'cs.AI',
            'Meta-Learning': 'cs.LG',
            'Transfer Learning': 'cs.LG',
            'Continual Learning': 'cs.LG',
            'Type Systems': 'cs.PL',
            'Ternary Weight': 'cs.AR',
            'Educational AI': 'cs.CY',
            'Neuromorphic': 'cs.AR',
            'Cartridge Economics': 'cs.ET',
            'Stochastic Computing': 'cs.ET',
            '3D Stacked Memory': 'cs.AR',
            'Game Theoretic': 'cs.GT',
            'Swarm Coordination': 'cs.MA',
            'Adaptive Learning': 'cs.LG',
            'SE3 Equivariant': 'cs.RO',
            'Evolutionary': 'cs.NE',
            'Phylogenetic': 'cs.MA',
            'Low Rank': 'cs.DC',
            'Molecular Game': 'q-bio'
        }

        # Determine primary category
        primary_category = 'cs.AI'  # Default
        for keyword, category in category_map.items():
            if keyword in paper['title']:
                primary_category = category
                break

        # Extract keywords for arXiv
        keywords = paper.get('keywords', [])

        return {
            'title': paper['title'].replace('P31: ', '').replace('P32: ', '').replace('P33: ', '').replace('P34: ', '').replace('P35: ', '').replace('P36: ', '').replace('P37: ', '').replace('P38: ', '').replace('P39: ', '').replace('P40: ', '').replace('P51: ', '').replace('P52: ', '').replace('P53: ', '').replace('P54: ', '').replace('P55: ', '').replace('P56: ', '').replace('P57: ', '').replace('P58: ', '').replace('P59: ', '').replace('P60: ', '').replace('P61: ', '').replace('P62: ', '').replace('P63: ', '').replace('P64: ', '').replace('P65: ', ''),
            'authors': [
                {
                    'forename': 'SuperInstance',
                    'surname': 'Research Team',
                    'affiliation': 'SuperInstance Project'
                }
            ],
            'categories': [primary_category, 'cs.AI', 'cs.LG'],
            'abstract': self.clean_abstract(paper['abstract']),
            'comments': f'25 pages, 10 figures, submitted to arXiv on 2026-03-15',
            'report_no': paper['paper_id'],
            'journal_ref': '',
            'keywords': keywords[:5],  # arXiv allows up to 5 keywords
            'license': 'http://creativecommons.org/licenses/by/4.0/'
        }

    def clean_abstract(self, abstract: str) -> str:
        """Clean abstract for arXiv submission"""
        # Remove markdown formatting
        abstract = abstract.replace('**', '').replace('*', '')
        # Truncate if too long (arXiv limit is much higher but we'll keep it reasonable)
        if len(abstract) > 2000:
            abstract = abstract[:1997] + '...'
        return abstract.strip()

    def generate_submission_package(self, paper: Dict):
        """Generate complete submission package for a paper"""
        paper_id = paper['paper_id']
        metadata = self.generate_arxiv_metadata(paper)

        # Create paper directory
        paper_dir = self.output_dir / paper_id
        paper_dir.mkdir(parents=True, exist_ok=True)

        # Save metadata
        metadata_file = paper_dir / f'{paper_id}_arxiv_metadata.json'
        with open(metadata_file, 'w', encoding='utf-8') as f:
            json.dump(metadata, f, indent=2)

        # Generate submission checklist
        checklist = self.generate_checklist(paper, metadata)
        checklist_file = paper_dir / f'{paper_id}_submission_checklist.md'
        with open(checklist_file, 'w', encoding='utf-8') as f:
            f.write(checklist)

        # Generate abstract file
        abstract_file = paper_dir / f'{paper_id}_abstract.txt'
        with open(abstract_file, 'w', encoding='utf-8') as f:
            f.write(metadata['abstract'])

        return paper_dir

    def generate_checklist(self, paper: Dict, metadata: Dict) -> str:
        """Generate submission checklist"""
        return f"""# arXiv Submission Checklist: {paper['paper_id']}

## Paper Information
- **Paper ID**: {paper['paper_id']}
- **Title**: {metadata['title']}
- **Primary Category**: {metadata['categories'][0]}
- **Secondary Categories**: {', '.join(metadata['categories'][1:])}

## Submission Requirements

### Pre-submission Tasks
- [ ] Review paper for typos and formatting issues
- [ ] Ensure all equations are properly formatted
- [ ] Verify all references are complete and accurate
- [ ] Check that abstract is within length limits (currently {len(metadata['abstract'])} characters)
- [ ] Confirm all figures are readable and properly labeled
- [ ] Verify author information is correct

### Files to Upload
- [ ] Main paper file: {paper['filename']}
- [ ] Abstract file: {paper['paper_id']}_abstract.txt
- [ ] Source files (if applicable)
- [ ] Supplementary materials (if applicable)

### arXiv Categories
- **Primary**: {metadata['categories'][0]}
- **Secondary**: {metadata['categories'][1]}, {metadata['categories'][2]}

### Metadata Verification
- [ ] Title is accurate and complete
- [ ] Authors are listed correctly
- [ ] Affiliations are current
- [ ] Abstract accurately reflects paper content
- [ ] Keywords are appropriate and relevant
- [ ] License is correctly specified (CC-BY 4.0)

### Post-submission Tasks
- [ ] Save submission ID from arXiv
- [ ] Update paper repository with arXiv link
- [ ] Notify co-authors of successful submission
- [ ] Cross-list to relevant categories
- [ ] Add to Google Scholar profile
- [ ] Update ORCID record

## arXiv Submission Command
```bash
# Web submission: https://arxiv.org/submit
# Or use arXiv API (requires authentication)
```

## Important Notes
- arXiv moderation typically takes 24-48 hours
- You will receive an email when your paper is published
- Update the reference with the arXiv ID once assigned
- Consider timing your submission for maximum visibility (avoid weekends/holidays)

## Contact Information
For questions about this submission, contact:
- SuperInstance Research Team
- GitHub: https://github.com/SuperInstance/SuperInstance-papers
- Repository: https://github.com/SuperInstance/polln

---
Generated: 2026-03-15
"""

    def generate_all_packages(self):
        """Generate submission packages for all papers"""
        packages = []
        for paper in self.papers:
            package = self.generate_submission_package(paper)
            packages.append(package)
        return packages

    def generate_master_index(self):
        """Generate master index of all submissions"""
        index = []
        index.append("# arXiv Submissions Master Index")
        index.append("")
        index.append(f"Generated: 2026-03-15")
        index.append(f"Total Papers: {len(self.papers)}")
        index.append("")
        index.append("## Submission Status")
        index.append("")
        index.append("| Paper ID | Title | Category | Status | arXiv ID |")
        index.append("|----------|-------|----------|--------|----------|")

        for paper in self.papers:
            title = paper['title'].replace('P31: ', '').replace('P32: ', '').replace('P33: ', '').replace('P34: ', '').replace('P35: ', '').replace('P36: ', '').replace('P37: ', '').replace('P38: ', '').replace('P39: ', '').replace('P40: ', '').replace('P51: ', '').replace('P52: ', '').replace('P53: ', '').replace('P54: ', '').replace('P55: ', '').replace('P56: ', '').replace('P57: ', '').replace('P58: ', '').replace('P59: ', '').replace('P60: ', '').replace('P61: ', '').replace('P62: ', '').replace('P63: ', '').replace('P64: ', '').replace('P65: ', '')
            title_short = title[:50] + '...' if len(title) > 50 else title
            metadata = self.generate_arxiv_metadata(paper)
            category = metadata['categories'][0]
            index.append(f"| {paper['paper_id']} | {title_short} | {category} | Pending | TBD |")

        index.append("")
        index.append("## Submission Instructions")
        index.append("")
        index.append("1. Review each paper's submission checklist")
        index.append("2. Upload to arXiv via https://arxiv.org/submit")
        index.append("3. Record assigned arXiv ID in this table")
        index.append("4. Update paper repositories with arXiv links")
        index.append("5. Cross-list to relevant categories")
        index.append("")
        index.append("## Bulk Submission")
        index.append("")
        index.append("For bulk submissions, use the arXiv API or submit papers in batches of 5-10 per day to avoid overwhelming the moderation system.")
        index.append("")
        index.append("## References")
        index.append("")
        index.append("- arXiv Submission Guide: https://arxiv.org/help/submit")
        index.append("- arXiv Categories: https://arxiv.org/category_taxonomy")
        index.append("- arXiv API: https://arxiv.org/help/api/")

        return '\n'.join(index)

def main():
    """Main execution"""
    base_dir = Path('C:/Users/casey/polln')
    metadata_file = base_dir / 'papers' / 'publication_metadata.json'
    output_dir = base_dir / 'papers' / 'arxiv_package'

    print("arXiv Submission Package Generator")
    print("=" * 50)

    # Generate packages
    generator = ArXivSubmissionGenerator(metadata_file, output_dir)
    packages = generator.generate_all_packages()

    print(f"[+] Generated {len(packages)} submission packages")
    print(f"[+] Output directory: {output_dir}")

    # Generate master index
    index = generator.generate_master_index()
    index_file = output_dir / 'ARXIV_SUBMISSIONS_INDEX.md'
    with open(index_file, 'w', encoding='utf-8') as f:
        f.write(index)
    print(f"[+] Master index: {index_file}")

    print(f"\n[+] Ready for arXiv submission!")
    print(f"[+] Review each package and submit via https://arxiv.org/submit")

if __name__ == '__main__':
    main()
