import { ProductDetails, ReStrategyOutput, ContentDeconstruction } from '../types';

export function adaptToProduct(
  product: ProductDetails,
  deconstruction: ContentDeconstruction
): ReStrategyOutput {
  const pName = product.name.trim() || 'Your Premium Product';
  const pNiche = product.niche.trim() || 'Lifestyle & Tech';
  const pAudience = product.targetAudience.trim() || 'Busy Professionals';
  const pFeatures = product.keyFeatures.trim() || 'Innovative design, high quality, time-saving';
  const pCTA = product.callToActionText.trim() || 'Order now with 20% OFF today only!';

  // 1. Generate 3-4 Viral Hook Options preserving viral patterns
  const hookOptions = [
    {
      type: "Pattern Interrupt / Bold Claim",
      headline: `If you're still relying on old solutions for ${pNiche.toLowerCase()}, you're doing it completely wrong in 2026.`,
      visualInstruction: `Start with a dramatic action: Toss old alternative off frame, then snap fingers to reveal ${pName}.`
    },
    {
      type: "Pain Point & Curiosity Hook",
      headline: `Why does nobody talk about this game-changing feature in the ${pName}? Watch what happens when I switch this on.`,
      visualInstruction: `Macro close-up on hands activating ${pName} with high contrast rim lighting.`
    },
    {
      type: "Negative Framing / FOMO",
      headline: `Stop spending money on average ${pNiche.toLowerCase()} gear until you see how ${pName} solves ${pFeatures.split(',')[0] || 'the main problem'}.`,
      visualInstruction: `Direct eye-level shot with red warning overlay graphic in the first 0.5s.`
    },
    {
      type: "Before & After Shock",
      headline: `I replaced my entire routine with ${pName} for 7 days, and here's the honest truth.`,
      visualInstruction: `Fast side-by-side comparison shot showing struggle vs seamless experience with ${pName}.`
    }
  ];

  // 2. Generate Adapted Script preserving copywriting framework (PAS / AIDA)
  const adaptedScript = `[0:00 - 0:03] HOOK:
If you're still struggling with ${pFeatures.split(',')[0] || 'daily inconveniences'} in 2026, stop scrolling right now!

[0:03 - 0:08] PROBLEM & AGITATION:
Most ${pAudience} waste hours and money dealing with sluggish performance or poor quality. You know that frustration when things just don't work when you need them most?

[0:08 - 0:16] SOLUTION & DEMO:
Meet the ${pName}. It's specially engineered for ${pAudience} who demand ${pFeatures}. Watch how effortlessly it handles ${pFeatures.split(',')[1] || 'your core daily needs'}.

[0:16 - 0:24] CALL TO ACTION:
Don't wait until stock runs out. Tap the shop link below to claim your ${pName} with exclusive fast shipping. ${pCTA}`;

  // 3. Generate Scene-by-Scene Visual AI Prompts for AI Video Tools (Midjourney / Sora / Luma / Runway)
  const scenePrompts = [
    {
      scene: 1,
      timeframe: "0:00 - 0:03",
      scriptLine: `If you're still struggling with ${pFeatures.split(',')[0] || 'daily inconveniences'}, stop scrolling!`,
      visualPrompt: `Hyper-realistic cinematic shot of a modern ${pAudience.toLowerCase()} looking frustrated, dramatic moody volumetric lighting, 8k resolution, photorealistic skin textures, cinematic depth of field --ar 9:16 --v 6.0`,
      cameraMotion: "Fast dolly-in zoom towards face, 60fps high shutter speed.",
      lightingStyle: "Neon cyan and deep shadow rim contrast"
    },
    {
      scene: 2,
      timeframe: "0:03 - 0:08",
      scriptLine: `Most ${pAudience} waste hours dealing with clunky alternatives...`,
      visualPrompt: `Split screen commercial photography, left side messy chaotic setup, right side clean minimal aesthetic with ${pName}, studio lighting, ultra detailed textures --ar 9:16`,
      cameraMotion: "Static split composition with smooth swipe transition.",
      lightingStyle: "Soft diffused key light with golden accent glow"
    },
    {
      scene: 3,
      timeframe: "0:08 - 0:16",
      scriptLine: `Meet the ${pName}. Specially engineered with ${pFeatures}...`,
      visualPrompt: `Extreme macro 100mm lens product hero shot of ${pName}, sleek metallic reflections, floating water droplets, luxury tech commercial style --ar 9:16 --style raw`,
      cameraMotion: "360-degree slow orbital spin around product.",
      lightingStyle: "High-key studio spotlight with subtle lens flare"
    },
    {
      scene: 4,
      timeframe: "0:16 - 0:24",
      scriptLine: `${pCTA}`,
      visualPrompt: `Close-up shot of hand tapping smartphone screen displaying TikTok Shop purchase button for ${pName}, warm inviting atmosphere --ar 9:16`,
      cameraMotion: "Direct tilt down to phone screen with vibrant UI overlay.",
      lightingStyle: "Warm ambient indoor lighting"
    }
  ];

  // 4. Voiceover & Audio Cues
  const voiceoverText = `If you're still struggling with ${pFeatures.split(',')[0] || 'daily inconveniences'} in 2026, stop scrolling right now! Most ${pAudience} waste hours dealing with clunky alternatives. Meet the ${pName}. Specially engineered with ${pFeatures}. Tap the shop link below to get yours now!`;

  const sfxCues = [
    "0:00 - Heavy Vinyl Scratch / Whoosh transition",
    "0:03 - Glitch Pop sound effect",
    "0:08 - Futuristic Sci-Fi Snap / Power-up Hum",
    "0:16 - Cash Register Chime / Ding sound"
  ];

  return {
    hookOptions,
    adaptedScript,
    ctaText: pCTA,
    scenePrompts,
    voiceoverText,
    sfxCues
  };
}
