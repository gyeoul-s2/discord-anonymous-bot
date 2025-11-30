# Discord Anonymous Message Bot - Design Guidelines

## Project Context
This is a **backend-only Discord bot** with no traditional web interface. User interaction occurs entirely through Discord's native interface via DMs and server channels.

## No Visual Design Required
Since this bot operates purely through Discord's existing UI:
- No web pages, landing pages, or dashboards are needed
- No typography, color schemes, or layout systems required
- Users interact exclusively through Discord's message interface
- Bot responses follow Discord's standard message formatting

## Optional: Configuration Dashboard (If Needed)

If a web-based configuration panel is desired for bot management, use this minimal approach:

**Layout System**
- Tailwind spacing: 4, 6, 8, 12 units for consistency
- Max-width containers: `max-w-4xl` for forms

**Typography**
- Font: Inter via Google Fonts
- Headings: font-semibold, text-2xl for h1, text-xl for h2
- Body: text-base, font-normal

**Component Structure**
1. **Simple Header**: Bot name, status indicator (online/offline)
2. **Configuration Form**: 
   - Target channel ID input
   - Log channel ID input  
   - Bot token field (masked)
   - Save button
3. **Status Section**: Connection status, message count, last activity
4. **Footer**: Minimal - just version number

**Design Approach**: Utility-focused using Fluent Design principles - prioritize clarity and function over aesthetics.

## Core Functionality (No UI Design)
The bot's features are implemented through code logic only:
- DM message reception
- Anonymous message forwarding
- @mention preservation
- Activity logging

**No images, heroes, or marketing elements needed** - this is a pure backend service.