# discordauth

Discord OAuth2 を使った Web アプリ認証テンプレート。

- **Backend**: Bun + Hono + bun:sqlite + jose (JWT) — RESTful API として機能
- **Frontend**: React + TypeScript + Vite
- **認証方式**: Discord OAuth2 → JWT を httpOnly Cookie に格納

## 構成

```
discordauth/
├── backend/     # Hono API サーバー (http://localhost:3000)
└── frontend/    # React SPA (http://localhost:5173)
```

## セットアップ

### 1. Discord Application の作成

1. https://discord.com/developers/applications で新しい Application を作成
2. 「OAuth2」ページを開く
3. **Redirects** に `http://localhost:3000/auth/discord/callback` を追加
4. **Client ID** と **Client Secret** を控える

### 2. Backend

```powershell
cd backend
cp .env.example .env
# .env を編集して DISCORD_CLIENT_ID / DISCORD_CLIENT_SECRET / JWT_SECRET を設定
bun install
bun run dev
```

### 3. Frontend

```powershell
cd frontend
cp .env.example .env
bun install
bun run dev
```

ブラウザで http://localhost:5173 を開き、「Login with Discord」をクリック。

## 認証フロー

```
[Frontend] --click login--> [Backend /auth/discord/login]
                                       |
                                       v
                           state cookie を発行して Discord へ redirect
                                       |
                                       v
                            [Discord] 承認画面
                                       |
                                       v
                       [Backend /auth/discord/callback]
                        - state 検証 (CSRF)
                        - code を access_token と交換
                        - Discord /users/@me を取得
                        - SQLite に upsert
                        - JWT を httpOnly Cookie にセット
                                       |
                                       v
                        [Frontend /dashboard] に redirect
```

## REST API エンドポイント

認証は httpOnly Cookie (`auth_token`) で行います。Cookie を含むリクエストで利用可能。

| Method | Path                       | 認証 | 説明                                    |
| ------ | -------------------------- | ---- | --------------------------------------- |
| GET    | `/health`                  | -    | ヘルスチェック                          |
| GET    | `/auth/discord/login`      | -    | Discord 認可画面へリダイレクト          |
| GET    | `/auth/discord/callback`   | -    | OAuth コールバック (Discord から呼ばれる) |
| POST   | `/auth/logout`             | -    | Cookie をクリア                         |
| GET    | `/api/me`                  | 必須 | 現在ログイン中のユーザー情報            |

### REST クライアントから呼び出す例

ブラウザ外から利用する場合は、まず OAuth フローをブラウザで通して `Set-Cookie` を受け取り、以降のリクエストで Cookie を同梱してください。

```sh
# ログイン後に発行された Cookie を使って /api/me を叩く
curl -b cookies.txt http://localhost:3000/api/me
```

## 本番運用時の注意

- `JWT_SECRET` は十分な長さのランダム文字列に差し替える
- HTTPS を利用する場合は `COOKIE_SECURE=true`
- 別オリジンで動かすなら `COOKIE_DOMAIN` を設定、CORS 設定も見直す
- Discord の **Redirects** URL も本番 URL に更新
