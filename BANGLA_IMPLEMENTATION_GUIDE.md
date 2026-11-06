# Smart Tournament Planner — বাংলা নির্দেশিকা

এই নির্দেশিকায় বর্তমান অ্যাপ চালু করা, প্রধান পৃষ্ঠাগুলো ব্যবহার করা এবং গুরুত্বপূর্ণ সীমাবদ্ধতা যাচাই করার সংক্ষিপ্ত বর্ণনা রয়েছে। অ্যাপের সক্রিয় React entry point হলো `src/main.jsx`।

## চালু করার নিয়ম

প্রকল্পের মূল ফোল্ডারে (যেখানে এই README এবং frontend `package.json` আছে) টার্মিনাল খুলুন:

```bash
npm install
npm run dev
```

Vite যে URL দেখাবে সেটি ব্রাউজারে খুলুন; সাধারণত `http://localhost:5173`।

Backend চালাতে আলাদা টার্মিনালে:

```bash
cd backend
npm install
npm run dev
```

Backend সাধারণত `http://localhost:3001`-এ চলে। চালানোর আগে `backend/.env`-এ একটি ব্যক্তিগত `JWT_SECRET` থাকতে হবে। বাস্তব secret বা password GitHub-এ প্রকাশ করবেন না।

## প্রধান পৃষ্ঠা ও কাজ

| URL | কাজ |
| --- | --- |
| `/login` | Organizer লগইন |
| `/register` | Organizer account তৈরি |
| `/authority/login` | Venue authority লগইন |
| `/authority/register` | Venue authority নিবন্ধন |
| `/forgot-password` | পাসওয়ার্ড reset link চাওয়া |
| `/reset-password` | reset token দিয়ে নতুন password |
| `/dashboard` | Organizer dashboard |
| `/tournaments` | টুর্নামেন্ট দেখা |
| `/tournaments/create` | টুর্নামেন্ট তৈরি |
| `/tournaments/edit/:id` | টুর্নামেন্ট সম্পাদনা |
| `/tournaments/:id` | টুর্নামেন্টের বিবরণ ও বিভাগ |
| `/tournaments/:id/teams` | দল পরিচালনা |
| `/tournaments/:id/players` | খেলোয়াড় পরিচালনা |
| `/tournaments/:id/matches` | ম্যাচ ও ফলাফল পরিচালনা |
| `/tournaments/:id/budget` | বাজেট পরিচালনা |
| `/turfs`, `/turfs/:id` | Venue/turf দেখা |
| `/authority/dashboard` | Venue authority dashboard |
| `/authority/turfs/new` | নতুন venue নিবন্ধন |
| `/authority/turfs/:id/edit` | venue সম্পাদনা |
| `/authority/turfs/:id` | venue ও field পরিচালনা |

টুর্নামেন্টের বিস্তারিত পৃষ্ঠায় Home, Matches, Squads, Points Table এবং অন্যান্য বিভাগ tab হিসেবে দেখা যায়। Standings ও Awards-এর পুরোনো আলাদা route বর্তমান সক্রিয় router-এ নেই।

## ভূমিকা ও তথ্য সংরক্ষণ

- Organizer এবং venue authority-এর login ও registration আলাদা route এবং backend API ব্যবহার করে।
- Authentication token ও account তথ্য browser-এর local storage-এ থাকে।
- Backend বর্তমানে `backend/mock_db.json`-এ JSON data সংরক্ষণ করে। এতে account, tournament, team, player, match, turf, booking ও review data থাকতে পারে।
- JSON database সম্পাদনা বা reset করার আগে backup রাখুন। User data এবং password hash ব্যক্তিগত তথ্য হিসেবে বিবেচনা করুন।
- Oracle, MongoDB এবং পৃথক file-storage helper repository-তে রয়েছে, তবে বর্তমান `backend/server.js` সেগুলো চালু করে না।

## ম্যানুয়াল যাচাই তালিকা

- [ ] Organizer হিসেবে `/register`-এ account তৈরি ও `/login`-এ প্রবেশ
- [ ] Venue authority হিসেবে `/authority/register` ও `/authority/login` যাচাই
- [ ] Organizer dashboard থেকে tournament তৈরি, দেখা ও সম্পাদনার চেষ্টা
- [ ] Tournament detail পৃষ্ঠা থেকে team, player, match ও budget পৃষ্ঠা খোলা
- [ ] Authority dashboard থেকে turf তৈরি এবং field পরিচালনা
- [ ] Logout-এর পর protected পৃষ্ঠা পুনরায় খোলার আচরণ যাচাই

**বর্তমান সীমাবদ্ধতা:** Player ও Team পৃষ্ঠায় ব্যবহৃত `getPlayersByTeam`, `registerPlayer`, `deletePlayer`, এবং `deleteTeam` function `dataService.js`-এ নেই বলে আগের frontend build-এ warning দেখা গেছে। তাই সংশ্লিষ্ট add/delete কাজ নির্ভরযোগ্য ধরে নেওয়ার আগে এই warning ঠিক হয়েছে কি না যাচাই করুন।

## সাধারণ সমস্যা

- **Backend চালু হয় না:** `backend/.env`-এ `JWT_SECRET` আছে কি না পরীক্ষা করুন।
- **Frontend API-তে সংযোগ হয় না:** Backend চালু আছে এবং port `3001` ব্যবহার করছে কি না দেখুন।
- **Reset email আসে না:** SMTP পরিবেশ ভেরিয়েবল সঠিকভাবে সেট করা আছে কি না যাচাই করুন।
- **পরিবর্তিত data হারিয়ে গেছে:** `backend/mock_db.json`-এর backup পুনরুদ্ধার করুন; reset-এর আগে backup রাখা জরুরি।
- **পৃষ্ঠায় সমস্যা:** Browser developer tools-এর Console এবং Network tab দেখুন।

## ডেটা ধারণা

Tournament-এর সঙ্গে দল, খেলোয়াড়, ম্যাচ, সময়সূচি, ফলাফল ও বাজেটের তথ্য যুক্ত থাকে। Venue authority turf এবং তার fields পরিচালনা করেন; Organizer venue দেখতে ও booking-সংশ্লিষ্ট কাজ করতে পারেন। Backend role এবং turf ownership যাচাই করে।

আরও বিস্তারিত frontend command ও backend API তালিকার জন্য [README.md](./README.md) এবং [BACKEND_SETUP.md](./BACKEND_SETUP.md) দেখুন।
