---
id: nfc-blog-015
title: "How to Reset Your Philips Sonicare Brush Head Counter with NFC"
date: 2026-04-21
tags: [nfc-tech, sonicare, guides]
summary: "Your Sonicare toothbrush tracks brush head usage on an NFC chip inside every head. When it says 'replace me,' that's the chip talking - not the bristles. Here's how the counter works, why you might want to reset it, and how to do it safely with NFC.cool Tools."
metaTitle: "Reset Philips Sonicare Brush Head Counter with NFC (2026)"
metaDescription: "Your Sonicare brush head has an NFC chip that tracks usage. Learn how it works, when resetting makes sense, and how to reset the counter with NFC.cool Tools - no special hardware needed."
ogTitle: "How to Reset Your Sonicare Brush Head Counter"
ogDescription: "Every Sonicare brush head has an NFC chip tracking your usage. Here's how it works and how to reset it."
---

# How to Reset Your Philips Sonicare Brush Head Counter with NFC

If you own a Philips Sonicare toothbrush, you've seen the amber light. After three months of brushing, the handle blinks to remind you to replace the brush head. But that reminder doesn't come from inspecting the bristles. It comes from a tiny NFC chip embedded in the base of every replacement head.

And that chip is more interesting than you'd expect.

## What's Inside a Sonicare Brush Head

Every modern Sonicare brush head contains an **NTAG213** NFC tag - the same type of chip used in smart posters, transit cards, and product authentication labels. When you snap a new head onto the handle, the toothbrush reads the tag to identify the head type and starts writing usage data to it.

Here's what the chip stores:

- **Brush head type** - identifies the model (Premium All-in-One, Gum Care, DiamondClean, etc.) and color
- **Accumulated usage time** - total seconds the head has been in use
- **Target lifetime** - usually 21,600 seconds (180 sessions × 2 minutes), which is three months of twice-daily brushing
- **Last intensity and mode** - which brushing setting you used last
- **Manufacturing code** - date and production line, printed on the stem
- **An NDEF record** - a URL pointing to `philips.com/cfcbrushheadtap`

When the accumulated time exceeds the target (21,600 seconds), the toothbrush handle blinks its LED to tell you it's time to replace the head.

## Why People Reset the Counter

The three-month replacement interval is a Philips recommendation, not a universal truth. Bristle wear depends on brushing pressure, toothpaste abrasiveness, and how often you brush. Some people are gentle brushers whose heads stay effective well past three months. Others use low-abrasion toothpaste that's easier on bristles.

The counter on the chip doesn't measure bristle condition. It measures time. If you want to make that decision yourself - by visually inspecting the bristles instead of relying on a countdown timer - resetting the counter lets you do that.

You might also reset the counter if you're switching between multiple heads (one for travel, one for home) and want to consolidate the tracking on your own terms.

## How the Password Protection Works

The NTAG213 chip is **password-protected**. Without the correct 4-byte password, you can't write to the usage counter or any protected memory page. The toothbrush handle authenticates with this password every time it updates the timer.

Here's the important part: **the password is derived from the tag's unique 7-byte UID**. Every brush head has a different password. Philips' firmware generates it using a deterministic algorithm based on the UID. This algorithm was reverse-engineered by Aaron Christophel in 2023 after Cyrill Künzi's original SDR-based sniffing work.

⚠️ **Critical warning:** The NTAG213 has an anti-tamper mechanism. After **three failed password attempts**, the chip permanently locks all write access. Not even the toothbrush can write to it anymore. If you enter the wrong password three times, that brush head becomes read-only forever. There is no recovery.

## How to Reset with NFC.cool Tools

NFC.cool Tools now includes built-in support for resetting Sonicare brush head counters. You don't need a separate app, a web calculator, or to manually send hex commands. The app generates the correct password automatically.

**Steps:**

1. Open **NFC.cool Tools** on your iPhone
2. Go to **Toothbrush Head Reset**
3. Tap **Read NFC** and hold the brush head against your phone
4. Enter the MFG code printed on the bottom of the brush head (e.g. `221214 12K`)
5. Tap **Reset Timer** to set the usage counter back to zero

The app handles password generation and authentication in the background. One tap, done.

The Sonicare reset feature is available now on [iPhone](https://apps.apple.com/app/apple-store/id1249686798?pt=106913804&ct=BlogSonicareReset&mt=8) and will come to [Android](https://play.google.com/store/apps/details?id=cool.nfc&referrer=utm_source%3Dblog-sonicare-reset) in a future update.

**Safety features:**

- Password is computed from the tag UID and the printed MFG code - no manual password entry, no risk of typos
- The app authenticates before writing, so it never sends a wrong password

## What You're Actually Resetting

When you reset the counter, you're setting the accumulated usage time (stored at memory address `0x24`) back to `00:00:02:00` - the factory default for a new head. This is the same value a brand-new brush head ships with.

The reset does **not** change:

- The brush head type identifier
- The manufacturing date code
- The target lifetime (still 21,600 seconds)
- The NDEF URL record

It only resets the elapsed time counter. The toothbrush will start counting from zero again, and the amber light will come back after another three months of use.

## The Bigger Picture: NFC in Everyday Objects

Sonicare brush heads are one of the most common consumer NFC tags that people encounter without realizing it. The same technology that lets you tap your phone to pay for coffee is being used to track how long you've been brushing your teeth.

Other everyday NFC applications include product authentication (luxury goods, pharmaceuticals), access control (hotel room keys, office badges), and smart packaging (the EU Digital Product Passport initiative launching in 2026-2027 will require NFC tags on many consumer products).

NFC.cool Tools reads and writes all of these. The Sonicare reset is just one example - but it's a good one, because it shows how NFC is already embedded in objects you use daily, and how understanding the technology gives you more control over the products you own.

## Further Reading

- [Cyrill Künzi's original reverse engineering writeup](https://kuenzi.dev/toothbrush/) - the first detailed analysis of the Sonicare NFC protocol
- [Aaron Christophel's password generator](https://gist.github.com/atc1441/41af75048e4c22af1f5f0d4c1d94bb56) - the algorithm extracted from the Sonicare firmware
- [mbirth's NTAG213 memory map](https://blog.mbirth.uk/2026/03/29/sonicare-brush-head-nfc-data.html) - detailed documentation of every byte on the chip

---

*Have a Sonicare brush head to reset? [Download NFC.cool Tools for iPhone](https://apps.apple.com/app/apple-store/id1249686798?pt=106913804&ct=BlogSonicareReset&mt=8) or [Android](https://play.google.com/store/apps/details?id=cool.nfc&referrer=utm_source%3Dblog-sonicare-reset) (Sonicare reset coming soon on Android) and tap your way to a fresh start.*