## NearHelp — Local Community Aid & Skill Exchange Platform

** Label: *WORKING*

## About the Project
**NearHelp** is a hyperlocal community platform designed to connect neighbors and community members for small help requests and skill sharing.

Whether it’s:
- Borrowing tools
- Helping with errands
- Tutoring
- Pet care
- Repairs

…NearHelp helps people easily find & offer help from **verified trusted people nearby**, without ads or commission.

## Core Problem it Solves
Most people:
1. **Don’t know who can help nearby**  
2. **Have unused skills or tools** others could benefit from  
3. Rely on random social media posts or expensive service apps

## Core Features (MVP)
- Email/password authentication (**Phase 1 completed**)
- Dynamic feed of nearby *help requests* and *offers*
- In-app messaging between seekers & helpers  
- Geo-location based search and filtering
- Anonymous posting with timed identity reveal
- Basic trust/reputation system

## Upcoming Roadmap (Phases)

### **Phase 1** — Foundation & Authentication (*Current Stage*)
- Repo structure with `client` + `server`
- React Router navigation (`/login`, `/signup`, `/home`)
- Firebase email/password authentication
- Protected routes for logged-in users
- Polished UI (Home, Login, Signup)

### **Phase 2** — Needs Posting & Geo Feed
- Firestore setup for `needs` collection
- Post a new **help request** with title, category, location
- Fetch and display posts in a community feed
- Basic filtering by category & distance

### Future Phases
- **Phase 3:** Apply to Needs + In-App Chat  
- **Phase 4:** Availability Calendar & Scheduling  
- **Phase 5:** Anonymous Posting & Reveal Logic  
- **Phase 6:** Ratings, Reviews & Trust System  
- **Phase 7:** Skills Marketplace (permanent helper listings)  
- **Phase 8:** Moderation & Admin Dashboard  
- **Phase 9:** PWA + Offline Mode + SEO polish

##  Tech Stack
- **Frontend:** React.js + Tailwind CSS + Lucide Icons
- **Backend:** Node.js + Express.js
- **Database & Auth:** Firebase (Auth, Firestore, Storage)
- **Maps/Location:** Geohash + (Mapbox/Google Maps - later phase)
- **State Management:** React Context + Hooks (expandable later)

current ui screenshots->
<img width="1896" height="825" alt="image" src="https://github.com/user-attachments/assets/7307fd9b-672a-4dbd-a910-ff1145ac3b12" />
