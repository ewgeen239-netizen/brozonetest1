# Claude Prompt - BroZone Hero Video

You are a senior web art director and front-end asset curator. I have a local BroZone barber landing page running at:

http://localhost:4321

Project folder:

`/Users/ewgenn/Projects/brozone test`

I already added local photo assets into `/assets/`:

- `assets/hero-poster.jpg` - dark cinematic beard trim fallback for hero
- `assets/fade-closeup.jpg` - close-up fade haircut
- `assets/beard-trim.jpg` - black and white beard trim
- `assets/combo-service.jpg` - finished haircut + beard look
- `assets/service-haircut.jpg`
- `assets/service-beard.jpg`
- `assets/service-color.jpg`
- `assets/service-women.jpg`
- `assets/gallery-01.jpg` through `assets/gallery-08.jpg`
- `assets/location-visual.jpg`
- `assets/final-cta-bg.jpg`

Your task:

Find the ideal hero video for this site on the internet and tell me exactly which one to use.

Search sources:

- Pexels videos
- Coverr
- Pixabay videos
- Unsplash video-like assets only if usable
- other royalty-free/free commercial-use sources if needed

Best starting candidates:

- Pexels barber videos: https://www.pexels.com/search/videos/barber/
- Pexels close-up haircut: https://www.pexels.com/video/person-having-a-haircut-5450148/
- Pexels precise haircut: https://www.pexels.com/video/beard-young-man-barber-barbershop-4178353/
- Pexels styling after haircut: https://www.pexels.com/video/the-barber-styling-a-man-s-hair-after-haircut-4178108/
- Coverr cutting hair in barbershop: https://coverr.co/videos/cutting-hair-in-the-barbershop-iv8kbspqpf
- Coverr barber cutting hair: https://coverr.co/videos/barber-cutting-hair-yxrksw6weg
- Coverr barber shop collection: https://coverr.co/stock-video-footage/barber-shop

Hero video requirements:

1. Must match `assets/hero-poster.jpg`: dark, cinematic, premium, warm amber/black mood.
2. Must work under dark overlay with huge text `BROZONE` in the lower-left.
3. Must have usable empty/dark negative space or not fight the headline.
4. Best content: barber cutting hair, beard trim, scissors, clipper close-up, mirror/chair atmosphere, slow precise movement.
5. Avoid smiling stock scenes, bright white salon footage, beauty salon vibe, TikTok-style captions, watermarks, random street barbers, messy backgrounds.
6. Prefer 6-12 seconds, looping-friendly, 16:9 or 4K landscape. Vertical is okay only if it can crop well for desktop.
7. Must be free/royalty-free for website use, or clearly state license risk.

Return format:

Best hero video:
- Title:
- URL:
- Source:
- License/use note:
- Why it fits:
- Recommended crop:
- Suggested filename: `assets/hero-video.mp4`
- Poster frame to use:

Backup choices:
Give 2-3 backup video URLs with short notes.

Implementation instructions:
Tell me exactly how to save it into the project:

- `assets/hero-video.mp4`
- optional `assets/hero-video.webm`
- keep `assets/hero-poster.jpg` as fallback

Then give a short final recommendation:

Which video would you choose if this was a real client pitch for BroZone Szczecin and why?

