const Integration = require('../models/Integration');
const ActivityMetric = require('../models/ActivityMetric');
const ingestionService = require('../services/ingestion.service');

// Mock configuration for OAuth providers
const PROVIDER_CONFIG = {
  google_fit: {
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    clientId: process.env.GOOGLE_CLIENT_ID || 'mock_client_id',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'mock_client_secret',
    scope: 'https://www.googleapis.com/auth/fitness.activity.read',
  },
  // Add other providers here
};

/**
 * Initiate OAuth flow
 * @route GET /api/integrations/auth/:provider
 */
exports.initiateAuth = async (req, res) => {
  const { provider } = req.params;
  
  if (!PROVIDER_CONFIG[provider]) {
    return res.status(400).json({ success: false, error: 'Invalid provider' });
  }

  // In a real app, we would construct the URL with client ID, redirect URI, scope, state, etc.
  // For this mock implementation, we'll redirect to a client-side page that simulates the login
  // or just return the URL for the frontend to redirect.
  
  const redirectUri = `${process.env.CLIENT_URL}/integrations/callback/${provider}`;
  const state = Buffer.from(JSON.stringify({ userId: req.user.id })).toString('base64');
  
  const authUrl = `${PROVIDER_CONFIG[provider].authUrl}?client_id=${PROVIDER_CONFIG[provider].clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${PROVIDER_CONFIG[provider].scope}&state=${state}`;

  res.json({ success: true, authUrl });
};

/**
 * Handle OAuth callback
 * @route POST /api/integrations/auth/:provider/callback
 */
exports.handleCallback = async (req, res) => {
  const { provider } = req.params;
  const { code } = req.body; // In a real flow, code comes from query params to frontend, then POSTed here

  if (!PROVIDER_CONFIG[provider]) {
    return res.status(400).json({ success: false, error: 'Invalid provider' });
  }

  try {
    // MOCK: Exchange code for tokens
    // const tokens = await exchangeCodeForTokens(provider, code);
    const tokens = {
      access_token: `mock_access_token_${Date.now()}`,
      refresh_token: `mock_refresh_token_${Date.now()}`,
      expires_in: 3600,
    };

    // Save or update integration
    const integration = await Integration.findOneAndUpdate(
      { userId: req.user.id, provider },
      {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: new Date(Date.now() + tokens.expires_in * 1000),
        isActive: true,
        lastSync: new Date(),
      },
      { new: true, upsert: true }
    );

    res.json({ success: true, integration });
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.status(500).json({ success: false, error: 'Authentication failed' });
  }
};

/**
 * Get aggregated activity data
 * @route GET /api/integrations/:provider/data
 */
exports.getData = async (req, res) => {
  const { provider } = req.params;
  const { start, end, type } = req.query;

  try {
    const query = {
      userId: req.user.id,
      source: provider,
      timestamp: {
        $gte: new Date(start || new Date().setHours(0, 0, 0, 0)),
        $lte: new Date(end || new Date()),
      },
    };

    if (type) {
      query.type = type;
    }

    const data = await ActivityMetric.find(query).sort({ timestamp: 1 });

    res.json({ success: true, count: data.length, data });
  } catch (error) {
    console.error('Get data error:', error);
    res.status(500).json({ success: false, error: 'Failed to retrieve data' });
  }
};

/**
 * Manually ingest data (for testing/simulation)
 * @route POST /api/integrations/:provider/ingest
 */
exports.ingestData = async (req, res) => {
  const { provider } = req.params;
  const { data } = req.body;

  try {
    const result = await ingestionService.ingestBatch(req.user.id, provider, data);
    res.json(result);
  } catch (error) {
    console.error('Manual ingestion error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
