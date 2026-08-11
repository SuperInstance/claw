# POLLN Video Production Guide
**Comprehensive guide for creating high-quality video content**

---

## Table of Contents
1. [Pre-Production Planning](#pre-production-planning)
2. [Recording Setup](#recording-setup)
3. [Screen Recording Best Practices](#screen-recording-best-practices)
4. [Audio Recording](#audio-recording)
5. [Post-Production](#post-production)
6. [Quality Assurance](#quality-assurance)
7. [Publishing & Distribution](#publishing--distribution)

---

## Pre-Production Planning

### Script Development

**Outline Structure:**
```markdown
# Video Title
## Target Audience
## Learning Objectives
## Scene Breakdown
- Scene 1: Introduction (0:00-0:30)
  - Visual: [description]
  - Audio: [script]
  - Screen: [actions]
```

**Timing Guidelines:**
- Intro/Outro: 15-30 seconds each
- Concept explanation: 1-2 minutes
- Demo/code: 2-3 minutes
- Complex topics: Break into 2-3 minute segments

**Story Planning:**
1. **Hook:** Capture attention in first 15 seconds
2. **Problem:** What challenge does POLLN solve?
3. **Solution:** How does POLLN address it?
4. **Demo:** Show it in action
5. **Recap:** Key takeaways
6. **CTA:** What should viewers do next?

### Resource Planning

**Required Assets:**
- [ ] Script finalized
- [ ] Code examples tested
- [ ] Demo environment ready
- [ ] Screen recording software configured
- [ ] Microphone tested
- [ ] Lighting setup (for talking head)
- [ ] Backup recordings planned

**Time Allocation:**
| Task | Time |
|------|------|
| Script writing | 2-4 hours |
| Demo preparation | 1-2 hours |
| Recording | 2-3 hours |
| Editing | 4-6 hours |
| Review & revisions | 2-3 hours |
| **Total** | **11-18 hours** |

---

## Recording Setup

### Hardware Requirements

**Minimum Setup:**
- Computer: 8GB RAM, 4-core CPU
- Microphone: USB condenser mic
- Screen: 1920x1080 resolution
- Storage: 50GB free space

**Recommended Setup:**
- Computer: 16GB RAM, 8-core CPU, SSD
- Microphone: XLR mic with audio interface
- Secondary monitor: For script/teleprompter
- Lighting: Softbox or ring light
- Webcam: 1080p (for talking head)

### Software Requirements

**Screen Recording:**
- **OBS Studio** (Free, professional)
- **Camtasia** (Paid, all-in-one)
- **ScreenFlow** (Mac, paid)
- **Loom** (Free tier available)

**Audio Recording:**
- **Audacity** (Free)
- **Adobe Audition** (Paid)
- **GarageBand** (Mac, free)

**Video Editing:**
- **DaVinci Resolve** (Free, professional)
- **Final Cut Pro** (Mac, paid)
- **Adobe Premiere Pro** (Paid)
- **CapCut** (Free, good for social)

### Screen Recording Configuration

**OBS Studio Settings:**
```
Video:
  - Resolution: 1920x1080
  - Frame Rate: 60fps
  - Scale Filter: Lanczos

Audio:
  - Sample Rate: 48kHz
  - Channels: Stereo
  - Bitrate: 320kbps

Output:
  - Format: MP4
  - Encoder: NVIDIA NVENC (if available)
  - Rate Control: CBR
  - Bitrate: 10,000 kbps
```

---

## Screen Recording Best Practices

### Visual Preparation

**Desktop Cleanup:**
```
✓ Clean desktop wallpaper (solid color or subtle pattern)
✓ Minimal desktop icons
✓ Close unnecessary applications
✓ Disable notifications
✓ Set consistent resolution (1920x1080)
```

**Application Setup:**
```
Code Editor (VS Code):
  - Theme: One Dark Pro or Dracula
  - Font Size: 14-16px
  - Line Height: 1.6
  - Tab Size: 2 spaces
  - Word Wrap: 80 characters

Terminal:
  - Theme: Matching code editor
  - Font: JetBrains Mono or Fira Code
  - Font Size: 14-16pt
  - Prompt: Clean, minimal

Browser:
  - Resolution: 1920x1080
  - Bookmarks: Hidden
  - Extensions: Minimal
  - Zoom: 100-125%
```

### Recording Techniques

**Cursor Movement:**
- Move cursor smoothly, avoid jerky motions
- Use mouse gestures purposefully
- Highlight elements before clicking
- Pause briefly on important UI elements

**Zoom & Focus:**
- Use zoom-in for code details (125-150%)
- Pan smoothly between areas
- Keep context visible (don't zoom too much)
- Return to full view periodically

**Scrolling:**
- Smooth scrolling (disable scroll acceleration)
- Readable line breaks at scroll points
- Consistent scroll speed
- Pause after scrolling to let viewers catch up

### Code Presentation

**Best Practices:**
```typescript
// ✅ GOOD - Clear, concise, well-commented
const colony = await Colony.create({
  id: 'analytics-colony',
  agentCount: 10,  // Start with 10 agents
  memoryLimit: '4GB'
});

// ❌ BAD - Verbose, uncommented, unclear
const c = await Colony.create({i:'a',a:10,m:'4GB'});
```

**Tips:**
- Simplify examples (remove boilerplate)
- Add explanatory comments
- Use meaningful variable names
- Highlight important lines
- Show errors and solutions

---

## Audio Recording

### Voiceover Recording

**Environment:**
- Quiet room (no echo, reverb)
- Treat reflective surfaces (blankets, acoustic foam)
- Turn off fans, AC, appliances
- Record at same time of day (consistent noise)

**Microphone Technique:**
- Distance: 6-8 inches from mic
- Angle: Slightly off-axis (reduces plosives)
- Pop filter: Essential for plosives
- Shock mount: Isolate from vibrations

**Recording Settings:**
```
Sample Rate: 48kHz
Bit Depth: 24-bit
Channels: Mono (voiceover)
Format: WAV (uncompressed)
```

**Voiceover Tips:**
- Stand up (better breath support)
- Hydrate (water at room temp)
- Warm up (vocal exercises)
- Mark breaths in script
- Record multiple takes
- Smile while speaking (sounds friendlier)

### Audio Quality

**Good Audio:**
- Clear, crisp voice
- Consistent volume
- No background noise
- No plosives or sibilance
- Natural room tone

**Bad Audio:**
- Echo or reverb
- Background noise
- Inconsistent volume
- Distortion or clipping
- Mouth clicks/smacks

**Audio Cleanup (Post-Production):**
1. Noise reduction (gentle)
2. EQ: High-pass filter (80-100Hz)
3. Compression (ratio 3:1)
4. De-ess (reduce sibilance)
5. Normalize (-3dB)

---

## Post-Production

### Editing Workflow

**1. Rough Cut (Assembly)**
- Import all footage
- Organize into bins/folders
- Create timeline
- Arrange scenes in order
- Rough timing

**2. Fine Cut**
- Trim clips precisely
- Add transitions (0.5s dissolve)
- Smooth jumps/cuts
- Pacing adjustments
- Audio sync

**3. Polish**
- Color correction
- Audio mixing
- Music bed
- Sound effects
- Graphics/text overlays

**4. Export**
- Format: H.264 MP4
- Resolution: 1920x1080
- Frame Rate: 60fps
- Bitrate: VBR 2-pass, target 10Mbps
- Audio: AAC, 48kHz, 320kbps

### Graphics & Overlays

**Text Overlays:**
- Font: Inter, Roboto, or Open Sans
- Size: Large enough to read
- Color: High contrast
- Animation: Fade in/out (0.3s)
- Duration: Long enough to read

**Code Highlighting:**
- Background: Semi-transparent dark overlay
- Border: Subtle accent color
- Animation: Slide in from left
- Highlight: Yellow or light blue (subtle)

**Diagram Animation:**
- Build components sequentially
- Smooth transitions
- Consistent timing (0.5s per element)
- Reveal important elements first

### Audio Mixing

**Levels:**
```
Voiceover: -6dB
Music: -20dB to -15dB
Sound Effects: -12dB to -8dB
Peak Level: -3dB (maximum)
```

**Music Selection:**
- Royalty-free sources:
  - Epidemic Sound
  - Artlist
  - YouTube Audio Library
  - Free Music Archive
- Style: Tech, ambient, upbeat
- Tempo: 90-120 BPM
- Mood: Professional, energetic

**Sound Effects:**
- UI clicks: Subtle, clean
- Success chimes: Positive, bright
- Transitions: Smooth whooshes
- Errors: Soft, not harsh

---

## Quality Assurance

### Technical Checklist

**Video Quality:**
- [ ] Resolution: 1920x1080 minimum
- [ ] Frame rate: Consistent 60fps
- [ ] No stuttering or dropped frames
- [ ] Smooth playback
- [ ] Color consistency

**Audio Quality:**
- [ ] Clear voiceover
- [ ] Consistent volume
- [ ] No background noise
- [ ] Balanced mix
- [ ] No distortion

**Content Accuracy:**
- [ ] Code examples work
- [ ] Commands execute successfully
- [ ] Technical details accurate
- [ ] No typos in code
- [ ] URLs and links correct

### Review Process

**Self-Review:**
1. Watch complete video
2. Note timing issues
3. Check audio levels
4. Verify content accuracy
5. Test on different devices

**Peer Review:**
1. Share with colleague
2. Get feedback on:
   - Clarity
   - Pacing
   - Technical accuracy
   - Engagement
   - Production quality

**Test Viewing:**
- Phone (small screen)
- Tablet
- Desktop
- TV (large screen)
- Different audio outputs

---

## Publishing & Distribution

### YouTube Optimization

**Title Template:**
```
[Primary Keyword]: [Descriptive Subtitle] | [Brand/Platform]

Example:
"POLLN Tutorial: Building Multi-Agent Systems | Distributed AI"
```

**Description Template:**
```markdown
[Video summary - 2-3 sentences]

In this video, you'll learn:
• [Key point 1]
• [Key point 2]
• [Key point 3]

[Detailed description - optional]

[Links]
• GitHub: [url]
• Documentation: [url]
• Discord: [url]

[Tags]
#POLLN #AI #Tutorial

[Timestamps]
0:00 - Introduction
0:30 - [Topic 1]
2:00 - [Topic 2]
```

**Thumbnail Specs:**
- Resolution: 1280x720
- Format: JPG or PNG
- Size: Under 2MB
- Style: High contrast, clear text
- Text: Large, readable, minimal

### Platform-Specific Optimization

**YouTube:**
- Long-form content (10-20 min)
- Detailed descriptions
- Chapter markers
- End screens/cards
- Community tab engagement

**Twitter/X:**
- Short clips (30-60 sec)
- Vertical format (9:16)
- Auto-captioning
- Strong visual hook
- Trending hashtags

**LinkedIn:**
- Professional focus
- Business value emphasis
- Native upload preferred
- Article-style posts
- Community engagement

**Instagram:**
- Reels format (9:16)
- Quick cuts
- Music-forward
- Trending audio
- Strong visual hooks

---

## File Organization

### Project Structure
```
video-project/
├── src/
│   ├── recordings/
│   │   ├── screen-recording-01.mp4
│   │   ├── voiceover-01.wav
│   │   └── b-roll/
│   ├── project-files/
│   │   ├── final-cut.pro
│   │   └── assets/
│   ├── exports/
│   │   ├── youtube-version.mp4
│   │   └── social-clips/
│   └── scripts/
│       ├── script.md
│       └── storyboards/
└── docs/
    ├── production-notes.md
    └── changelog.md
```

### Naming Conventions
```
Recordings:
  YYYY-MM-DD_scene-description_take##.ext

Exports:
  YYYY-MM-DD_video-title_v##.ext

Assets:
  asset-type_description_v##.ext
```

---

## Common Issues & Solutions

### Audio Issues
| Problem | Solution |
|---------|----------|
| Echo/reverb | Record in smaller room, add acoustic treatment |
| Background noise | Use noise gate, treat room |
| Inconsistent volume | Use compression, normalize |
| Plosives | Use pop filter, adjust mic angle |

### Video Issues
| Problem | Solution |
|---------|----------|
| Screen recording lag | Lower resolution, close other apps |
| Cursor flickering | Disable pointer trails in OS |
| Blurry text | Use native resolution, disable scaling |
| Color shifting | Calibrate monitor, use consistent lighting |

### Content Issues
| Problem | Solution |
|---------|----------|
| Too long | Cut ruthlessly, focus on essentials |
| Too fast | Add pauses, slow down explanations |
| Unclear explanations | Add more context, use analogies |
| Code errors | Test all examples before recording |

---

## Resources & Tools

### Free Tools
- **OBS Studio:** Screen recording
- **Audacity:** Audio editing
- **DaVinci Resolve:** Video editing
- **Canva:** Thumbnail design
- **Trello:** Project management

### Paid Tools (Recommended)
- **Camtasia:** All-in-one recording/editing
- **Adobe Audition:** Professional audio
- **Final Cut Pro:** Mac video editing
- **Epidemic Sound:** Royalty-free music

### Learning Resources
- YouTube Creator Academy
- Vimeo Video School
- Filmora Tutorial Central
- Wistia Learning Center

---

## Production Timeline Template

### Week 1: Pre-Production
- Day 1-2: Script development
- Day 3-4: Demo preparation
- Day 5: Setup and testing

### Week 2: Production
- Day 1-2: Screen recording
- Day 3-4: Voiceover recording
- Day 5: B-Roll and supplementary footage

### Week 3: Post-Production
- Day 1-3: Rough cut editing
- Day 4-5: Fine cut and polish

### Week 4: Review & Publish
- Day 1-2: Review and revisions
- Day 3: Final export
- Day 4: Thumbnail and metadata
- Day 5: Publishing and promotion

---

This guide provides a comprehensive foundation for creating high-quality video content for POLLN. Adapt and customize based on your specific needs and resources.