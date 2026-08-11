# POLLN Video Transcript Template
**Standard format for video transcripts and closed captioning**

---

## Transcript Format Standards

### File Format
- **Format:** WebVTT (.vtt) for YouTube/platforms
- **Encoding:** UTF-8
- **Line Length:** Max 32 characters per line
- **Lines Per Caption:** Max 2-3 lines
- **Duration:** Max 7 seconds per caption

### WebVTT Template

```webvtt
WEBVTT

00:00:00.000 --> 00:00:05.000
[Music plays]

00:00:05.000 --> 00:00:10.000
Welcome to POLLN,
the Pattern-Organized
Large Language Network.

00:00:10.000 --> 00:00:15.000
In this tutorial,
you'll learn how to build
distributed AI systems.

00:00:15.000 --> 00:00:20.000
Let's get started.
```

### SRT Template (Alternative)

```srt
1
00:00:05,000 --> 00:00:10,000
Welcome to POLLN, the Pattern-Organized
Large Language Network.

2
00:00:10,000 --> 00:00:15,000
In this tutorial, you'll learn how to build
distributed AI systems.

3
00:00:15,000 --> 00:00:20,000
Let's get started.
```

---

## Transcript Guidelines

### Timing Rules

**Optimal Duration:**
- Short phrases: 2-3 seconds
- Medium sentences: 4-5 seconds
- Long sentences: 6-7 seconds (max)

**Timing Breaks:**
- Natural speech pauses
- Comma: 0.5 second pause
- Period: 1 second pause
- Paragraph break: 2 second pause

**Example:**
```
00:00:00.000 --> 00:00:02.500
POLLN is a framework

00:00:02.500 --> 00:00:05.000
for building distributed AI.

00:00:05.000 --> 00:00:08.000
It enables intelligent agents
to collaborate effectively.
```

### Text Formatting

**Capitalization:**
- Sentence case (not all caps)
- Capitalize first word of each caption
- Capitalize proper nouns (POLLN, AI, Python)
- Lowercase for emphasis only

**Punctuation:**
- Include periods for sentences
- Use commas for natural pauses
- Omit filler words (um, uh, like)
- Use three dots (...) for trailing off

**Numbers:**
- Spell out 0-10 (zero, one, ten)
- Use numerals for 11+ (11, 100, 1000)
- Spell out at sentence start
- Include units (5 minutes, not 5)

**Example:**
```
✅ GOOD:
First, create five agents.
Then, scale to 100 agents.

❌ BAD:
First, create 5 agents.
Then, scale to one hundred agents.
```

### Speaker Identification

**Single Speaker:**
```
00:00:00.000 --> 00:00:05.000
Welcome to POLLN.
```

**Multiple Speakers:**
```
00:00:00.000 --> 00:00:05.000
HOST: Welcome to POLLN.

00:00:05.000 --> 00:00:10.000
GUEST: Thanks for having me.

00:00:10.000 --> 00:00:15.000
HOST: Let's dive in.
```

**Narration vs Dialogue:**
```
00:00:00.000 --> 00:00:05.000
[Narrator]
POLLN is a distributed AI framework.

00:00:05.000 --> 00:00:10.000
[Developer]
It's changed how we build systems.
```

### Sound Descriptions

**Important Sounds:**
```
[Music playing]
[Applause]
[Laughter]
[Typing sounds]
[Notification chime]
```

**Technical Sounds:**
```
[Keyboard typing]
[Mouse click]
[Terminal beeps]
[Notification sound]
[Success chime]
```

**Environmental Sounds:**
```
[Background chatter]
[Traffic noise]
[Cafe ambience]
[Office sounds]
```

### On-Screen Text

**Text to Include:**
```
[NEXT: Getting Started]
[Step 1: Install POLLN]
npm install polln
[Step 2: Create Colony]
polln colonies create my-first
```

**Code in Captions:**
```
Type: npm install polln
Then press: Enter
The output shows: Success
```

### Special Considerations

**Technical Terms:**
- Spell phonetically if unfamiliar
- Include brand spellings (POLLN not Polln)
- Use industry-standard abbreviations (API, CLI)
- Write acronyms as spoken (AI not A.I.)

**Foreign Words:**
- Use correct spelling
- Include pronunciation if needed
- Maintain original characters

**Humor/Sarcasm:**
- Use [laughs] for laughter
- Use [sarcastically] if needed
- Maintain context in caption

---

## Transcript Generation Process

### Automated Generation

**Tools:**
1. **YouTube Auto-Generate:**
   - Upload video
   - Wait for processing
   - Download transcript
   - Edit for accuracy

2. **Third-Party Services:**
   - Rev.com (professional)
   - Otter.ai (automated)
   - Descript (integrated editor)
   - Sonix (AI-powered)

3. **Local Tools:**
   - Whisper (OpenAI)
   - Google Speech-to-Text
   - AWS Transcribe

### Manual Editing

**Editing Checklist:**
- [ ] Correct all misheard words
- [ ] Fix timing and synchronization
- [ ] Add punctuation
- [ ] Proper capitalization
- [ ] Number formatting
- [ ] Speaker identification
- [ ] Sound descriptions
- [ ] Technical term accuracy
- [ ] On-screen text inclusion

**Editing Workflow:**
```
1. Auto-generate initial transcript
2. Watch video with transcript
3. Correct errors in real-time
4. Second pass for punctuation
5. Third pass for timing
6. Final review
7. Export to WebVTT/SRT
```

### Quality Standards

**Accuracy:**
- 99%+ accuracy required
- All technical terms correct
- No missing words
- Proper context maintained

**Readability:**
- Natural language flow
- Proper grammar
- Appropriate reading level
- Clear speaker attribution

**Synchronization:**
- Captions match speech timing
- No leading or lagging
- Smooth transitions
- Appropriate duration

---

## Accessibility Considerations

### Closed Captioning

**Benefits:**
- Accessibility for deaf/HoH
- Non-native language support
- Sound-off viewing
- SEO advantages
- Legal compliance

**Requirements:**
- ADA compliance
- WCAG 2.1 guidelines
- Platform specifications
- Character limits
- Timing standards

### Localization

**Translation Preparation:**
- Separate text from timing
- Provide context notes
- Technical term glossary
- Brand name guidelines
- Cultural considerations

**Multi-Language Support:**
```
Original: English
Translations: Spanish, French, German,
            Japanese, Chinese, Korean

File Naming:
transcript_en.vtt
transcript_es.vtt
transcript_fr.vtt
```

---

## File Organization

### Naming Conventions

**Transcript Files:**
```
YYYY-MM-DD_video-title_transcript.vtt
YYYY-MM-DD_video-title_captions.srt
YYYY-MM-DD_video-title_transcript.docx
```

**Language Variants:**
```
transcript_en-US.vtt
transcript_es-ES.vtt
transcript_fr-FR.vtt
transcript_de-DE.vtt
```

### Version Control

**Version Naming:**
```
transcript_v1_draft.vtt
transcript_v2_edited.vtt
transcript_v3_final.vtt
```

**Change Tracking:**
```
v1: Initial auto-generation
v2: Manual editing completed
v3: Final QA approved
```

---

## Tools & Resources

### Transcript Editors

**Free Tools:**
- **YouTube Caption Editor:** Built-in
- **Amara:** Collaborative editing
- **Subtitle Edit:** Open-source
- **Aegisub:** Advanced editor

**Paid Tools:**
- **Rev:** Professional service
- **CaptionHub:** Collaborative
- **Happy Scribe:** AI-powered
- **Simon Says:** Automated

### Style Guides

**References:**
- [BBC Caption Guidelines](https://bbc.co.uk/guidelines)
- [Netflix Style Guide](https://partnerhelp.netflixstudios.com)
- [YouTube Caption Requirements](https://support.google.com/youtube)

### Quality Tools

**Validation:**
- **W3C WebVTT Validator**
- **Caption Check**
- **DOJ Caption Assessment**

---

## Example Complete Transcript

```webvtt
WEBVTT

Kind: captions
Language: en

00:00:00.000 --> 00:00:02.000
[Upbeat music]

00:00:02.000 --> 00:00:05.000
Welcome to POLLN,
the Pattern-Organized
Large Language Network.

00:00:05.000 --> 00:00:09.000
In this tutorial,
you'll learn how to install
POLLN and create your first colony.

00:00:09.000 --> 00:00:13.000
Let's start by checking
our system requirements.

00:00:13.000 --> 00:00:16.000
[Text on screen: Node.js 18+]
You need Node.js version 18 or higher.

00:00:16.000 --> 00:00:20.000
Open your terminal
and type "node --version".

00:00:20.000 --> 00:00:23.000
[Keyboard typing]
node --version

00:00:23.000 --> 00:00:26.000
[Terminal output: v20.10.0]
Great, you have version 20.10.0.

00:00:26.000 --> 00:00:30.000
Now, let's install POLLN globally.

00:00:30.000 --> 00:00:33.000
Type: npm install -g polln

00:00:33.000 --> 00:00:36.000
[Keyboard typing]
npm install -g polln

00:00:36.000 --> 00:00:40.000
[Terminal: Success message]
Perfect! POLLN is now installed.

00:00:40.000 --> 00:00:44.000
Next, let's create
our first project.

00:00:44.000 --> 00:00:48.000
Type: polln init my-first-colony

00:00:48.000 --> 00:00:52.000
This creates a new directory
with all the files you need.

00:00:52.000 --> 00:00:56.000
[Success chime]
Your colony is ready!

00:00:56.000 --> 00:01:00.000
In the next video,
we'll build our first agent.

00:01:00.000 --> 00:01:03.000
See you there!

00:01:03.000 --> 00:01:05.000
[Outro music]
```

---

This template ensures accurate, accessible, and professional transcripts for all POLLN video content.