import { site } from "./site";

export interface Faq { q: string; a: string }
export interface FaqGroup { title: string; items: Faq[] }

/** Plain-text answers (they are also sent to search engines as FAQ data). */
export const faqGroups: FaqGroup[] = [
  {
    title: "Using PathCross",
    items: [
      { q: "What is PathCross?", a: "PathCross is a free guide to networking events, clubs and groups in Honolulu. You tell us your profession and what you want from your network, and we rate and rank what's on so you can spend your time in the rooms that matter." },
      { q: "Is it free to use?", a: "Yes. Browsing events, clubs and the calendar needs no account, and creating a login for My Network is free." },
      { q: "How do the networking ratings work?", a: "Each event gets a 1 to 5 star rating that PathCross calculates from its format, size, host and, once you've told us your profession and goals, how well it fits you. Ratings are not attendee reviews, and organizers can't pay to change them. The How it works page explains them in detail." },
      { q: "Do you sell tickets?", a: "No. Every listing links to the organizer's own page, where you register or join. Prices and details come from the organizer, so confirm them there before you go." },
      { q: "What is My Network?", a: "It's your personal list of the clubs and events you care about, shown as pins on a map. Anything you add also appears on My calendar, including events from clubs you've added. You sign in with an emailed link, with no password." },
    ],
  },
  {
    title: "Listing your event, club or network",
    items: [
      { q: "How do I get my event or club listed?", a: "Fill in the short form on the List your event, club or network page. It asks for the name, description, date and time, place, a website link and your contact email." },
      { q: "Does it cost anything to send a request?", a: "No. Sending the form doesn't cost anything." },
      { q: "How long until it appears?", a: "We review every request by hand, so we can't promise a date. If we need more detail, we'll email the address you gave us." },
      { q: "What kinds of listings do you accept?", a: "Events, clubs, groups, networks, classes and programs for people in Honolulu and across Oʻahu: professional and industry groups, real estate, food and drink, sports and fitness, member clubs, boating and volunteering. We may edit a listing for length and clarity, and we may decline requests that don't fit." },
      { q: "Can I update or remove my listing?", a: `Yes. Email ${site.supportEmail} with the name of the listing and what to change, from the address you used to submit it.` },
      { q: "What should I send for an event that repeats?", a: "Choose how often it repeats, give the usual day and time, and add the next date if you know it. Weekly and monthly events appear on the weekly lineup and the calendar." },
    ],
  },
  {
    title: "Your information",
    items: [
      { q: "What happens to the details I send?", a: "We use them only to review your request and contact you. Your name, email and phone are seen only by the PathCross owner and are never published. The privacy notice has the full details." },
      { q: "Who sees my account's email and saved items?", a: "Only you, through the site. The site owner can see the list of account emails, as the privacy notice explains." },
      { q: "I found a mistake in a listing. What do I do?", a: `Please tell us at ${site.supportEmail} with the listing name and what's wrong. Listings are based on what each organization publishes, so the organizer's own page is the final word.` },
    ],
  },
];
