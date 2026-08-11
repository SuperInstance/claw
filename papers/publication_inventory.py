#!/usr/bin/env python3
"""
Publication Inventory System
Extracts metadata from all 25 research papers for academic repository submission
"""

import os
import re
from pathlib import Path
from typing import Dict, List, Optional
import json

class PaperMetadata:
    """Extract and structure paper metadata for publication"""

    def __init__(self, paper_dir: Path):
        self.paper_dir = paper_dir
        self.paper_id = paper_dir.name
        self.metadata = {}

    def extract_metadata(self) -> Dict:
        """Extract metadata from paper markdown file"""
        md_files = list(self.paper_dir.glob("*.md"))
        if not md_files:
            return None

        md_file = md_files[0]
        content = md_file.read_text(encoding='utf-8')

        # Extract title (first heading)
        title_match = re.search(r'^#\s+(.+?)(?:\n|$)', content, re.MULTILINE)
        title = title_match.group(1).strip() if title_match else md_file.stem

        # Extract subtitle if present
        subtitle_match = re.search(r'^##\s+(.+?)(?:\n|$)', content, re.MULTILINE)
        subtitle = subtitle_match.group(1).strip() if subtitle_match else ""

        # Extract abstract
        abstract_match = re.search(r'## Abstract\s*\n+(.*?)(?=\n##|\n---|\Z)', content, re.DOTALL)
        abstract = abstract_match.group(1).strip() if abstract_match else ""

        # Extract keywords
        keywords_match = re.search(r'\*\*Keywords:\*\*(.+?)(?:\n|$)', content)
        keywords = []
        if keywords_match:
            keywords = [k.strip() for k in keywords_match.group(1).split(',')]

        # Extract key contributions (if present)
        contributions = []
        contributions_section = re.search(r'### 1\.3 Key Contributions\s*\n+(.*?)(?=\n##|\n---|\Z)', content, re.DOTALL)
        if contributions_section:
            contrib_lines = contributions_section.group(1).strip().split('\n')
            contributions = [line.strip().lstrip('0123456789.-) ')
                           for line in contrib_lines if line.strip() and not line.strip().startswith('##')]

        return {
            'paper_id': self.paper_id,
            'filename': md_file.name,
            'title': title,
            'subtitle': subtitle,
            'abstract': abstract[:500],  # Truncate for readability
            'keywords': keywords,
            'contributions_count': len(contributions),
            'full_path': str(md_file),
            'word_count': len(content.split())
        }

def inventory_all_papers(base_dir: Path) -> List[Dict]:
    """Inventory all papers in specified directories"""
    all_metadata = []

    paper_dirs = [
        base_dir / 'papers' / '31-40',
        base_dir / 'papers' / '51-60',
        base_dir / 'papers' / '61-65'
    ]

    for paper_dir in paper_dirs:
        if not paper_dir.exists():
            continue

        for subdir in sorted(paper_dir.iterdir()):
            if subdir.is_dir() and subdir.name.startswith('P'):
                extractor = PaperMetadata(subdir)
                metadata = extractor.extract_metadata()
                if metadata:
                    all_metadata.append(metadata)

    return all_metadata

def generate_publication_report(metadata: List[Dict]) -> str:
    """Generate comprehensive publication report"""
    report = []
    report.append("=" * 80)
    report.append("SUPERINSTANCE RESEARCH PAPERS - PUBLICATION INVENTORY")
    report.append(f"Generated: 2026-03-15")
    report.append(f"Total Papers: {len(metadata)}")
    report.append("=" * 80)
    report.append("")

    # Summary statistics
    report.append("## SUMMARY STATISTICS")
    report.append("-" * 40)
    total_words = sum(m['word_count'] for m in metadata)
    avg_words = total_words / len(metadata) if metadata else 0
    report.append(f"Total Word Count: {total_words:,}")
    report.append(f"Average Words per Paper: {avg_words:,.0f}")
    report.append(f"Total Keywords: {sum(len(m['keywords']) for m in metadata)}")
    report.append("")

    # Papers by category
    report.append("## PAPERS BY CATEGORY")
    report.append("-" * 40)

    categories = {
        'Phase 3 Extensions (P31-P40)': [m for m in metadata if '31' <= m['paper_id'][1:3] <= '40'],
        'Phase 5 Lucineer (P51-P60)': [m for m in metadata if '51' <= m['paper_id'][1:3] <= '60'],
        'Phase 6 Advanced (P61-P65)': [m for m in metadata if '61' <= m['paper_id'][1:3] <= '65']
    }

    for category, papers in categories.items():
        report.append(f"\n{category}: {len(papers)} papers")

    # Detailed inventory
    report.append("\n" + "=" * 80)
    report.append("DETAILED PAPER INVENTORY")
    report.append("=" * 80)

    for i, paper in enumerate(metadata, 1):
        report.append(f"\n## {i}. {paper['paper_id']}: {paper['title']}")
        if paper['subtitle']:
            report.append(f"    {paper['subtitle']}")
        report.append(f"    File: {paper['filename']}")
        report.append(f"    Words: {paper['word_count']:,}")
        report.append(f"    Keywords: {', '.join(paper['keywords'][:5])}")
        if paper['keywords']:
            report.append(f"    Keywords: {', '.join(paper['keywords'])}")
        report.append(f"    Abstract: {paper['abstract'][:200]}...")
        report.append("")

    return '\n'.join(report)

def main():
    """Main execution"""
    base_dir = Path('C:/Users/casey/polln')

    print("SuperInstance Publication Inventory")
    print("=" * 50)

    # Extract metadata
    metadata = inventory_all_papers(base_dir)

    # Generate report
    report = generate_publication_report(metadata)

    # Save report
    report_path = base_dir / 'papers' / 'PUBLICATION_INVENTORY.md'
    report_path.write_text(report, encoding='utf-8')
    print(f"[+] Inventory report saved: {report_path}")

    # Save JSON metadata
    json_path = base_dir / 'papers' / 'publication_metadata.json'
    json_path.write_text(json.dumps(metadata, indent=2), encoding='utf-8')
    print(f"[+] JSON metadata saved: {json_path}")

    # Print summary
    print(f"\nSummary:")
    print(f"  Total papers: {len(metadata)}")
    print(f"  Phase 3 (P31-40): {sum(1 for m in metadata if '31' <= m['paper_id'][1:3] <= '40')}")
    print(f"  Phase 5 (P51-60): {sum(1 for m in metadata if '51' <= m['paper_id'][1:3] <= '60')}")
    print(f"  Phase 6 (P61-65): {sum(1 for m in metadata if '61' <= m['paper_id'][1:3] <= '65')}")

    return metadata

if __name__ == '__main__':
    main()
