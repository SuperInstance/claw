# Screen Reader Testing Guide
## Spreadsheet Moment Platform - WCAG 2.1 Level AA

This guide provides comprehensive testing procedures for screen reader compatibility across Spreadsheet Moment platform.

---

## Testing Overview

### Screen Readers to Test
- **NVDA** (Windows) - Free, open source
- **JAWS** (Windows) - Commercial, most common in enterprise
- **VoiceOver** (macOS/iOS) - Built-in Apple screen reader
- **TalkBack** (Android) - Built-in Android screen reader

### Test Priority
1. **NVDA** - Primary testing target (free, widely used)
2. **VoiceOver** - Secondary target (iOS/macOS users)
3. **JAWS** - Tertiary target (enterprise users)
4. **TalkBack** - Mobile testing

---

## NVDA Testing Procedures

### Installation and Setup
1. Download NVDA from https://www.nvaccess.org/
2. Install with default settings
3. Configure NVDA:
   - Open NVDA menu (NVDA + N)
   - Preferences → Settings
   - Set speech rate to comfortable level
   - Enable "Speak typed characters"
   - Enable "Speak object position"

### Keyboard Shortcuts
```
NVDA + Q          Quit NVDA
NVDA + Ctrl + K   Keyboard help (press keys to hear function)
NVDA + B          Read all (from current position)
NVDA + Down Arrow Start reading; press again to continue
NVDA + Up Arrow   Read previous line
NVDA + H          Read current heading
NVDA + S          Read current link
NVDA + F          Next heading
NVDA + Shift + F  Previous heading
NVDA + K          Next link
NVDA + Shift + K  Previous link
NVDA + D          Next landmark
NVDA + Shift + D  Previous landmark
NVDA + F7         List all links
NVDA + F6          List all headings
NVDA + Ctrl + D   Read current document title
Tab               Move to next focusable element
Shift + Tab       Move to previous focusable element
Enter             Activate button or link
Space             Toggle checkbox or press button
```

### Test Scenarios

#### 1. Page Navigation
**Steps:**
1. Navigate to http://localhost:3000
2. Press NVDA + Ctrl + D to hear page title
3. Press NVDA + D to cycle through landmarks
4. Press NVDA + F6 to list all headings
5. Navigate through headings with NVDA + F

**Expected Results:**
- Page title announced: "Spreadsheet Moment - SuperInstance.ai"
- Landmarks announced: "banner", "navigation", "main", "contentinfo"
- Heading structure is logical and hierarchical
- Heading levels announced correctly (h1, h2, etc.)

**Record Results:**
- [ ] Page title announced correctly
- [ ] All landmarks announced
- [ ] Heading structure is logical
- [ ] Navigation between headings works

---

#### 2. Skip Navigation
**Steps:**
1. Navigate to any page
2. Press Tab to focus skip link
3. Press Enter to activate
4. Verify focus moves to main content

**Expected Results:**
- Skip link is announced when focused
- Pressing Enter moves focus to main content
- Main content landmark is announced

**Record Results:**
- [ ] Skip link exists and is announced
- [ ] Skip link functions correctly
- [ ] Focus moves to main content

---

#### 3. Link Navigation
**Steps:**
1. Press NVDA + F7 to open links list
2. Navigate through links with arrow keys
3. Press Enter on link to visit
4. Use NVDA + K to navigate between links

**Expected Results:**
- All links have descriptive text
- Link purpose is clear from text alone
- URL is announced for external links
- Link destination is clear

**Record Results:**
- [ ] All links have accessible names
- [ ] Link purpose is clear
- [ ] No "click here" or ambiguous links
- [ ] External links identified

---

#### 4. Button Testing
**Steps:**
1. Navigate to buttons with Tab
2. Listen to button announcements
3. Activate with Enter or Space
4. Verify action is performed

**Expected Results:**
- Button text/label is announced
- Button role is announced
- State is announced (disabled, pressed, etc.)
- Activation works with keyboard

**Record Results:**
- [ ] All buttons have accessible labels
- [ ] Button role is announced
- [ ] Button state is announced
- [ ] Buttons activate with Enter/Space

---

#### 5. Form Testing (Future)
**Steps:**
1. Navigate to form fields
2. Verify labels are announced
3. Enter data and verify announcement
4. Submit form

**Expected Results:**
- Label announced before field
- Required status announced
- Input type announced (text, email, etc.)
- Error messages announced

**Record Results:**
- [ ] Form labels announced correctly
- [ ] Required fields identified
- [ ] Input type is clear
- [ ] Validation errors announced

---

#### 6. Image Testing
**Steps:**
1. Navigate to images with arrow keys
2. Listen to alt text announcements
3. Verify purpose is clear

**Expected Results:**
- Decorative images not announced
- Informative images have descriptive alt text
- Complex images have long descriptions
- Icons have accessible labels

**Record Results:**
- [ ] All images have alt text
- [ ] Alt text is descriptive
- [ ] Decorative images hidden
- [ ] Icons have labels

---

#### 7. Focus Management
**Steps:**
1. Navigate with Tab through page
2. Listen to focus announcements
3. Verify focus indicators are visible
4. Check focus doesn't get trapped

**Expected Results:**
- Focus always visible to screen reader user
- Focus order is logical
- No focus traps
- Focus indicators have good contrast

**Record Results:**
- [ ] Focus always announced
- [ ] Focus order is logical
- [ ] No keyboard traps
- [ ] Focus indicators visible

---

## JAWS Testing Procedures

### Installation and Setup
1. Install JAWS from Freedom Scientific
2. Launch JAWS
3. Configure speech settings

### Keyboard Shortcuts
```
Insert + Q         Quit JAWS
Insert + 1         Keyboard help
Insert + Down Arrow Start reading
Insert + Up Arrow   Read current line
Insert + H          Read current heading
Insert + F7         List links
Insert + F6         List headings
Insert + Ctrl + 1   Jump to heading level 1
Insert + Ctrl + 2   Jump to heading level 2
Insert + Ctrl + 3   Jump to heading level 3
```

### Test Scenarios
Use the same test scenarios as NVDA, adapting for JAWS shortcuts.

---

## VoiceOver Testing Procedures (macOS)

### Activation
1. Press Command + F5 to toggle VoiceOver
2. Or go to System Preferences → Accessibility → VoiceOver

### Keyboard Shortcuts
```
Command + F5       Toggle VoiceOver
VO + Left/Right     Navigate between items
VO + Shift + Down   Interact with element
VO + Shift + Up     Stop interacting
VO + U             Open rotor
VO + I             Navigate by item type
VO + H             Next heading
VO + Shift + H     Previous heading
VO + L             Next link
VO + Shift + L     Previous link
VO + R             Next rotor item
VO + Command + ;   Accessibility inspector
```

### Test Scenarios
1. Navigate with VO + Left/Right arrows
2. Use rotor to navigate by headings
3. Test all interactive elements
4. Verify announcements

---

## TalkBack Testing Procedures (Android)

### Activation
1. Go to Settings → Accessibility → TalkBack
2. Toggle TalkBack on
3. Confirm OK

### Gestures
```
Swipe right        Next item
Swipe left         Previous item
Double tap         Activate
Swipe up/down      Change reading control
Swipe right then left  Local context menu
```

### Test Scenarios
1. Navigate with swipe gestures
2. Test all interactive elements
3. Verify announcements

---

## Common Issues to Check

### 1. Missing Labels
**Problem:** Elements announced as "unlabeled button" or "button 5"
**Fix:** Add aria-label or aria-labelledby

### 2. Poor Heading Structure
**Problem:** No heading context or skipped levels
**Fix:** Use proper heading hierarchy (h1-h6)

### 3. Missing Alt Text
**Problem:** Images announced as filename or "unlabeled"
**Fix:** Add descriptive alt text

### 4. Keyboard Traps
**Problem:** Focus gets stuck in component
**Fix:** Implement proper focus management

### 5. No Skip Links
**Problem:** Must tab through all navigation on each page
**Fix:** Add skip navigation link

### 6. Poor Focus Indicators
**Problem:** Can't see where focus is
**Fix:** Add visible focus styles

---

## Test Results Template

### Page: Home (/)
**Date:** ____________________
**Tester:** ____________________
**Screen Reader:** _______________

**Navigation:**
- [ ] Page title announced correctly
- [ ] Landmarks announced correctly
- [ ] Heading structure is logical
- [ ] Can navigate by headings
- [ ] Can navigate by landmarks

**Links:**
- [ ] All links have accessible names
- [ ] Link purpose is clear
- [ ] External links identified
- [ ] Can navigate by links

**Buttons:**
- [ ] All buttons have labels
- [ ] Button role announced
- [ ] Button state announced
- [ ] Buttons activate with keyboard

**Images:**
- [ ] All images have alt text
- [ ] Alt text is descriptive
- [ ] Decorative images hidden
- [ ] Icons have labels

**Focus:**
- [ ] Focus always visible
- [ ] Focus order is logical
- [ ] No keyboard traps
- [ ] Skip link works

**Issues Found:**
1.
2.
3.

---

## Automation with Screen Readers

### NVDA Remote Testing
While full screen reader testing requires manual verification, some aspects can be automated:

```javascript
// Check for ARIA labels
const elementsWithLabels = document.querySelectorAll('[aria-label], [aria-labelledby]');
console.log(`Elements with ARIA labels: ${elementsWithLabels.length}`);

// Check for proper landmarks
const landmarks = document.querySelectorAll('[role="banner"], [role="navigation"], [role="main"], [role="contentinfo"], header, nav, main, footer');
console.log(`Landmarks found: ${landmarks.length}`);

// Check for headings
const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
console.log(`Headings found: ${headings.length}`);
```

---

## Best Practices

### 1. Test Early and Often
- Don't wait until the end
- Test each feature as you build
- Fix issues immediately

### 2. Use Real Screen Readers
- Emulators and simulators aren't enough
- Test with actual screen reader software
- Test on different platforms

### 3. Involve Real Users
- Recruit screen reader users
- Observe them using your site
- Learn from their experience

### 4. Document Issues
- Take screenshots of issues
- Record screen reader output
- Note screen reader version

### 5. Regression Testing
- Re-test after fixes
- Ensure new features don't break accessibility
- Maintain accessibility as code evolves

---

## Resources

### Documentation
- NVDA User Guide: https://www.nvaccess.org/files/nvda/documentation/userGuide.html
- JAWS Help: https://www.freedomscientific.com/SurfsUp/JAWS_Help.htm
- VoiceOver User Guide: https://help.apple.com/voiceover/mac/10.15/
- ARIA Authoring Practices: https://www.w3.org/WAI/ARIA/apg/

### Tools
- axe DevTools (includes screen reader preview)
- Accessibility Insights for Web
- WAVE browser extension
- WebAIM contrast checker

### Communities
- WebAIM mailing list
- Accessibility Slack channels
- A11y testers community

---

**Remember:** Screen reader testing is essential but not sufficient. Combine with automated testing, keyboard testing, and user testing for comprehensive accessibility assurance.
