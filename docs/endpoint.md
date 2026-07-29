# HaloReels Mobile API — Flutter Integration Guide

Reference for wiring the Flutter app to the backend. All paths are relative to:

```
BASE_URL = http://localhost:3000/api        # iOS Simulator only
BASE_URL = http://10.0.2.2:3000/api         # Android Emulator
BASE_URL = http://192.168.x.x:3000/api      # Physical device (your Mac's LAN IP)
BASE_URL = https://api.haloreels.com/api    # production
```

> **Connection refused?** `localhost` on a **physical phone** or **Android emulator** points to the device itself — not your Mac. See [Flutter local networking](#flutter-local-networking-connection-refused) below.

Interactive docs: `{BASE_URL}/docs` (Swagger)

---

## Flutter local networking (connection refused)

If you see:

```
DioException [connection error]: Connection refused
SocketException: ... address = localhost, port = ...
```

**Cause:** The Flutter app cannot reach your Mac's backend.

| Where you run Flutter | Set `baseUrl` to |
|----------------------|------------------|
| **iOS Simulator** | `http://localhost:3000/api` |
| **Android Emulator** | `http://10.0.2.2:3000/api` |
| **Physical iPhone/Android** | `http://<MAC_LAN_IP>:3000/api` e.g. `http://192.168.1.9:3000/api` |

Find your Mac's LAN IP:

```bash
ipconfig getifaddr en0   # Wi‑Fi
```

**Checklist:**

1. Backend running: `cd backend && npm run dev` → should log `API running at http://localhost:3000/api`
2. Port must be **3000** (not a random port like `65469`)
3. Phone and Mac on the **same Wi‑Fi**
4. Mac firewall allows incoming connections on port 3000 (or temporarily disable for dev)

**Flutter config example:**

```dart
// lib/core/config/env.dart
class AppConfig {
  static String get apiBaseUrl {
    const override = String.fromEnvironment('API_BASE_URL');
    if (override.isNotEmpty) return override;

    // Pick one for your target:
    return 'http://10.0.2.2:3000/api';           // Android emulator
    // return 'http://localhost:3000/api';       // iOS simulator
    // return 'http://192.168.1.9:3000/api';     // physical device
  }
}
```

Run with override:

```bash
flutter run --dart-define=API_BASE_URL=http://192.168.1.9:3000/api
```

**Quick test from terminal (replace IP):**

```bash
curl http://192.168.1.9:3000/api/health
# expect: {"success":true,"data":{...}}
```

---

## Core concepts

### 1. Response envelope

Every successful JSON response is wrapped:

```json
{
  "success": true,
  "data": { ... }
}
```

Errors return HTTP 4xx/5xx with a `message` field.

### 2. Anonymous device session (no sign-up)

On first app launch:

1. Resolve a **stable device ID** (platform SDK ID — see below).
2. Call `POST /devices/register` with that ID.
3. Send `X-Device-Id: <deviceId>` on **every** subsequent request.

The backend stores watchlist, progress, coins, settings, and unlocks against this device **without** creating a `User` row. This is the anonymous “temp” identity.

#### Stable device ID — SDK first (recommended for coins & payments)

You're right: **secure storage is wiped on uninstall**, so a UUID-only approach loses anonymous coins, unlocks, and watchlist after reinstall.

For HaloReels — where users can earn coins and pay **before** signing in — use a **platform SDK device ID** as `deviceId` so the backend can recognize the same physical device after reinstall.

| Approach | Survives uninstall? | Best for |
|----------|---------------------|----------|
| **UUID in secure storage** | ❌ No | Dev/testing only |
| **Android `ANDROID_ID`** | ✅ Yes (same app reinstall) | Anonymous coins, payment tracing |
| **iOS `identifierForVendor`** | ⚠️ Only if ≥1 app from your team remains installed; resets if user removes all your apps | Same, with caveat |
| **iOS Keychain backup** | ✅ Often survives reinstall (same team ID) | Pair with IDFV on iOS |
| **Social login (Google/Apple)** | ✅ Permanent (account-based) | Ultimate source of truth for paid users |

**Recommended strategy (SDK primary)**

```
1. Read platform device ID via device_info_plus
2. Prefix it: "android-{id}" or "ios-{identifierForVendor}"
3. Send that string as deviceId to POST /devices/register and X-Device-Id
4. Optionally cache in secure storage for faster reads (SDK is source of truth)
5. On social login → pass same deviceId → merges into User account
6. For payments → backend traces by deviceId even if user hasn't signed in yet
```

**Platform details**

| Platform | SDK field | Stability |
|----------|-----------|-----------|
| Android | `AndroidDeviceInfo.id` (`Settings.Secure.ANDROID_ID`) | Stable across uninstall/reinstall of your app. Changes on factory reset. |
| iOS | `IosDeviceInfo.identifierForVendor` | Stable while any app from your Apple Team ID is installed. New ID if user deletes all your apps then reinstalls. |

**iOS extra: Keychain persistence**

On iOS, also store the resolved `deviceId` in **Keychain** (`flutter_secure_storage` with `KeychainAccessibility` / iOS Keychain group). Keychain entries often survive app uninstall for the same developer team — use as backup when IDFV might reset:

```dart
// Resolve once from SDK, mirror to Keychain for iOS reinstall recovery
final sdkId = await _resolvePlatformDeviceId();
await _storage.write(key: 'device_id_mirror', value: sdkId);
return sdkId;
```

**UUID fallback**

Only generate a UUID if the SDK returns null (emulator edge cases, web):

```dart
final sdkId = await _resolvePlatformDeviceId();
return sdkId ?? const Uuid().v4();
```

**What the backend does**

The API accepts any opaque string ≥ 8 chars. Same `deviceId` after reinstall → same `MobileDevice` row in the database → **coins, unlocks, and watchlist are preserved** even without sign-in.

When the user later pays or signs in with Google/Apple:

- `POST /wallet/refill` / `POST /vip/subscribe` → traced to `deviceId` + `userId`
- `POST /auth/social/google` with `deviceId` → links device history to the User permanently

> **Do not** use advertising IDs (IDFA / GAID) for `deviceId` — users can reset them and store policies require consent.

> **Privacy:** Disclose in your privacy policy that you use a device identifier for watch history, rewards, and purchase restoration.

### 3. Social login links device → user

When the user signs in with Google or Apple, pass the same `deviceId` in the social login body. The backend:

- Creates or finds a real `User`
- Sets `MobileDevice.userId = user.id`
- Merges watchlist, progress, coins, VIP, settings, and unlocked episodes into the user account

After login, send **both** headers:

```
X-Device-Id: android-a1b2c3d4...   # or ios-XXXXXXXX-XXXX-...
Authorization: Bearer <accessToken>
```

### 4. What requires auth?

| Access | Endpoints |
|--------|-----------|
| **No auth** (device ID only) | Catalog, playback, watchlist, rewards, settings, device register |
| **Social auth required** | `POST /wallet/refill`, `POST /vip/subscribe`, `GET /wallet/transactions`, `GET /auth/me`, `POST /auth/logout` |

Mobile auth is **Google / Apple only**. Email/password is for the admin/creator web app.

---

## Recommended Flutter architecture

```
lib/
├── core/
│   ├── api/
│   │   ├── api_client.dart          # Dio/http + interceptors
│   │   └── api_response.dart        # unwrap { success, data }
│   └── storage/
│       └── device_id_storage.dart     # SDK device ID + Keychain mirror
├── features/
│   ├── auth/
│   │   ├── data/auth_repository.dart
│   │   └── data/social_auth_service.dart   # google_sign_in / sign_in_with_apple
│   ├── catalog/
│   ├── playback/
│   ├── watchlist/
│   └── wallet/
```

### Packages (suggested)

```yaml
dependencies:
  dio: ^5.0.0
  device_info_plus: ^10.0.0       # primary — stable SDK device ID
  flutter_secure_storage: ^9.0.0  # iOS Keychain mirror (survives reinstall)
  uuid: ^4.0.0                    # fallback only (emulator / web)
  google_sign_in: ^6.0.0
  sign_in_with_apple: ^6.0.0
```

---

## Step-by-step Flutter implementation

### Step 1 — Stable device ID (SDK primary)

```dart
// lib/core/storage/device_id_storage.dart
import 'dart:io';
import 'package:device_info_plus/device_info_plus.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:uuid/uuid.dart';

class DeviceIdStorage {
  static const _mirrorKey = 'haloreels_device_id_mirror';
  final FlutterSecureStorage _storage;
  final DeviceInfoPlugin _deviceInfo;

  DeviceIdStorage({
    FlutterSecureStorage? storage,
    DeviceInfoPlugin? deviceInfo,
  })  : _storage = storage ?? const FlutterSecureStorage(),
        _deviceInfo = deviceInfo ?? DeviceInfoPlugin();

  /// Stable ID sent as X-Device-Id — survives uninstall on Android;
  /// on iOS use SDK id + Keychain mirror.
  Future<String> getOrCreate() async {
    final sdkId = await _resolvePlatformDeviceId();
    if (sdkId != null) {
      // Mirror to Keychain (helps iOS recover after reinstall)
      await _storage.write(key: _mirrorKey, value: sdkId);
      return sdkId;
    }

    // Emulator / web fallback
    final mirrored = await _storage.read(key: _mirrorKey);
    if (mirrored != null && mirrored.length >= 8) return mirrored;

    final fallback = const Uuid().v4();
    await _storage.write(key: _mirrorKey, value: fallback);
    return fallback;
  }

  Future<String?> _resolvePlatformDeviceId() async {
    if (Platform.isAndroid) {
      final info = await _deviceInfo.androidInfo;
      final androidId = info.id; // Settings.Secure.ANDROID_ID
      if (androidId.isNotEmpty && androidId != 'unknown') {
        return 'android-$androidId';
      }
    }

    if (Platform.isIOS) {
      final info = await _deviceInfo.iosInfo;
      final idfv = info.identifierForVendor;
      if (idfv != null && idfv.isNotEmpty) {
        return 'ios-$idfv';
      }
      // IDFV null — try Keychain mirror from previous install
      return _storage.read(key: _mirrorKey);
    }

    return null;
  }
}
```

### Step 2 — API client with interceptors

```dart
// lib/core/api/api_client.dart
import 'package:dio/dio.dart';

class ApiClient {
  ApiClient({
    required String baseUrl,
    required Future<String> Function() getDeviceId,
    Future<String?> Function()? getAccessToken,
  })  : _getDeviceId = getDeviceId,
        _getAccessToken = getAccessToken,
        _dio = Dio(BaseOptions(
          baseUrl: baseUrl,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        )) {
    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        options.headers['X-Device-Id'] = await _getDeviceId();
        final token = await _getAccessToken?.call();
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        handler.next(options);
      },
    ));
  }

  final Dio _dio;
  final Future<String> Function() _getDeviceId;
  final Future<String?> Function()? _getAccessToken;

  Future<T> get<T>(String path, {Map<String, dynamic>? query, required T Function(dynamic) parse}) async {
    final res = await _dio.get(path, queryParameters: query);
    return parse(_unwrap(res.data));
  }

  Future<T> post<T>(String path, {Object? body, required T Function(dynamic) parse}) async {
    final res = await _dio.post(path, data: body);
    return parse(_unwrap(res.data));
  }

  dynamic _unwrap(dynamic json) {
    if (json is Map && json['success'] == true) return json['data'];
    return json;
  }
}
```

### Step 3 — Bootstrap on app start

Call this in `main()` or your splash screen **before** showing the home feed:

```dart
// lib/features/auth/data/device_repository.dart
class DeviceRepository {
  DeviceRepository(this._api, this._deviceStorage);

  final ApiClient _api;
  final DeviceIdStorage _deviceStorage;

  Future<DeviceSession> bootstrap() async {
    final deviceId = await _deviceStorage.getOrCreate();
    final data = await _api.post<Map<String, dynamic>>(
      '/devices/register',
      body: {'deviceId': deviceId},
      parse: (d) => d as Map<String, dynamic>,
    );
    return DeviceSession.fromJson(data);
  }
}

class DeviceSession {
  final String deviceId;
  final String? linkedUserId;
  final int coinBalance;
  final bool isAnonymous;

  DeviceSession.fromJson(Map<String, dynamic> j)
      : deviceId = j['deviceId'] as String,
        linkedUserId = j['linkedUserId'] as String?,
        coinBalance = j['coinBalance'] as int,
        isAnonymous = j['isAnonymous'] as bool;
}
```

### Step 4 — Social login (link device)

```dart
// lib/features/auth/data/auth_repository.dart
class AuthRepository {
  AuthRepository(this._api, this._deviceStorage, this._tokenStorage);

  Future<AuthSession> signInWithGoogle() async {
    final googleUser = await GoogleSignIn(scopes: ['email']).signIn();
    final auth = await googleUser!.authentication;
    final deviceId = await _deviceStorage.getOrCreate();

    final data = await _api.post<Map<String, dynamic>>(
      '/auth/social/google',
      body: {
        'idToken': auth.idToken,
        'deviceId': deviceId, // merges anonymous history
      },
      parse: (d) => d as Map<String, dynamic>,
    );

    await _tokenStorage.save(
      accessToken: data['tokens']['accessToken'],
      refreshToken: data['tokens']['refreshToken'],
    );

    return AuthSession.fromJson(data);
  }

  Future<AuthSession> signInWithApple() async {
    final credential = await SignInWithApple.getAppleIDCredential(
      scopes: [AppleIDAuthorizationScopes.email, AppleIDAuthorizationScopes.fullName],
    );
    final deviceId = await _deviceStorage.getOrCreate();

    final data = await _api.post<Map<String, dynamic>>(
      '/auth/social/apple',
      body: {
        'idToken': credential.identityToken,
        'deviceId': deviceId,
      },
      parse: (d) => d as Map<String, dynamic>,
    );

    await _tokenStorage.save(
      accessToken: data['tokens']['accessToken'],
      refreshToken: data['tokens']['refreshToken'],
    );

    return AuthSession.fromJson(data);
  }

  Future<void> refreshToken() async {
    final refresh = await _tokenStorage.getRefreshToken();
    final data = await _api.post<Map<String, dynamic>>(
      '/auth/refresh-token',
      body: {'refreshToken': refresh},
      parse: (d) => d as Map<String, dynamic>,
    );
    await _tokenStorage.save(
      accessToken: data['tokens']['accessToken'],
      refreshToken: data['tokens']['refreshToken'],
    );
  }
}
```

### Step 5 — Token refresh on 401

```dart
// In Dio interceptor onError:
if (err.response?.statusCode == 401) {
  await authRepository.refreshToken();
  // retry original request
}
```

---

## Endpoint reference

Legend: **Public** = no Bearer token · **Device** = `X-Device-Id` required · **Auth** = Bearer token required

---

### Device — anonymous session

#### `POST /devices/register` · Public

Register or refresh an anonymous device. Call once on first launch, then periodically (e.g. app resume).

**Request**
```json
{ "deviceId": "550e8400-e29b-41d4-a716-446655440000" }
```

**Response `data`**
```json
{
  "deviceId": "550e8400-e29b-41d4-a716-446655440000",
  "linkedUserId": null,
  "coinBalance": 50,
  "isAnonymous": true,
  "settings": {
    "autoPlayNextEpisode": true,
    "pushNotifications": true,
    "cellularStreaming": false
  },
  "createdAt": "2026-07-28T12:00:00.000Z",
  "lastSeenAt": "2026-07-28T12:00:00.000Z"
}
```

After social login, `linkedUserId` will be set and `isAnonymous` becomes `false`.

#### `GET /devices/bootstrap?deviceId={uuid}` · Public

Same as register, useful for deep links or quick checks.

---

### Auth — social login (primary)

#### `POST /auth/social/google` · Public

#### `POST /auth/social/apple` · Public

**Request**
```json
{
  "idToken": "<OIDC id_token from Google or Apple SDK>",
  "deviceId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response `data`**
```json
{
  "user": {
    "id": "clx...",
    "email": "user@gmail.com",
    "name": "Jane Doe",
    "avatarUrl": "https://...",
    "role": "viewer",
    "emailVerified": true,
    "createdAt": "...",
    "updatedAt": "..."
  },
  "tokens": {
    "accessToken": "eyJ...",
    "refreshToken": "abc123...",
    "expiresIn": 900
  },
  "linkedDeviceId": "550e8400-e29b-41d4-a716-446655440000",
  "authProvider": "google"
}
```

#### `POST /auth/refresh-token` · Public

**Request**
```json
{ "refreshToken": "abc123..." }
```

#### `GET /auth/me` · Auth

Current signed-in user profile.

#### `POST /auth/logout` · Auth

Invalidates refresh tokens server-side.

---

### Catalog — all public (no device ID required, but recommended)

#### `GET /catalog/movies?page=0&limit=20&category=&search=`

Home feed (paginated).

**Response `data`**
```json
{
  "items": [
    {
      "id": "seed-project-halo-dark-secret",
      "title": "Halo Dark Secret",
      "description": "...",
      "genre": "Supernatural Drama",
      "category": "Supernatural Drama",
      "thumbnailUrl": "https://...",
      "thumbnailPortraitUrl": "https://...",
      "episodeCount": 3,
      "isPremium": false,
      "rating": 4.5
    }
  ],
  "page": 0,
  "limit": 20,
  "total": 1,
  "hasMore": false
}
```

#### `GET /catalog/movies/{movieId}`

Movie detail + episodes list.

**Response `data`**
```json
{
  "id": "seed-project-halo-dark-secret",
  "title": "Halo Dark Secret",
  "description": "...",
  "genre": "Supernatural Drama",
  "thumbnailUrl": "https://...",
  "episodeCount": 3,
  "creator": {
    "id": "...",
    "name": "Demo Creator",
    "avatarUrl": null
  },
  "episodes": [
    {
      "id": "...",
      "number": 1,
      "title": "The Halo Reflection",
      "synopsis": "...",
      "durationSec": 60,
      "isLocked": false,
      "coinCost": 0,
      "status": "published",
      "videoUrl": "https://cdn.haloreels.com/..."
    },
    {
      "number": 2,
      "title": "...",
      "isLocked": true,
      "coinCost": 10
    }
  ]
}
```

> Episode 1 is free. Episodes 2+ are locked until unlocked with coins or VIP.

#### `GET /catalog/recommendations?deviceId=`

For You feed. `deviceId` optional but helps personalization later.

#### `GET /catalog/search?q=halo&page=0&limit=20`

Search movies by title/description.

---

### Playback — public · Device required

Headers: `X-Device-Id: <uuid>`

#### `GET /playback/{movieId}/episodes/{episodeNumber}`

Get stream URL for an episode.

**Response `data`**
```json
{
  "movieId": "seed-project-halo-dark-secret",
  "episodeNumber": 1,
  "streamUrl": "https://cdn.haloreels.com/demo/.../ep-1.m3u8",
  "signedToken": "eyJ...",
  "expiresAt": "2026-07-28T13:00:00.000Z",
  "durationSec": 60,
  "isAnonymous": true,
  "deviceId": "550e8400-...",
  "episode": { "number": 1, "title": "...", "isLocked": false }
}
```

Use `streamUrl` with your video player (e.g. `video_player`, `better_player`, or `chewie` for HLS).

#### `POST /playback/{movieId}/episodes/{episodeNumber}/progress`

Save watch position.

**Request**
```json
{ "positionSec": 45, "durationSec": 60 }
```

#### `POST /playback/{movieId}/episodes/{episodeNumber}/unlock`

Unlock a locked episode using device coins (10 coins default). No sign-in required.

**Response `data`**
```json
{
  "unlocked": true,
  "coinBalance": 40,
  "coinsSpent": 10,
  "deviceId": "550e8400-..."
}
```

---

### Watchlist — public · Device required

Headers: `X-Device-Id: <uuid>`

#### `GET /watchlist`

#### `PUT /watchlist`

Replace entire list.

**Request**
```json
{
  "items": [
    { "movieId": "seed-project-halo-dark-secret", "watchedAt": "2026-07-28T12:00:00.000Z" }
  ]
}
```

#### `POST /watchlist/items`

**Request**
```json
{
  "movieId": "seed-project-halo-dark-secret",
  "watchedAt": "2026-07-28T12:00:00.000Z"
}
```

#### `DELETE /watchlist/items/{movieId}`

---

### Rewards — public · Device required

#### `GET /rewards`

Returns coin balance, daily quests, and tasks.

#### `POST /rewards/quests/claim-all`

#### `POST /rewards/tasks/{taskId}/claim`

#### `POST /rewards/tasks/{taskId}/perform`

---

### Settings — public · Device optional

Headers: `X-Device-Id` recommended

#### `GET /settings`

#### `PATCH /settings`

**Request**
```json
{
  "autoPlayNextEpisode": true,
  "pushNotifications": false,
  "cellularStreaming": true
}
```

---

### Profile — public · Device optional

#### `GET /profile/following`

#### `GET /profile/items` — purchased/unlocked items

#### `GET /notifications` — empty array when anonymous; populated after sign-in

#### `POST /feedback`

**Request**
```json
{ "message": "Love the app!", "rating": 5, "email": "optional@example.com" }
```

#### `POST /invitation/redeem`

**Request**
```json
{ "code": "HALO2026" }
```

---

### Wallet & VIP — auth required for payments

#### `GET /wallet/balance` · Public (device)

Read coin balance without sign-in.

#### `GET /wallet/transactions?page=0` · **Auth**

Payment history (requires social sign-in).

#### `POST /wallet/refill` · **Auth**

**Request**
```json
{
  "packageId": "coins-550",
  "paymentToken": "<store-receipt-or-payment-token>"
}
```

Package IDs (seeded): `coins-100`, `coins-550`, `coins-1200`

#### `GET /vip/plans` · Public

List subscription plans.

#### `POST /vip/subscribe` · **Auth**

**Request**
```json
{
  "planId": "vip-monthly",
  "paymentToken": "<store-receipt>"
}
```

Plan IDs: `vip-monthly`, `vip-yearly`

---

## Flutter app lifecycle checklist

```
App launch
  └─ DeviceIdStorage.getOrCreate()
  └─ POST /devices/register
  └─ GET /catalog/movies          (home feed — no auth)

User taps episode
  └─ GET /catalog/movies/{id}     (episode list + lock state)
  └─ GET /playback/{id}/episodes/1   (stream URL)
  └─ POST /playback/.../progress     (save position on pause/exit)

User adds to My List
  └─ POST /watchlist/items

User taps locked episode
  └─ POST /playback/.../unlock    (spend coins)
  └─ GET /playback/...            (stream)

User taps Subscribe / Buy coins
  └─ POST /auth/social/google     (with deviceId!)
  └─ POST /vip/subscribe          (with Bearer token)
  └─ POST /wallet/refill          (with Bearer token)

App resume
  └─ POST /devices/register       (refresh lastSeenAt)
```

---

## Error handling

| HTTP | Meaning | Flutter action |
|------|---------|----------------|
| 400 | Bad request (e.g. missing device ID, insufficient coins) | Show error message from `message` |
| 401 | Unauthorized | Refresh token or prompt social sign-in |
| 404 | Movie/episode not found | Show empty state |
| 409 | Conflict | Rare — retry or show message |

---

## Local dev quick test

```bash
# 1. Start backend
cd backend && npm run dev

# 2. Register device
curl -X POST http://localhost:3000/api/devices/register \
  -H "Content-Type: application/json" \
  -d '{"deviceId":"test-device-flutter-001"}'

# 3. Browse catalog (no auth)
curl http://localhost:3000/api/catalog/movies

# 4. Get stream (device header)
curl http://localhost:3000/api/playback/seed-project-halo-dark-secret/episodes/1 \
  -H "X-Device-Id: test-device-flutter-001"

# 5. Add to watchlist
curl -X POST http://localhost:3000/api/watchlist/items \
  -H "Content-Type: application/json" \
  -H "X-Device-Id: test-device-flutter-001" \
  -d '{"movieId":"seed-project-halo-dark-secret"}'
```

---

## Swagger

Full interactive reference with request schemas:

```
http://localhost:3000/api/docs
```

Look for tags: **Mobile — Device**, **Mobile — Auth**, **Mobile — Catalog**, **Mobile — Playback**, **Mobile — Watchlist**, **Mobile — Wallet**, **Mobile — VIP**.

---

## Notes for production

1. **Use SDK device ID** (`ANDROID_ID` / `identifierForVendor`) as `X-Device-Id` — not a random UUID — so coins and payments survive reinstall.
2. **Mirror to iOS Keychain** as backup when `identifierForVendor` may reset.
3. **Always pass `deviceId` on social login** so anonymous data merges into the User account (permanent).
4. **Validate Google/Apple tokens server-side** before production.
5. **`movieId`** = published creator `projectId`.
6. Episode 1 is free; episodes 2+ cost 10 coins or VIP.
7. **Factory reset / iOS delete-all-apps** = new device ID = fresh anonymous session (expected). Social sign-in is the recovery path for paid users.
