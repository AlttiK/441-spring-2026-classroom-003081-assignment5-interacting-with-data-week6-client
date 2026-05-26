# Week 6 Class Demo

This is a small **React** frontend for Week 6 class demos. It has three pages—**Auth**, **Parks**, and **Sightings**

- **Auth** — Email/password sign-in and sign-up via [Supabase Auth](https://supabase.com/docs/guides/auth)
- **Parks** — Look up a park by id, lists all placeholder parks below.
- **Sightings** — Form that logs to the console, lists placeholder sightings below.

## Security

Cross Site Scripting: On the client side there are a couple places where text could be used for XSS. A big example is in the ParkIDPage where the sighting comments and notes are displayed immediately. If there is a script attached to either the Notes or Comments, (though only the Notes can be currently added to when creating a Sighting) whenever a user loaded this page, the script can run. In this case though, we are using React, which protects against XSS with the {} curly brackets. These curly brackets convert special characters into symbol entities. But, to be more rigorous, would be using an allow list that only allows normal chracters and text that a comment and notes should only need.
SQL Injection: On the client side, SQL injection could occur whenever we are trying to add a new sighting to the supabase database since that is handled directly here in the sightingsPage: 
```
const { error } = await supabase
  .from('Sightings')
  .insert({ ParkID: parkId, SpeciesID: speciesId, DateTime: dateTime, ImagePath: imagePath, UserID: userId, Notes: notes, Lat: lat, Long: long})
```
For the other pages, calls are sent to the API and not the client. 
But, SQL injections are all protected already by using supabase. This is becuase queries aren't a single string and are broken up from supabase functions such as .from() or .eq(), or .select().
DDos: There is no direct ddos protection in this client, there are no checks to see and set limits to requests anywhere. This is protected on the deployed side with vercel. Vercel automatically has a rate limiter that also sees weird behavior. In additional we can set up attack mode in the rules for the firewall that will send a JavaScript verification when there is a lot of bad traffic happening.
2 More from OWASP:
Software Supply Chain Vulnerabilties: There is a lot of code that is being supplied, like React, Supabase, and Vite. Any time these either go out of date or when someone finds vulnerabilites in these node packages, that also means this webste is vulnerable as a result too. Ways to protect against this in the current version is the package-lock.json which tells what versions are used, and if these are all safe, then the website is protected. But if any of these have vulnerabilites found, we need to update and make sure version are on the newest security updates. Also running npm audit to see where there could be vulnerabilites also allows development to stay up to date.
Cryptographic Failures: Keys and other values that need to be hidden can be held in vercel as enviornment variables. This keeps keys in a place that can be access by the website to complete tasks but does not expose them to anyone. In this case though, all environemnt variables need to allow the client to see them so that the API and Database can be accessed by users. The supabase database also has Row Securities that prevent misuse of the database and only allow certain actions to authorized users or specific users. Some final steps mentioned couple be making sure algorithms are as up to date as possible so that they cannot be easily broken.


## Run locally

```bash
npm install
npm run dev
```

## Example placeholder data

These match `src/data/placeholders.ts` until you hook up a real API.

### Parks

A park is just a short id (the same id you type in the look-up box), a full name, and a state abbreviation.

Right now there is one park: Acadia National Park in Maine, id `ACAD`.

```ts
const parks = [{ ID: "ACAD", Name: "Acadia National Park", State: "ME" }];
```

To add another one—say Yellowstone in Wyoming with id `YELL`—add another entry to the list:

```ts
const parks = [
  { ID: "ACAD", Name: "Acadia National Park", State: "ME" },
  { ID: "YELL", Name: "Yellowstone National Park", State: "WY" },
];
```

On the Parks page, try id `ACAD` or `acad` (case does not matter) to see it match the first row.

---

### Sightings

A sighting is when and where something was seen: a date and time, which park (same kind of park id as above), and a species id your app or database uses. The number `id` is just a row id for React keys and later for a database.

There is one sample sighting: park `ACAD`, species `ACAD-1002`, on April 27, 2026 at 22:26:05 UTC (`+00` is UTC).

```ts
const sightings = [
  {
    id: 2,
    date_time: "2026-04-27 22:26:05+00",
    parkID: "ACAD",
    speciesID: "ACAD-1002",
  },
];
```

Another example would be a sighting at Yellowstone on New Year’s Day 2026, species `YELL-2001`, with a new row id `3`:

```ts
const sightings = [
  {
    id: 2,
    date_time: "2026-04-27 22:26:05+00",
    parkID: "ACAD",
    speciesID: "ACAD-1002",
  },
  {
    id: 3,
    date_time: "2026-01-01T12:00:00+00",
    parkID: "YELL",
    speciesID: "YELL-2001",
  },
];
```

Match whatever `date_time` format your backend expects; the sightings form logs values you can line up with this.

---

### Supabase (Auth)

The app reads your project URL and the public anon key from the environment so the browser can use Supabase Auth. Those are not secret like a database password; they still belong in `.env.local`, not in git.

Create `.env.local` in the project root. In the Supabase dashboard, open Project Settings → API and copy the project URL and anon/public key into the file:

```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_...   # or the legacy anon JWT
```

Restart `npm run dev` after you change env vars.

---

Built with [Vite](https://vite.dev/) + [React](https://react.dev/) + [React Router](https://reactrouter.com/) + [@supabase/supabase-js](https://supabase.com/docs/reference/javascript/introduction).
