## Social Features Slice

### Counted as already done
- social sidebar foundation in `frontend/src/components/hub/SocialSidebar.jsx`

### Own from now on
- friends system
- friend requests
- messaging
- achievements
- pagination for friends and messages
- social seed data

### Write scope

Frontend:
- `frontend/src/pages/client/FriendsPage.jsx`
- `frontend/src/pages/client/MessagesPage.jsx`
- `frontend/src/pages/client/AchievementsPage.jsx`
- `frontend/src/components/social/`
- `frontend/src/services/friendService.js`
- `frontend/src/services/messageService.js`
- `frontend/src/services/achievementService.js`

Backend:
- `src/controllers/friendController.js`
- `src/controllers/messageController.js`
- `src/controllers/achievementController.js`
- `src/routes/friendRoutes.js`
- `src/routes/messageRoutes.js`
- `src/routes/achievementRoutes.js`
- `src/services/friendService.js`
- `src/services/messageService.js`
- `src/services/achievementService.js`

DB and seeds:
- `friend_requests`
- `friendships`
- `messages`
- `achievements`
- `user_achievements`
- social demo seeds

### Deliverables
- send and accept friend requests
- paginated friend list
- non-realtime messages
- achievements with seeded examples