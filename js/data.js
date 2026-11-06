// ─────────────────────────────────────────────────────────────
//  RageBaitX site content. Edit this file to update the site.
// ─────────────────────────────────────────────────────────────
//
//  SOCIALS: put your real profile links in `url`.
//  Leave `url` empty ('') and the card shows "Link coming soon".
//
//  CLIPS: everything below is SAMPLE content until your real clips
//  are added. To use a real clip:
//    1. Put the MP4 in the /clips folder (keep it short and under ~8 MB),
//       or use a full https:// link to a hosted video.
//    2. Set `video: 'clips/your-file.mp4'`.
//    3. Set `sample: false` and replace views/likes with real numbers
//       (or set them to '' to hide them).
// ─────────────────────────────────────────────────────────────

export const SOCIALS = [
  {
    id: 'youtube',
    label: 'YouTube',
    handle: '@RageBaitX',
    url: '', // e.g. https://www.youtube.com/@YourChannel
    action: 'Watch the Shorts',
  },
  {
    id: 'tiktok',
    label: 'TikTok',
    handle: '@ragebaitx',
    url: '', // e.g. https://www.tiktok.com/@yourhandle
    action: 'Join the chaos',
  },
  {
    id: 'instagram',
    label: 'Instagram',
    handle: '@r.agebaitx',
    url: 'https://www.instagram.com/r.agebaitx/',
    action: 'See the Reels',
  },
  {
    id: 'facebook',
    label: 'Facebook',
    handle: 'RagebaitX',
    url: 'https://www.facebook.com/1440124302516161',
    action: 'Follow the Page',
  },
];

export const CATEGORIES = ['All', 'GTA VI', 'Funny Moments', 'Chaos', 'Gameplay', 'Viral'];

export const CLIPS = [
  {
    id: 'six-star',
    title: 'Six-Star Getaway Gone Wrong',
    desc: 'One wrong turn, every unit in the city, and a getaway plan that lasts twelve seconds.',
    category: 'GTA VI',
    thumb: 'assets/thumbs/t1.webp',
    video: '',
    duration: '0:34',
    views: '1.2M',
    likes: '84K',
    sample: true,
    featured: true,
  },
  {
    id: 'parking',
    title: 'The Worst Parking Job in Vice',
    desc: 'Confidence: maximum. Skill: questionable. Lamp post: destroyed.',
    category: 'Funny Moments',
    thumb: 'assets/thumbs/t2.webp',
    video: '',
    duration: '0:21',
    views: '640K',
    likes: '51K',
    sample: true,
    size: 'tall',
  },
  {
    id: 'pier',
    title: 'Speedboat vs. Pier',
    desc: 'The pier did not move. The speedboat had other ideas.',
    category: 'Chaos',
    thumb: 'assets/thumbs/t3.webp',
    video: '',
    duration: '0:18',
    views: '920K',
    likes: '73K',
    sample: true,
    size: 'wide',
  },
  {
    id: 'rooftop',
    title: 'Rooftop Jump: Attempt #47',
    desc: 'Forty-six failures led to this. Was it worth it? Watch to the end.',
    category: 'Gameplay',
    thumb: 'assets/thumbs/t4.webp',
    video: '',
    duration: '0:42',
    views: '410K',
    likes: '29K',
    sample: true,
  },
  {
    id: 'npc',
    title: 'When the NPC Fights Back',
    desc: 'He just wanted to cross the road. Big mistake.',
    category: 'Funny Moments',
    thumb: 'assets/thumbs/t5.webp',
    video: '',
    duration: '0:27',
    views: '2.1M',
    likes: '190K',
    sample: true,
  },
  {
    id: 'drift',
    title: 'Sunset Drift Session',
    desc: 'Clean lines, neon skies and absolutely no brakes.',
    category: 'Gameplay',
    thumb: 'assets/thumbs/t6.webp',
    video: '',
    duration: '0:55',
    views: '330K',
    likes: '22K',
    sample: true,
    size: 'wide',
  },
  {
    id: 'standoff',
    title: 'Gas Station Standoff',
    desc: 'Four players, one gas station, zero patience.',
    category: 'Chaos',
    thumb: 'assets/thumbs/t7.webp',
    video: '',
    duration: '0:39',
    views: '780K',
    likes: '61K',
    sample: true,
    size: 'tall',
  },
  {
    id: 'viral-ramp',
    title: 'The Ramp Everyone Is Talking About',
    desc: 'Physics left the chat. The comments section did not.',
    category: 'Viral',
    thumb: 'assets/thumbs/t8.webp',
    video: '',
    duration: '0:16',
    views: '3.4M',
    likes: '260K',
    sample: true,
  },
];

export const COLLECTIONS = [
  { title: 'RageBaitX Originals', desc: 'Edited in-house. The clips that started it all.', thumbs: ['assets/thumbs/t1.webp', 'assets/thumbs/t6.webp', 'assets/thumbs/t3.webp'] },
  { title: 'Community Clips', desc: 'Your best moments, featured. Submissions open soon.', thumbs: ['assets/thumbs/t5.webp', 'assets/thumbs/t2.webp', 'assets/thumbs/t8.webp'] },
  { title: "Editor's Picks", desc: 'Hand-picked chaos, refreshed every week.', thumbs: ['assets/thumbs/t7.webp', 'assets/thumbs/t4.webp', 'assets/thumbs/t1.webp'] },
];
