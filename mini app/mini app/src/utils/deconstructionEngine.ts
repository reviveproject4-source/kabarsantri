import { ContentDeconstruction } from '../types';

export function deconstructVideo(url: string, platform: string = 'tiktok'): ContentDeconstruction {
  const isSkincare = url.toLowerCase().includes('skincare') || url.toLowerCase().includes('glow') || url.toLowerCase().includes('reel');

  if (isSkincare) {
    return {
      audioTranscript: "Stop putting random chemicals on your face! I tested this single organic vitamin C serum for 7 days straight, and here is what happened to my dark spots. Look at this before and after without any filters. The secret is the cold-pressed active antioxidant blend. Grab yours now with 30% off!",
      hook: {
        durationSec: 3,
        verbalHook: "Stop putting random chemicals on your face!",
        visualStyle: "Macro close-up on skin texture with abrupt negative gesture towards generic bottle.",
        hookType: "Pattern Interrupt / Fear of Missing Out (FOMO)",
      },
      valueProposition: {
        coreMessage: "Rapid dark spot reduction using pure cold-pressed organic active ingredients.",
        emotionalTriggers: ["Frustration with ineffective skincare", "Desire for instant aesthetic results", "Curiosity around filter-free proof"],
        copywritingFramework: "PAS (Problem - Agitate - Solution)",
        targetPainPoint: "Stubborn acne scars & dull skin texture",
      },
      sceneStructure: [
        {
          sceneNumber: 1,
          timeframe: "0:00 - 0:03",
          description: "Visual Shock & Stop Action: Aggressive hand gesture pushing away cheap skincare product.",
          cameraMotion: "Fast zoom-in to face, high contrast lighting.",
          pacing: "Fast"
        },
        {
          sceneNumber: 2,
          timeframe: "0:03 - 0:08",
          description: "Problem Reveal: Split screen showing un-edited skin texture vs 7-day progress streak.",
          cameraMotion: "Static side-by-side macro lens shot.",
          pacing: "Fast"
        },
        {
          sceneNumber: 3,
          timeframe: "0:08 - 0:15",
          description: "Value Demonstration: Dropper releasing amber liquid onto cheekbone with satisfying texture drip.",
          cameraMotion: "Slow-motion 60fps pan down cheek.",
          pacing: "Moderate"
        },
        {
          sceneNumber: 4,
          timeframe: "0:15 - 0:22",
          description: "Call To Action & Offer: Finger pointing down at TikTok Shop / Bio link with discount code.",
          cameraMotion: "Direct eye contact, rapid bounce zoom.",
          pacing: "Fast"
        }
      ]
    };
  }

  // Default gadget/general viral video deconstruction
  return {
    audioTranscript: "If you still carry around 3 different chargers in your bag in 2026, you're doing it completely wrong. Watch this pocket-sized magnetic power bank charge my phone, watch, and earbuds at the same time. It weighs less than an apple and fits in your jeans pocket. Link in bio before it sells out!",
    hook: {
      durationSec: 3,
      verbalHook: "If you still carry around 3 different chargers in 2026, you're doing it completely wrong!",
      visualStyle: "Tossing messy tangled cables onto a desk in frustration, followed by sleek product reveal.",
      hookType: "Negative Framing / Status Quo Challenge",
    },
    valueProposition: {
      coreMessage: "Eliminate cable clutter with 3-in-1 ultra-portable fast charging.",
      emotionalTriggers: ["Relief from everyday inconvenience", "Desire for minimalism", "Urgency due to limited stock"],
      copywritingFramework: "AIDA (Attention - Interest - Desire - Action)",
      targetPainPoint: "Heavy, tangled charging cables while traveling",
    },
    sceneStructure: [
      {
        sceneNumber: 1,
        timeframe: "0:00 - 0:03",
        description: "Hook & Frustration: Throwing tangled cords onto table with loud sound effect.",
        cameraMotion: "Overhead top-down dynamic drop shot.",
        pacing: "Fast"
      },
      {
        sceneNumber: 2,
        timeframe: "0:03 - 0:09",
        description: "Solution Demo: Magnetic snap connection to phone with satisfying click sound.",
        cameraMotion: "Extreme close-up macro snap with haptic sound.",
        pacing: "Fast"
      },
      {
        sceneNumber: 3,
        timeframe: "0:09 - 0:16",
        description: "Proof of Concept: Pocket test showing thin profile inside skinny jeans.",
        cameraMotion: "Tracking shot following hand slipping power bank into pocket.",
        pacing: "Moderate"
      },
      {
        sceneNumber: 4,
        timeframe: "0:16 - 0:24",
        description: "Scarcity CTA: Tapping yellow shopping basket icon with countdown timer animation.",
        cameraMotion: "Screen record overlay with pointer arrow.",
        pacing: "Fast"
      }
    ]
  };
}
