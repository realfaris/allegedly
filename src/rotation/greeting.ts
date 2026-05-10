// Greeting matrix: category × tone × time-of-day → string.
//
// Returns null when the user picked tone 'minimal' — the QuoteScreen will
// hide the greeting line entirely. The widget shares this helper too so
// app/widget greetings always agree.
//
// Copy is a working draft. PLAN.md notes a polish pass before ship — that's
// where these get rewritten by the editorial brain, not where they get
// designed by an LLM mid-implementation.

import type { Category, TimeOfDay, Tone } from '../types';

interface Args {
  category: Category;
  tone: Tone;
  boundary: TimeOfDay;
  name?: string;
}

export function getGreeting({
  category,
  tone,
  boundary,
  name,
}: Args): string | null {
  if (tone === 'minimal') return null;

  const who = name ? `, ${name}` : '';
  const NAME = name ? `, ${name}` : '';

  if (tone === 'sincere') {
    if (boundary === 'morning') return `Good morning${who}`;
    if (boundary === 'afternoon') return `Good afternoon${who}`;
    return `Good evening${who}`; // evening + night
  }

  // sassy
  switch (category) {
    case 'anti_motivational':
      if (boundary === 'morning') return name ? `Wake up, ${name}` : 'Wake up, idiot';
      if (boundary === 'afternoon') return `Halfway through${who}`;
      return `Another day survived${who}`;
    case 'motivational':
      if (boundary === 'morning') return `Time to fake it${who}`;
      if (boundary === 'afternoon') return `Still grinding${who}`;
      return `Closing the deal${who}`;
    case 'stoic':
      if (boundary === 'morning') return `Memento mori${who}`;
      if (boundary === 'afternoon') return `The day is older${who}`;
      return `Reflect${who}`;
    case 'dumb':
      if (boundary === 'morning') {
        return name ? `wake up babe, ${name}` : 'wake up babe new cope just dropped';
      }
      if (boundary === 'afternoon') return `mid-day pivot${NAME}`;
      return `evening hours${NAME}`;
    case 'funny':
      if (boundary === 'morning') return `Up and at 'em${who}`;
      if (boundary === 'afternoon') return `Carry on${who}`;
      return `Easy now${who}`;
  }
}
