#!/usr/bin/env python3
"""
Citation Format Generator
Generates APA, MLA, BibTeX, and other citation formats for all 25 papers
"""

import json
from pathlib import Path
from typing import Dict, List

class CitationGenerator:
    """Generate citations in multiple formats"""

    def __init__(self, metadata_file: Path):
        with open(metadata_file, 'r', encoding='utf-8') as f:
            self.papers = json.load(f)
        self.authors = "SuperInstance Research Team"
        self.year = "2026"
        self.institution = "SuperInstance Project"

    def clean_title(self, title: str) -> str:
        """Clean title for citations"""
        # Remove paper ID prefix
        title = title.replace('P31: ', '').replace('P32: ', '').replace('P33: ', '').replace('P34: ', '').replace('P35: ', '').replace('P36: ', '').replace('P37: ', '').replace('P38: ', '').replace('P39: ', '').replace('P40: ', '').replace('P51: ', '').replace('P52: ', '').replace('P53: ', '').replace('P54: ', '').replace('P55: ', '').replace('P56: ', '').replace('P57: ', '').replace('P58: ', '').replace('P59: ', '').replace('P60: ', '').replace('P61: ', '').replace('P62: ', '').replace('P63: ', '').replace('P64: ', '').replace('P65: ', '')
        # Remove subtitle if present
        if '. ' in title and len(title.split('. ')[0]) < 50:
            title = title.split('. ')[0]
        return title

    def generate_apa(self, paper: Dict) -> str:
        """Generate APA 7th edition citation"""
        title = self.clean_title(paper['title'])

        # For arXiv papers (placeholder)
        citation = f"{self.authors}. ({self.year}). {title}. arXiv preprint arXiv:[XXXX.XXXXX]."

        return citation

    def generate_mla(self, paper: Dict) -> str:
        """Generate MLA 9th edition citation"""
        title = self.clean_title(paper['title'])

        citation = f'"{title}." {self.authors}, {self.year}, arXiv preprint arXiv:[XXXX.XXXXX].'

        return citation

    def generate_chicago(self, paper: Dict) -> str:
        """Generate Chicago 17th edition citation"""
        title = self.clean_title(paper['title'])

        citation = f"{self.authors}. \"{title}.\" arXiv preprint arXiv:[XXXX.XXXXX] ({self.year})."

        return citation

    def generate_harvard(self, paper: Dict) -> str:
        """Generate Harvard style citation"""
        title = self.clean_title(paper['title'])

        citation = f"{self.authors} ({self.year}) '{title}', arXiv preprint arXiv:[XXXX.XXXXX]."

        return citation

    def generate_bibtex(self, paper: Dict) -> str:
        """Generate BibTeX entry"""
        title = self.clean_title(paper['title'])

        # Create BibTeX key
        first_word = title.split()[0].lower()
        key = f"superinstance{self.year}{first_word}"

        bibtex = f"""@misc{{{key},
  title = {{{title}}},
  author = {{{self.authors}}},
  year = {{{self.year}}},
  eprint = {{{{arXiv:XXXX.XXXXX}}}},
  archivePrefix = {{arXiv}},
  primaryClass = {{cs.AI}},
  doi = {{10.5281/zenodo.XXXXXXX}},
  url = {{https://github.com/SuperInstance/SuperInstance-papers}}
}}"""

        return bibtex

    def generate_endnote(self, paper: Dict) -> str:
        """Generate EndNote format"""
        title = self.clean_title(paper['title'])

        endnote = f"""%0 Generic
%T {title}
%A {self.authors}
%D {self.year}
%K arXiv preprint
%R arXiv:XXXX.XXXXX
%U https://github.com/SuperInstance/SuperInstance-papers
%I {self.institution}
"""

        return endnote

    def generate_ris(self, paper: Dict) -> str:
        """Generate RIS format"""
        title = self.clean_title(paper['title'])

        ris = f"""TY - GEN
TI - {title}
AU - {self.authors}
PY - {self.year}
KW - arXiv preprint
M3 - arXiv preprint arXiv:XXXX.XXXXX
UR - https://github.com/SuperInstance/SuperInstance-papers
PB - {self.institution}
ER -"""

        return ris

    def generate_all_formats_for_paper(self, paper: Dict) -> Dict[str, str]:
        """Generate all citation formats for a single paper"""
        return {
            'apa': self.generate_apa(paper),
            'mla': self.generate_mla(paper),
            'chicago': self.generate_chicago(paper),
            'harvard': self.generate_harvard(paper),
            'bibtex': self.generate_bibtex(paper),
            'endnote': self.generate_endnote(paper),
            'ris': self.generate_ris(paper)
        }

    def generate_all_citations(self, output_dir: Path):
        """Generate citation files for all papers"""
        output_dir.mkdir(parents=True, exist_ok=True)

        # Create individual citation files
        for paper in self.papers:
            paper_id = paper['paper_id']
            citations = self.generate_all_formats_for_paper(paper)

            # Save individual citation file
            citation_file = output_dir / f'{paper_id}_citations.txt'
            with open(citation_file, 'w', encoding='utf-8') as f:
                f.write(f"# Citation Formats for {paper_id}\n\n")
                f.write(f"## Title: {self.clean_title(paper['title'])}\n")
                f.write(f"## Authors: {self.authors}\n")
                f.write(f"## Year: {self.year}\n\n")
                f.write("=" * 80 + "\n\n")

                f.write("### APA 7th Edition\n")
                f.write(citations['apa'])
                f.write("\n\n")

                f.write("### MLA 9th Edition\n")
                f.write(citations['mla'])
                f.write("\n\n")

                f.write("### Chicago 17th Edition\n")
                f.write(citations['chicago'])
                f.write("\n\n")

                f.write("### Harvard Style\n")
                f.write(citations['harvard'])
                f.write("\n\n")

                f.write("### BibTeX\n")
                f.write(citations['bibtex'])
                f.write("\n\n")

                f.write("### EndNote\n")
                f.write(citations['endnote'])
                f.write("\n\n")

                f.write("### RIS\n")
                f.write(citations['ris'])
                f.write("\n")

        # Create master BibTeX file
        bibtex_file = output_dir / 'all_papers.bib'
        with open(bibtex_file, 'w', encoding='utf-8') as f:
            f.write("% SuperInstance Research Papers - Complete Bibliography\n")
            f.write(f"% Generated: 2026-03-15\n")
            f.write(f"% Total Papers: {len(self.papers)}\n\n")
            for paper in self.papers:
                f.write(self.generate_bibtex(paper))
                f.write("\n\n")

        # Create master RIS file
        ris_file = output_dir / 'all_papers.ris'
        with open(ris_file, 'w', encoding='utf-8') as f:
            for paper in self.papers:
                f.write(self.generate_ris(paper))
                f.write("\n")

        # Create citation quick reference
        reference_file = output_dir / 'CITATION_QUICK_REFERENCE.md'
        self.generate_quick_reference(reference_file)

    def generate_quick_reference(self, output_file: Path):
        """Generate quick reference guide"""
        content = []
        content.append("# Citation Quick Reference")
        content.append("")
        content.append(f"Generated: 2026-03-15")
        content.append(f"Total Papers: {len(self.papers)}")
        content.append("")
        content.append("## About These Citations")
        content.append("")
        content.append("All citations follow standard academic formats. Update placeholder values:")
        content.append("- **arXiv ID**: Replace `XXXX.XXXXX` with assigned arXiv identifier")
        content.append("- **DOI**: Replace `10.5281/zenodo.XXXXXXX` with Zenodo DOI")
        content.append("- **URL**: Update with final publication URLs")
        content.append("")
        content.append("## Quick Copy Examples")
        content.append("")
        content.append("### APA Format (Most Common)")
        content.append("```")
        for i, paper in enumerate(self.papers[:5], 1):
            content.append(f"{i}. {self.generate_apa(paper)}")
        content.append("```")
        content.append("")
        content.append("### BibTeX Format (LaTeX)")
        content.append("```bibtex")
        for paper in self.papers[:3]:
            content.append(self.generate_bibtex(paper))
        content.append("```")
        content.append("")
        content.append("## Individual Paper Citations")
        content.append("")
        content.append("| Paper | APA | MLA | BibTeX |")
        content.append("|-------|-----|-----|--------|")

        for paper in self.papers:
            title = self.clean_title(paper['title'])
            title_short = title[:40] + '...' if len(title) > 40 else title
            content.append(f"| {paper['paper_id']} | [APA](./{paper['paper_id']}_citations.txt) | [MLA](./{paper['paper_id']}_citations.txt) | [BibTeX](./{paper['paper_id']}_citations.txt) |")

        content.append("")
        content.append("## Bulk Files")
        content.append("")
        content.append(f"- **[all_papers.bib](./all_papers.bib)** - Complete BibTeX bibliography ({len(self.papers)} entries)")
        content.append(f"- **[all_papers.ris](./all_papers.ris)** - Complete RIS file for reference managers")
        content.append("- **Individual citations** - See specific paper files above")
        content.append("")
        content.append("## Citation Format Guides")
        content.append("")
        content.append("- **APA 7th**: https://apastyle.apa.org/")
        content.append("- **MLA 9th**: https://style.mla.org/")
        content.append("- **Chicago**: https://www.chicagomanualofstyle.org/")
        content.append("- **BibTeX**: https://www.bibtex.org/")
        content.append("")
        content.append("## How to Use These Files")
        content.append("")
        content.append("### For LaTeX Users")
        content.append("```latex")
        content.append("\\bibliography{all_papers}")
        content.append("\\bibliographystyle{plain}")
        content.append("```")
        content.append("")
        content.append("### For Word/Google Docs")
        content.append("1. Download individual citation files")
        content.append("2. Copy the format you need (APA, MLA, etc.)")
        content.append("3. Paste into your document")
        content.append("")
        content.append("### For Reference Managers (Zotero, Mendeley, EndNote)")
        content.append("1. Import `all_papers.ris` or `all_papers.bib`")
        content.append("2. Select your citation style")
        content.append("3. Insert citations as needed")

        with open(output_file, 'w', encoding='utf-8') as f:
            f.write('\n'.join(content))

def main():
    """Main execution"""
    base_dir = Path('C:/Users/casey/polln')
    metadata_file = base_dir / 'papers' / 'publication_metadata.json'
    output_dir = base_dir / 'papers' / 'citation_formats'

    print("Citation Format Generator")
    print("=" * 50)

    # Generate citations
    generator = CitationGenerator(metadata_file)
    generator.generate_all_citations(output_dir)

    print(f"[+] Generated citations for {len(generator.papers)} papers")
    print(f"[+] Output directory: {output_dir}")
    print(f"[+] Files created:")
    print(f"  - {len(generator.papers)} individual citation files")
    print(f"  - all_papers.bib (BibTeX)")
    print(f"  - all_papers.ris (EndNote/Zotero)")
    print(f"  - CITATION_QUICK_REFERENCE.md")
    print(f"\n[+] Ready for citation in your research!")

if __name__ == '__main__':
    main()
