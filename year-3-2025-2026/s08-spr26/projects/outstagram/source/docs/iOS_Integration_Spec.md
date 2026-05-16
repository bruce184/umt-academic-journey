# Outstagram iOS Integration Specification

> **Version:** 1.0.0 | **Date:** 2026-02-05

This document provides the complete technical specification for the iOS team to integrate with the Outstagram backend API. It is designed to eliminate ambiguity and serve as the contract between iOS and Server.

---

## Project Overview

**Outstagram** is a social media application inspired by Instagram, built as an educational project. It enables users to:

- **Share visual content:** Post photos and videos with captions.
- **Social interactions:** Like posts, comment, follow/unfollow other users.
- **Discover content:** Browse a feed of posts, search for users and posts.
- **Stay updated:** Receive notifications for likes, comments, and new followers.
- **Manage profiles:** Customize display name, bio, and avatar.

### Project Goals

1. Provide a functional Instagram-like experience.
2. Demonstrate full-stack development with React (Web) and Node.js (API).
3. Enable multi-platform support with iOS as the second client.

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Clients                                 │
├─────────────────────────────────┬───────────────────────────────┤
│   React Web App (Vite)          │   iOS App (SwiftUI)           │
│   localhost:5173                │   (To be developed)           │
└─────────────────────────────────┴───────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Express.js API Server                        │
│                    localhost:3001/api                           │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐               │
│  │  Auth MW    │ │  Response   │ │  Error      │               │
│  │  (JWT)      │ │  Middleware │ │  Handler    │               │
│  └─────────────┘ └─────────────┘ └─────────────┘               │
└─────────────────────────────────────────────────────────────────┘
                           │
          ┌────────────────┼────────────────┐
          ▼                ▼                ▼
┌─────────────────┐ ┌─────────────┐ ┌─────────────────┐
│  PostgreSQL     │ │  Supabase   │ │  Supabase       │
│  (via Knex.js)  │ │  Auth       │ │  Storage        │
│  - profiles     │ │  - JWT      │ │  - avatars      │
│  - posts        │ │  - OAuth    │ │  - post_media   │
│  - comments     │ │  - Users    │ │                 │
│  - likes        │ └─────────────┘ └─────────────────┘
│  - follows      │
│  - notifications│
└─────────────────┘
```

---

## Tech Stack

### Backend

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| Runtime | Node.js | 18+ | JavaScript runtime |
| Framework | Express.js | 4.18 | REST API framework |
| Database | PostgreSQL | 15+ | Primary data store |
| Query Builder | Knex.js | 3.1 | Database queries & migrations |
| Auth Provider | Supabase Auth | - | User authentication (OAuth, JWT) |
| Storage | Supabase Storage | - | Media file storage (avatars, posts) |
| JWT Library | jose | 6.1 | Token verification |

### Frontend (Web)

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| Framework | React | 18+ | UI library |
| Build Tool | Vite | 5+ | Development & bundling |
| Routing | React Router | 6+ | Client-side routing |
| Icons | Lucide React | - | Icon library |
| HTTP | Fetch API | - | API communication |

### iOS Client (Target)

| Component | Recommended | Purpose |
|-----------|-------------|---------|
| Language | Swift 5.9+ | App development |
| UI | UIKit + Storyboard | Declarative UI |
| Auth | Supabase Swift SDK | Authentication |
| Networking | URLSession + async/await | API calls |
| Storage | Supabase Swift SDK | Media uploads |

### Infrastructure

| Service | Provider | Purpose |
|---------|----------|---------|
| Database | Supabase (PostgreSQL) | Managed database |
| Auth | Supabase Auth | OAuth, email/password |
| Storage | Supabase Storage | File uploads |
| Backend Hosting | (Flexible) | Render, Railway, etc. |
| Web Hosting | (Flexible) | Vercel, Netlify, etc. |

---

## Table of Contents

1. [System Contract Summary](#1-system-contract-summary)
2. [Authentication & Identity](#2-authentication--identity)
3. [Response Shape & Error Contract](#3-response-shape--error-contract)
4. [Pagination, Sorting, Filtering](#4-pagination-sorting-filtering)
5. [Data Models (DTOs)](#5-data-models-dtos)
6. [Endpoint Catalog](#6-endpoint-catalog)
7. [Media Upload Spec](#7-media-upload-spec)
8. [Real-time / Polling Strategy](#8-real-time--polling-strategy)
9. [Security, Permissions, Rate Limit](#9-security-permissions-rate-limit)
10. [iOS Implementation Notes](#10-ios-implementation-notes)
11. [Open Questions](#11-open-questions)

---

## 1. System Contract Summary

### Base URL

| Environment | Base URL |
|-------------|----------|
| Development | `http://localhost:3001/api` |
| Staging | `{{STAGING_API_URL}}/api` |
| Production | `{{PRODUCTION_API_URL}}/api` |

**API Versioning:** Modern endpoints are under `/api/v1`. Some legacy endpoints exist at `/api`.

### Standard Request Headers

```
Authorization: Bearer <SUPABASE_ACCESS_TOKEN>
Content-Type: application/json
X-Request-Id: <CLIENT_GENERATED_UUID> (optional, server generates if missing)
```

- **X-Request-Id:** If provided by iOS, this will be echoed in the response for tracing. Generate using `UUID().uuidString`.

### Time Convention

All timestamps are **ISO 8601 format in UTC**, e.g., `"2026-02-05T12:30:00.000Z"`.

### ID Type Convention

| Entity | ID Type | Example |
|--------|---------|---------|
| `profiles.user_id` | UUID String | `"a1b2c3d4-..."` |
| `posts.id` | BigInt (Integer) | `12345` |
| `posts.owner_id` | UUID String | `"a1b2c3d4-..."` |
| `comments.id` | BigInt (Integer) | `67890` |
| `notifications.id` | BigInt (Integer) | `111` |
| `post_media.id` | BigInt (Integer) | `222` |

> **IMPORTANT:** iOS must decode `user_id`, `owner_id`, `actor_id`, `recipient_id`, `follower_id`, `following_id` as **String (UUID)**. All other `id` fields are **Int64 (BigInt)**.

---

## 2. Authentication & Identity

### 2.1 Google Sign-In via Supabase OAuth (iOS)

**Flow:**
1. iOS uses Supabase Swift SDK: `supabase.auth.signInWithOAuth(provider: .google, redirectTo: yourScheme://callback)`.
2. SDK handles ASWebAuthenticationSession, user consents, and returns session.
3. Extract `session.accessToken` (JWT) for API calls.

**Code Example (Swift):**
```swift
import Supabase

let client = SupabaseClient(
    supabaseURL: URL(string: "{{SUPABASE_URL}}")!,
    supabaseKey: "{{SUPABASE_ANON_KEY}}"
)

// Sign In
try await client.auth.signInWithOAuth(provider: .google) { url in
    // Handle URL in ASWebAuthenticationSession
}

// Get Token
let accessToken = try await client.auth.session.accessToken
```

### 2.2 Backend JWT Verification

The backend uses `supabaseAnon.auth.getUser(token)` to verify the JWT.
- **Issuer/Audience:** Implicitly validated by Supabase SDK. Backend trusts Supabase-issued tokens.
- **User Identity Mapping:** `auth.users.id` → `profiles.user_id` (UUID).

### 2.3 Profile Bootstrap ("First Login")

**Behavior:** The `GET /api/v1/me` endpoint checks if a `profiles` row exists. If not, it **auto-creates** one from `auth.users.user_metadata`.
- iOS **MUST** call `GET /api/v1/me` immediately after successful auth to ensure profile exists.
- If profile creation fails, server returns `404` with `error.code = "PROFILE_CREATION_FAILED"`.

**Recommended iOS Flow:**
1. Google Sign-In → Get `accessToken`.
2. Call `GET /api/v1/me`.
3. If success → proceed to feed.
4. If `404 PROFILE_CREATION_FAILED` → show error, prompt retry/contact support.

### 2.4 Session Expiry & Refresh

**Supabase tokens expire (default ~1 hour).** iOS SDK handles refresh automatically.

**Server Response on Expired Token:**
- `401` with `error.code = "AUTH_EXPIRED_TOKEN"`

**iOS Retry Logic:**
1. On `401 AUTH_EXPIRED_TOKEN` → call `client.auth.refreshSession()`.
2. Retry original request **once** with new token.
3. If still fails → force logout, redirect to login.

### 2.5 "Me" Endpoints

Endpoints prefixed with `/me` always use the authenticated user's ID from the JWT. No `userId` parameter is needed.

| Endpoint | Description |
|----------|-------------|
| `GET /api/v1/me` | Get current user's auth info + profile |
| `PATCH /api/v1/profiles/me` | Update own profile |
| `POST /api/v1/profiles/me/avatar` | Update own avatar |

---

## 3. Response Shape & Error Contract

### 3.1 Success Envelope

```json
{
  "ok": true,
  "data": { /* endpoint-specific payload */ },
  "meta": {
    "requestId": "uuid-string",
    "timestamp": "2026-02-05T12:00:00.000Z",
    "pagination": { /* optional */ }
  }
}
```

### 3.2 Error Envelope

```json
{
  "ok": false,
  "error": {
    "code": "ERROR_CODE_ENUM",
    "message": "Human readable message",
    "details": null | { /* additional context */ }
  },
  "meta": {
    "requestId": "uuid-string",
    "timestamp": "2026-02-05T12:00:00.000Z"
  }
}
```

### 3.3 HTTP Status Code Mapping

| HTTP | Meaning | Typical `error.code` |
|------|---------|----------------------|
| 400 | Bad Request / Validation | `VALIDATION_ERROR` |
| 401 | Unauthenticated | `AUTH_MISSING_TOKEN`, `AUTH_INVALID_TOKEN`, `AUTH_EXPIRED_TOKEN`, `AUTH_USER_NOT_FOUND` |
| 403 | Forbidden | `FORBIDDEN` |
| 404 | Not Found | `NOT_FOUND` |
| 409 | Conflict (duplicate) | `CONFLICT` |
| 422 | Semantic Error | `VALIDATION_ERROR` |
| 429 | Rate Limited | (Not currently implemented) |
| 500 | Internal Error | `INTERNAL_ERROR` |

### 3.4 Standard Error Codes (Enum for iOS)

```swift
enum OutstagramErrorCode: String, Codable {
    case authMissingToken = "AUTH_MISSING_TOKEN"
    case authInvalidToken = "AUTH_INVALID_TOKEN"
    case authExpiredToken = "AUTH_EXPIRED_TOKEN"
    case authUserNotFound = "AUTH_USER_NOT_FOUND"
    case forbidden = "FORBIDDEN"
    case notFound = "NOT_FOUND"
    case validationError = "VALIDATION_ERROR"
    case conflict = "CONFLICT"
    case internalError = "INTERNAL_ERROR"
    case profileCreationFailed = "PROFILE_CREATION_FAILED"
    case createPostFailed = "CREATE_POST_FAILED"
    case updateFailed = "UPDATE_FAILED"
    case deleteFailed = "DELETE_FAILED"
    case resetFailed = "RESET_FAILED"
}
```

### 3.5 Idempotency & Retry

| Endpoint Type | Retry Safe? | Notes |
|---------------|-------------|-------|
| `GET` | ✅ Yes | Always safe |
| `POST /likes/:postId/toggle` | ✅ Yes | Toggle is idempotent |
| `POST /users/:userId/follow` | ✅ Yes | Insert if not exists, no-op if exists |
| `DELETE /users/:userId/follow` | ✅ Yes | Delete is idempotent |
| `POST /posts` | ❌ No | Creates new post each time |
| `POST /comments/:postId` | ❌ No | Creates new comment each time |

---

## 4. Pagination, Sorting, Filtering

### 4.1 Cursor-Based Pagination (Feed, Notifications)

**Query Parameters:**
- `limit`: Number of items (default: 20, max: 50)
- `cursor`: ISO8601 timestamp of the last item's `created_at` from previous page

**Response Meta:**
```json
"pagination": {
  "limit": 20,
  "nextCursor": "2026-02-04T10:00:00.000Z"
}
```

**iOS Logic:**
1. First request: no `cursor` param.
2. Subsequent: `?cursor=<nextCursor from previous response>`.
3. If `nextCursor` is `null`, no more pages.

**Applies to:**
- `GET /api/feed`
- `GET /api/notifications`

### 4.2 Offset-Based Pagination (User Posts, Followers, Following)

**Query Parameters:**
- `limit`: Number of items (default: 12 or 20)
- `offset`: Number of items to skip (default: 0)

**Applies to:**
- `GET /api/v1/profiles/:username/posts` (default limit: 12)
- `GET /api/v1/profiles/:username/followers` (default limit: 20)
- `GET /api/v1/profiles/:username/following` (default limit: 20)

### 4.3 Sorting

All list endpoints return items sorted by `created_at DESC` (newest first).

### 4.4 Proposed Standardization

> **Recommendation:** Backend should unify on cursor-based pagination for all list endpoints. Offset pagination can cause issues with insertions during browsing.

---

## 5. Data Models (DTOs)

### 5.1 Profile DTO

```json
{
  "user_id": "uuid-string",        // required, UUID
  "username": "john_doe",          // required, string
  "display_name": "John Doe",      // required, string
  "bio": "Hello world",            // optional, string, max 150 chars
  "avatar_url": "https://...",     // optional, string URL
  "is_private": false,             // required, boolean
  "post_count": 42,                // required, int
  "follower_count": 100,           // required, int
  "following_count": 50,           // required, int
  "is_following": true,            // required, boolean (from viewer's perspective)
  "is_own_profile": false          // required, boolean
}
```

### 5.2 Post DTO

```json
{
  "id": 12345,                     // required, BigInt
  "owner_id": "uuid-string",       // required, UUID
  "caption": "My caption",         // required, string, max 2200 chars
  "created_at": "2026-02-05T...",  // required, ISO8601
  "username": "john_doe",          // required, string
  "display_name": "John Doe",      // required, string
  "avatar_url": "https://...",     // optional, string
  "media": [ /* PostMedia[] */ ],  // required, array
  "like_count": 10,                // required, int
  "comment_count": 5,              // required, int
  "liked_by_viewer": true          // required, boolean
}
```

### 5.3 PostMedia DTO

```json
{
  "url": "https://...",            // required, string
  "type": "image",                 // required, "image" | "video"
  "position": 0                    // required, int (0-indexed)
}
```

### 5.4 Comment DTO

```json
{
  "id": 67890,                     // required, BigInt
  "post_id": 12345,                // required, BigInt (on creation response)
  "user_id": "uuid-string",        // required, UUID
  "content": "Nice photo!",        // required, string
  "created_at": "2026-02-05T...",  // required, ISO8601
  "username": "jane_doe",          // required, string
  "display_name": "Jane Doe",      // required, string
  "avatar_url": "https://..."      // optional, string
}
```

### 5.5 Notification DTO

```json
{
  "id": 111,                       // required, BigInt
  "type": "like",                  // required, "like" | "comment" | "follow"
  "recipient_id": "uuid-string",   // required, UUID
  "actor_id": "uuid-string",       // required, UUID
  "actor": {
    "username": "jane_doe",
    "display_name": "Jane Doe",
    "avatar_url": "https://..."
  },
  "post_id": 12345,                // optional, BigInt (for like/comment)
  "post_thumbnail": "https://...", // optional, string (first media URL)
  "comment_id": 67890,             // optional, BigInt (for comment)
  "is_read": false,                // required, boolean
  "created_at": "2026-02-05T..."   // required, ISO8601
}
```

### 5.6 Follow User Item DTO (Followers/Following Lists)

```json
{
  "user_id": "uuid-string",
  "username": "jane_doe",
  "display_name": "Jane Doe",
  "avatar_url": "https://...",
  "is_following": true            // current user follows this user?
}
```

---

## 6. Endpoint Catalog

### 6.1 Auth / Me

#### `GET /api/v1/me`
- **Auth:** Required
- **Request:** None
- **Response (200):**
```json
{
  "ok": true,
  "data": {
    "user": {
      "id": "uuid-string",
      "email": "user@example.com",
      "last_sign_in_at": "2026-02-05T..."
    },
    "profile": { /* Profile DTO */ }
  },
  "meta": { ... }
}
```
- **Errors:** `401 AUTH_*`, `404 PROFILE_CREATION_FAILED`
- **Notes:** Auto-creates profile if missing. iOS MUST call after auth.

---

### 6.2 Profiles

#### `GET /api/v1/profiles/:username`
- **Auth:** Required
- **Path Params:** `username` (string)
- **Response (200):**
```json
{
  "ok": true,
  "data": {
    "profile": { /* Profile DTO */ }
  }
}
```
- **Errors:** `404 NOT_FOUND`

#### `PATCH /api/v1/profiles/me`
- **Auth:** Required
- **Body:**
```json
{
  "display_name": "New Name",      // optional, max 50 chars
  "bio": "New bio"                 // optional, max 150 chars
}
```
- **Response (200):**
```json
{ "ok": true, "data": { "profile": { /* updated Profile DTO */ } } }
```
- **Errors:** `400 VALIDATION_ERROR` (length exceeded, no fields)

#### `POST /api/v1/profiles/me/avatar`
- **Auth:** Required
- **Body:**
```json
{
  "avatar_url": "https://...",     // required
  "avatar_path": "avatars/uuid/..." // optional, for storage cleanup
}
```
- **Response (200):**
```json
{ "ok": true, "data": { "profile": { ... } } }
```

#### `GET /api/v1/profiles/:username/posts`
- **Auth:** Required
- **Query:** `limit`, `offset`
- **Response (200):**
```json
{ "ok": true, "data": { "posts": [ /* Post DTO[] (partial, grid view) */ ] } }
```
- **Notes:** Returns posts with media, like_count, comment_count. No `liked_by_viewer`.

#### `GET /api/v1/profiles/:username/followers`
- **Auth:** Required
- **Query:** `limit` (default 20), `offset`
- **Response (200):**
```json
{ "ok": true, "data": { "followers": [ /* FollowUserItem DTO[] */ ] } }
```

#### `GET /api/v1/profiles/:username/following`
- **Auth:** Required
- **Query:** `limit` (default 20), `offset`
- **Response (200):**
```json
{ "ok": true, "data": { "following": [ /* FollowUserItem DTO[] */ ] } }
```

---

### 6.3 Posts

#### `POST /api/v1/posts`
- **Auth:** Required
- **Body:**
```json
{
  "caption": "My post caption",
  "media": [
    { "media_type": "image", "media_url": "https://...", "media_path": "posts/...", "position": 0 }
  ]
}
```
- **Validation:**
  - Caption max 2200 chars.
  - At least 1 media item required.
  - Positions must be unique.
- **Response (201):**
```json
{ "ok": true, "data": { "post": { "id": 12345, "owner_id": "...", "caption": "...", "created_at": "..." } } }
```
- **Errors:** `400 VALIDATION_ERROR`, `409 DUPLICATE_ERROR`

#### `GET /api/v1/posts/:id`
- **Auth:** Required
- **Path Params:** `id` (BigInt)
- **Response (200):**
```json
{ "ok": true, "data": { "post": { /* Full Post DTO */ } } }
```
- **Errors:** `404 NOT_FOUND` (or if `is_deleted = true`)

#### `PATCH /api/v1/posts/:id`
- **Auth:** Required
- **Body:** `{ "caption": "Updated caption" }`
- **Response (200):**
```json
{ "ok": true, "data": { "post": { ... } } }
```
- **Errors:** `403 FORBIDDEN` (not owner), `404 NOT_FOUND`

#### `DELETE /api/v1/posts/:id`
- **Auth:** Required
- **Response (200):**
```json
{ "ok": true, "data": { "message": "Post deleted" } }
```
- **Behavior:** Sets `is_deleted = true` (soft delete). Post no longer appears in feed/profile.
- **Errors:** `403 FORBIDDEN`, `404 NOT_FOUND`

---

### 6.4 Feed

#### `GET /api/feed`
- **Auth:** Required
- **Query:** `limit` (default 20, max 50), `cursor` (ISO8601)
- **Response (200):**
```json
{
  "ok": true,
  "data": { "items": [ /* Post DTO[] */ ] },
  "meta": { "pagination": { "limit": 20, "nextCursor": "2026-02-04T..." } }
}
```
- **Notes:** Returns all posts (no following filter currently). `liked_by_viewer` included.

---

### 6.5 Comments

#### `GET /api/v1/comments/:postId`
- **Auth:** Required
- **Path Params:** `postId` (BigInt)
- **Response (200):**
```json
{ "ok": true, "data": { "comments": [ /* Comment DTO[] */ ] } }
```
- **Notes:** Sorted by `created_at ASC`. No pagination currently.

#### `POST /api/v1/comments/:postId`
- **Auth:** Required
- **Body:** `{ "content": "Nice!" }`
- **Response (201):**
```json
{ "ok": true, "data": { "comment": { /* Comment DTO */ } } }
```
- **Side Effects:** Creates `"comment"` notification for post owner (via DB trigger).
- **Errors:** `422 VALIDATION_ERROR` (empty content)

---

### 6.6 Likes

#### `POST /api/v1/likes/:postId/toggle`
- **Auth:** Required
- **Path Params:** `postId` (BigInt)
- **Response (200):**
```json
{ "ok": true, "data": { "success": true } }
```
- **Behavior:** If liked → unlike. If not liked → like.
- **Side Effects:** Creates `"like"` notification on like (via DB trigger). Notification deleted on unlike (if implemented).
- **Notes:** Idempotent toggle. Response does not indicate final state; iOS should toggle local state.

---

### 6.7 Follows

#### `POST /api/v1/users/:userId/follow`
- **Auth:** Required
- **Path Params:** `userId` (UUID to follow)
- **Response (200 or 201):**
```json
{ "ok": true, "data": { "following": true } }
```
- **Behavior:** If already following, returns 200. If new follow, returns 201.
- **Side Effects:** Creates `"follow"` notification (via DB trigger).
- **Errors:** `422 VALIDATION_ERROR` (missing userId, self-follow)

#### `DELETE /api/v1/users/:userId/follow`
- **Auth:** Required
- **Path Params:** `userId` (UUID to unfollow)
- **Response (200):**
```json
{ "ok": true, "data": { "following": false } }
```
- **Behavior:** Deletes follow record. Idempotent.

---

### 6.8 Search

#### `GET /api/v1/search/users/:query`
- **Auth:** Optional (currently)
- **Path Params:** `query` (string, 1-30 chars)
- **Response (200):**
```json
{ "ok": true, "data": [ /* Profile-like objects with follower_count */ ] }
```
- **Notes:** Returns up to 10 users, sorted by follower_count DESC.

#### `GET /api/v1/search/posts/:query`
- **Auth:** Optional (currently)
- **Path Params:** `query` (string, 1-30 chars)
- **Response (200):**
```json
{ "ok": true, "data": [ /* Post objects (minimal) */ ] }
```
- **Notes:** Searches caption. Returns up to 10 posts.

> **Proposed:** Change path to query param style: `GET /api/v1/search?type=users&q=...`

---

### 6.9 Notifications

#### `GET /api/notifications`
- **Auth:** Required
- **Query:** `limit` (default 20, max 50), `cursor` (ISO8601)
- **Response (200):**
```json
{
  "ok": true,
  "data": { "items": [ /* Notification DTO[] */ ] },
  "meta": { "pagination": { "limit": 20, "nextCursor": "..." } }
}
```

#### `GET /api/notifications/unread-count`
- **Auth:** Required
- **Response (200):**
```json
{ "ok": true, "data": { "unreadCount": 5 } }
```

#### `PATCH /api/notifications/:id/read`
- **Auth:** Required
- **Path Params:** `id` (BigInt)
- **Response (200):**
```json
{ "ok": true, "data": { "notification": { /* Notification DTO */ } } }
```
- **Errors:** `404 NOT_FOUND`, `403 FORBIDDEN` (not recipient)

#### `POST /api/notifications/mark-read`
- **Auth:** Required
- **Body:** `{ "ids": [1, 2, 3] }`
- **Response (200):**
```json
{ "ok": true, "data": { "updatedCount": 3 } }
```

#### `POST /api/notifications/mark-all-read`
- **Auth:** Required
- **Response (200):**
```json
{ "ok": true, "data": { "updatedCount": 15 } }
```

---

## 7. Media Upload Spec

### 7.1 Supabase Storage Buckets

| Bucket | Purpose | Visibility |
|--------|---------|------------|
| `avatars` | User profile pictures | Public |
| `post_media` | Post images/videos | Public |

### 7.2 Path Conventions

```
avatars/<user_id>/<uuid>.<ext>
post_media/<user_id>/<uuid>_<position>.<ext>
```

### 7.3 iOS Upload Flow (Post Creation)

1. **Pick Image/Video:** Use `PHPickerViewController`.
2. **Compress:**
   - Image: JPEG, quality 0.8, max 1080px width.
   - Video: Export with `AVAssetExportPresetMediumQuality`.
3. **Generate Path:**
   ```swift
   let path = "post_media/\(userId)/\(UUID().uuidString)_\(position).jpg"
   ```
4. **Upload to Supabase:**
   ```swift
   let file = File(name: filename, data: imageData, fileName: filename, contentType: "image/jpeg")
   try await supabase.storage.from("post_media").upload(path: path, file: file)
   ```
5. **Get Public URL:**
   ```swift
   let publicUrl = supabase.storage.from("post_media").getPublicUrl(path: path)
   ```
6. **Call API:**
   ```swift
   POST /api/v1/posts
   {
     "caption": "...",
     "media": [{ "media_type": "image", "media_url": publicUrl, "media_path": path, "position": 0 }]
   }
   ```

### 7.4 Avatar Update Flow

Same as above, but use `avatars` bucket and call `POST /api/v1/profiles/me/avatar`.

### 7.5 Error Handling

- **Upload Failure:** Retry up to 3 times with exponential backoff.
- **Orphaned Files:** If API call fails after upload, file remains. Backend should have scheduled cleanup job (not currently implemented).

---

## 8. Real-time / Polling Strategy

### 8.1 Current Implementation

Real-time is **not implemented** server-side. Use **polling**.

### 8.2 Polling Recommendations

| Data | Interval | Endpoint |
|------|----------|----------|
| Unread notification count | 30s (foreground) | `GET /api/notifications/unread-count` |
| Full notifications list | On tab focus | `GET /api/notifications` |
| Feed | Pull-to-refresh | `GET /api/feed` |

### 8.3 Battery Optimization

- Suspend polling when app is backgrounded.
- Use `BGAppRefreshTask` for periodic badge updates.

### 8.4 Future: Supabase Realtime

If enabled:
```swift
let channel = supabase.channel("notifications")
try await channel.on(
    .postgresChanges,
    filter: ChannelFilter(table: "notifications", filter: "recipient_id=eq.\(userId)")
) { event in
    // Handle new notification
}
try await channel.subscribe()
```

---

## 9. Security, Permissions, Rate Limit

### 9.1 Ownership Rules

| Action | Rule |
|--------|------|
| Edit/Delete Post | Only `owner_id` matches `req.userId` |
| Edit Profile | Only own profile (`/me` endpoints) |
| Delete Comment | Not implemented (only owner's own comments, proposed) |
| Mark Notification Read | Only `recipient_id` matches `req.userId` |

### 9.2 Soft Delete Behavior

- `posts.is_deleted = true`: Excluded from feed, profile, and detail view returns `404`.
- `comments.is_deleted = true`: Excluded from comment list.

### 9.3 Input Validation

| Field | Rule |
|-------|------|
| `caption` | Max 2200 chars |
| `display_name` | Max 50 chars |
| `bio` | Max 150 chars |
| `username` | 3-30 chars, alphanumeric + `_` + `.` |
| `comment.content` | Non-empty |
| `password` | Min 6 chars |

### 9.4 Rate Limiting

**Not currently implemented.** iOS should implement local rate limiting for double-tap prevention.

---

## 10. iOS Implementation Notes

### 10.1 Networking Layer

```swift
actor APIClient {
    let supabase: SupabaseClient
    
    func request<T: Decodable>(_ endpoint: Endpoint) async throws -> T {
        var request = URLRequest(url: endpoint.url)
        request.httpMethod = endpoint.method
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue(UUID().uuidString, forHTTPHeaderField: "X-Request-Id")
        
        // Inject token
        let token = try await supabase.auth.session.accessToken
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        
        let (data, response) = try await URLSession.shared.data(for: request)
        
        // Handle 401
        if (response as? HTTPURLResponse)?.statusCode == 401 {
            try await supabase.auth.refreshSession()
            return try await request(endpoint) // Retry once
        }
        
        return try JSONDecoder().decode(T.self, from: data)
    }
}
```

### 10.2 JSON Decoding Strategy

```swift
let decoder = JSONDecoder()
decoder.keyDecodingStrategy = .convertFromSnakeCase
decoder.dateDecodingStrategy = .iso8601
```

### 10.3 Optimistic UI

- **Like Toggle:** Update UI immediately, revert on error.
- **Follow/Unfollow:** Same pattern.
- **Use debounce (0.3s) to prevent rapid toggles.**

### 10.4 Caching

- Cache feed in-memory for instant back-navigation.
- Use `NSCache` or SwiftData for persistence.
- Clear cache on logout.

---

## 11. Open Questions

> These require backend owner confirmation before iOS implementation.

1. **`posts.id` type:** Confirmed BigInt? Or UUID? (Currently BigInt)
2. **Feed filter:** Should feed only show followed users' posts? (Currently shows all)
3. **Comment Delete:** Endpoint exists? Who can delete? (Not implemented)
4. **Like list:** Endpoint to get users who liked a post? (Not implemented)
5. **Username update:** Can users change username? Endpoint? (Not implemented)
6. **Private profiles:** Is `is_private` enforced? (Field exists, no logic)
7. **Block/Mute:** Any plans? (Not implemented)
8. **Notification types:** Only `like`, `comment`, `follow`? Any others?
9. **Rate limiting:** Any plans? What limits?
10. **Pagination standardization:** Unify on cursor-based?
11. **Search auth:** Should `GET /search/*` require auth?
12. **Video upload:** Max file size? Duration limits?
13. **Image compression:** Server-side or client-only?
14. **Orphan cleanup:** Scheduled job for unused media?
15. **Realtime:** Plans to enable Supabase Realtime?
16. **Push notifications:** Any FCM/APNs integration?
17. **Report content:** Endpoint for reporting posts/users?
18. **Account deletion:** GDPR-compliant endpoint?
19. **Email verification:** Required before posting?
20. **Error details locale:** `error.message` in English only?

---

*End of Document*
