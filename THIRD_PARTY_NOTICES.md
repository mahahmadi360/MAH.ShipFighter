# Audio credits

`src/audio/explosion.mp3` is an excerpt from **Explosive.flac** by **qubodup**. It is a field recording of explosive-device detonations, extracted from US Government footage, and published under CC0 by the uploader.

- Source and license: https://freesound.org/people/qubodup/sounds/189778/
- Source preview: https://cdn.freesound.org/previews/189/189778_71257-hq.mp3
- License: CC0 1.0 Universal — https://creativecommons.org/publicdomain/zero/1.0/
- Changes: isolated the first detonation (1.95 seconds), applied a short tail fade, and re-encoded as stereo MP3 at 160 kbps. No synthetic explosion layers were added.

The sample is bundled with the application; playback makes no third-party requests.

## Water splash

`src/audio/splash.mp3`: **Water Splash 1** by **qubodup**, CC0 1.0.
- Source: https://freesound.org/people/qubodup/sounds/210428/
- Source preview: https://cdn.freesound.org/previews/210/210428_71257-hq.mp3
- Changes: shortened to 2.6 seconds, faded the tail, converted to mono MP3 at 128 kbps.

## Sea ambience

`src/audio/sea.mp3`: **Gentle Ocean Waves Loop** by **kkenny101**, CC0 1.0.
- Source: https://freesound.org/people/kkenny101/sounds/852826/
- Source preview: https://cdn.freesound.org/previews/852/852826_17997500-hq.mp3
- Changes: re-encoded as mono MP3 at 96 kbps.

All three samples are embedded into the app JavaScript by `scripts/embed-audio.mjs`, avoiding separate media requests or base-path dependencies. `src/audio-assets.ts` is generated and checked in so direct `ng serve` also works.
