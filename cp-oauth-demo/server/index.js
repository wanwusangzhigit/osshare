import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 13450;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const CP_OAUTH_BASE = 'https://www.cpoauth.com/api/oauth';
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI || `http://localhost:${PORT}/callback`;

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('ERROR: CLIENT_ID and CLIENT_SECRET must be set in .env file');
  process.exit(1);
}

// Exchange authorization code for access token
app.post('/api/login', async (req, res) => {
  try {
    const { code, code_verifier } = req.body;

    if (!code || !code_verifier) {
      return res.status(400).json({ error: 'Missing code or code_verifier' });
    }

    // Exchange authorization code for tokens
    const tokenResponse = await fetch(`${CP_OAUTH_BASE}/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: REDIRECT_URI,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code_verifier: code_verifier,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('Token exchange failed:', errorData);
      return res.status(400).json({ error: 'Failed to exchange authorization code' });
    }

    const tokenData = await tokenResponse.json();
    const { access_token } = tokenData;

    // Fetch user info with all scopes
    const userinfoResponse = await fetch(`${CP_OAUTH_BASE}/userinfo`, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    if (!userinfoResponse.ok) {
      const errorData = await userinfoResponse.text();
      console.error('Userinfo fetch failed:', errorData);
      return res.status(400).json({ error: 'Failed to fetch user info' });
    }

    const userInfo = await userinfoResponse.json();

    // Return complete user data to frontend
    res.json({
      success: true,
      user: userInfo,
      tokens: {
        access_token: access_token,
        refresh_token: tokenData.refresh_token,
        expires_in: tokenData.expires_in,
        token_type: tokenData.token_type,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Refresh token endpoint
app.post('/api/refresh', async (req, res) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(400).json({ error: 'Missing refresh_token' });
    }

    const response = await fetch(`${CP_OAUTH_BASE}/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'refresh_token',
        refresh_token: refresh_token,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
      }),
    });

    if (!response.ok) {
      return res.status(400).json({ error: 'Failed to refresh token' });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Refresh error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Revoke token endpoint
app.post('/api/revoke', async (req, res) => {
  try {
    const { token, token_type_hint } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Missing token' });
    }

    const response = await fetch(`${CP_OAUTH_BASE}/revoke`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: token,
        token_type_hint: token_type_hint || 'access_token',
      }),
    });

    // Always returns 200 per RFC 7009
    res.json({ success: true });
  } catch (error) {
    console.error('Revoke error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Redirect URI: ${REDIRECT_URI}`);
});
