# Rubric Checklist

Use this file as the pre-submission gate. Only leave an item checked if it is present in code, seeded data, and local demo flow.

## General Data and Delivery
- [x] At least 5 users exist with meaningful data
- [x] At least 3 meaningful records exist for each user feature and admin feature
- [x] Migrations run from a clean database
- [x] Seeds populate demo-ready data
- [x] Backend is Express.js
- [x] Backend is separated from frontend and exposes RESTful APIs
- [x] Frontend is React SPA
- [x] Frontend and backend env configuration is documented and used
- [x] Git history uses meaningful commits

## Frontend: Authentication and Roles
- [x] Login works
- [x] Register works with input validation
- [x] Password reset works
- [x] At least 2 roles exist: user and admin
- [x] Protected routes block unauthorized users
- [x] Client and Admin UIs are clearly different

## Frontend: Main Layout
- [x] Main client UI includes board, controls, player info, navbar, and footer
- [x] Browser navigation works with real routes and URL changes
- [x] Dark mode and light mode both work
- [x] Layout is aligned and visually consistent
- [x] Typography is consistent and semantically appropriate

## Frontend: Board and Controls
- [x] The matrix board is interactive
- [x] Left behaves consistently
- [x] Right behaves consistently
- [x] Enter behaves consistently
- [x] Back behaves consistently
- [x] Hint/Help behaves consistently
- [x] Menu selection is clearly visible on the board itself
- [x] Game state changes are clearly visible on the board itself

## Required Games
- [x] Caro 5 is playable
- [x] Caro 4 is playable
- [x] Tic-Tac-Toe is playable
- [x] Snake is playable
- [x] Match-3 is playable
- [x] Memory is playable
- [x] Free Draw is playable

## Per-Game Completion
Every required game must satisfy all items below:

- [x] Board rendering on matrix
- [x] 5-button control flow is reasonable
- [x] Score or result display exists
- [x] Timer exists where appropriate
- [x] Timer can be changed where required
- [x] Save works
- [x] Load works
- [x] Hint/help exists
- [x] Computer or valid solo mode works as required

## User Features
- [x] Profile management exists
- [x] User search exists
- [x] Friend management exists
- [x] Messaging exists without requiring real-time transport
- [x] Achievements exist
- [x] Rankings exist
- [x] Rankings can filter by game
- [x] Rankings can filter by global scope
- [x] Rankings can filter by friends scope
- [x] Rankings can filter by personal scope
- [x] Friends list has pagination
- [x] Rankings have pagination
- [x] Messages have pagination
- [x] Game rating exists
- [x] Game comment exists

## Admin Features
- [x] Admin dashboard exists
- [x] User management exists
- [x] Statistics include at least 2 real criteria
- [x] Game management exists
- [x] Admin can enable/disable games
- [x] Admin can update board size
- [x] Admin can update timer or config

## Backend Quality
- [x] Knex is used
- [x] Supabase is used as the database
- [x] MVC structure is clear and defensible
- [x] API docs page exists
- [x] API docs require authentication
- [ ] HTTPS is used in deployment
- [x] API key is configured and used where required

## Seeded Demo Scenarios
- [x] Seeded users have profile data
- [x] Seeded users have rankings/stats
- [x] Seeded users have friend relationships
- [x] Seeded users have pending friend requests
- [x] Seeded users have messages
- [x] Seeded users have achievements
- [x] Seeded users have saved games
- [x] Seeded users have ratings/comments
- [x] Seeded admin account can show admin dashboard meaningfully
- [x] Seeded games have config data

## Final Demo Flow
- [x] User can log in and navigate the client app
- [x] User can play several games
- [x] User can save and load game state
- [x] User can read help for games
- [x] User can rate and comment on a game
- [x] User can search another user
- [x] User can send a friend request
- [x] User can send a message
- [x] User can view rankings in all scopes
- [x] Admin can log in and manage users
- [x] Admin can view statistics
- [x] Admin can manage game configuration
- [x] Admin can open protected API docs

## Bonus Opportunities
- [x] Theme has a strong and coherent visual identity
- [ ] App is deployed with live data
- [ ] Caro supports multiple AI levels
- [ ] Guided tutorial or scenario-based help exists

## Current Verdict

Local rubric status is green except for deployment-only items:

- Remaining mandatory blocker: HTTPS deployment if the final submission requires a hosted build
- Remaining optional bonuses: live deployment, multi-level Caro AI, guided tutorial flow
