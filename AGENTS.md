# AGENTS.md — Timeless

## What This Is
Timeless is a temporal exploration app. Users stand at a location and see
what was there across history, what is there now, and what might be in 2075.
San Francisco MVP: 5 locations, 9 eras each, mobile-first web app.
Repo: https://github.com/imcerdafied/timelessrepo

## Architecture
- apps/frontend — Vite + React + Tailwind + Framer Motion + Zustand
- apps/backend — Express + Supabase + Railway deployment
- packages/content — Static JSON content, source of truth for all era data

## Design System (never deviate from this)
Background: #0A0A0A | Surface: #141414 | Border: #222222
Past accent: #C8860A (amber) | Future accent: #1E4D8C (blue)
Present: #F5F5F5 (white)
Fonts: Playfair Display (headings) + Inter (UI) from Google Fonts
Aesthetic reference: Linear, Vercel, Figma — quiet authority

## Core Interaction
The temporal ribbon is the primary interaction. It must feel as responsive
as the iOS Photos scrubber. This takes priority over all other UI work.

## Content Schema
See packages/content/locations.json for the canonical data structure.
Never hardcode content in components — always read from this file.

## Stack (locked — do not change without asking)
- State: Zustand only
- Animation: Framer Motion only
- Styling: Tailwind utility classes only
- Images: Always lazy load with blur placeholder
- Video: HTML5 video with preload="none" until user reaches that era

## Do Not
- Install libraries without flagging it first
- Create separate CSS files
- Add authentication
- Use any UI component library — build everything from scratch

## Working Style
Proceed autonomously without asking for confirmation on individual 
steps. Make decisions, implement them, then summarize what you did 
at the end. Only pause if you hit a genuine blocker or need a 
decision that can't be reversed.
