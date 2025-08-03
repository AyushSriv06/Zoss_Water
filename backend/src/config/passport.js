const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const { v4: uuidv4 } = require('uuid');

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.userId);
});

// Deserialize user from session
passport.deserializeUser(async (userId, done) => {
  try {
    const user = await User.findOne({ userId });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/api/auth/google/callback",
  scope: ['profile', 'email']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user already exists
    let user = await User.findOne({ 
      $or: [
        { email: profile.emails[0].value },
        { providerId: profile.id }
      ]
    });

    if (user) {
      // Update provider info if user exists but doesn't have Google provider
      if (user.provider !== 'google') {
        user.provider = 'google';
        user.providerId = profile.id;
        await user.save();
      }
    } else {
      // Create new user
      user = await User.create({
        userId: uuidv4(),
        name: profile.displayName,
        email: profile.emails[0].value,
        provider: 'google',
        providerId: profile.id,
        isActive: true
      });
    }

    return done(null, user);
  } catch (error) {
    return done(error, null);
  }
}));

module.exports = passport; 