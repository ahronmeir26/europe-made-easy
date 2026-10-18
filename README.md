# Europe Made Easy

Static website for Europe Made Easy — kosher-friendly sightseeing in Rome, Venice, Amsterdam, Paris and London. Plain HTML/CSS/JS, deployed on Vercel (no build step).

## Pages
- `index.html` — Home
- `about.html` — About Us
- `cities.html` — Cities (Rome, Venice, Amsterdam, Paris, London)
- `reviews.html` — Reviews + review submission form
- `contact.html` — Contact details + trip enquiry form

## Forms (contact + reviews)
Both forms send an email to **info@EuropeMadeEasy.org** using [FormSubmit](https://formsubmit.co) (free, no account).
The **first** form submission triggers a one-time activation email to that inbox — click the link in it, and all later submissions arrive as normal emails.

## Approving reviews
Submitted reviews arrive by email and are **not** published automatically. To publish one, add it to `data/reviews.json` and push:

```json
[
  { "name": "Sarah L.", "rating": 5, "trip": "Paris, May 2026", "review": "Everything was arranged perfectly..." }
]
```

`trip` is optional. Vercel redeploys automatically on every push.

## Photos
City photos from [Unsplash](https://unsplash.com) (free to use under the Unsplash License).
