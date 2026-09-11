/**
 * Site-wide constants. Anything that appears in more than one place, or that
 * differs between environments, belongs here rather than inline in a page.
 */

export const SITE = {
  name: 'MyRideSG',
  /** Used for <title> suffixes and og:site_name. */
  tagline: 'Your bike, sorted.',
  description:
    'Track servicing, running costs and renewal dates. Find trusted workshops when it is time to act. Built for Singapore riders.',
  locale: 'en_SG',
} as const

/**
 * Where every call to action points. Until the store listings are live the app
 * is reached on the web, so there is one destination and nothing to route by
 * platform.
 */
export const APP = 'https://app.myridesg.com'

/**
 * Store links. Identifiers read from myridesg-v2:
 *   iOS      — apps/mobile/eas.json → submit.production.ios.ascAppId
 *   Android  — apps/mobile/app.config.ts → android.package
 */
export const STORE = {
  ios: 'https://apps.apple.com/app/id6788268752',
  android: 'https://play.google.com/store/apps/details?id=app.myridesg.android',
} as const

/**
 * The two listings are in different states, so they do not share a flag.
 * Google Play is published. The App Store listing is still in review at Apple,
 * and there is no date worth promising — so iOS is not linked; it is routed to
 * the testing invite instead. Flip IOS_LIVE the day the listing clears review
 * and every call to action picks it up.
 */
export const ANDROID_LIVE = true
export const IOS_LIVE = false

/**
 * Public TestFlight link. While the App Store listing is in review this is the
 * real iOS destination — no invite to issue, the reader installs it. Apple
 * caps a public link at 10,000 testers and it can be closed at any time, so
 * IOS_TESTING_HREF below stays as the fallback rather than being deleted.
 */
export const TESTFLIGHT = 'https://testflight.apple.com/join/AQwehSsW'

/**
 * Testing-community invites, deliberately not the hello@ support inbox — these
 * are issued by hand against a store account, not answered as support tickets.
 */
export const EARLY_ACCESS_EMAIL = 'myridesingapore@gmail.com'

/**
 * The iOS testing request, pre-filled — only needed when the TestFlight build
 * is full or closed. mailto bodies need percent-encoding, because a raw
 * newline or & truncates the body in some clients.
 *
 * All three fields are asked for because the store email is what a hand-issued
 * invite is actually made out to, and it is routinely NOT the address someone
 * signed up with.
 */
export const IOS_TESTING_HREF =
  `mailto:${EARLY_ACCESS_EMAIL}` +
  `?subject=${encodeURIComponent('iOS testing community')}` +
  `&body=${encodeURIComponent(
    [
      'Hi MyRideSG team,',
      '',
      'I am on iPhone and the TestFlight build is not accepting testers.',
      'Please add me to the testing community.',
      '',
      '--- Please fill in all three ---',
      '',
      '1. Login email:',
      '2. Device OS (iOS or Android):',
      '3. App Store / Play Store email:',
      '   (often different from your login email)',
      '',
      'Thanks!',
    ].join('\n'),
  )}`

/**
 * Primary navigation. Kept flat — the marketing site is deliberately shallow.
 */
// TODO: add these back as each page lands — linking before then ships nav items
// that 404:
//   { label: 'Catalog', href: '/catalog' }  — needs the catalog index page
//   { label: 'Demo',    href: '/demo' }     — lives on feat/demo
export const NAV = [
  { label: 'Features', href: '/#features' },
  { label: 'FAQ', href: '/#faq' },
  { label: 'Guides', href: '/guides/' },
] as const
