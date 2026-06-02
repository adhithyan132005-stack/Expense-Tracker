const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../app/models/userModel');

// ─────────────────────────────────────────
// Serialize user into session
// ─────────────────────────────────────────
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// ─────────────────────────────────────────
// Deserialize user from session
// ─────────────────────────────────────────
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

// ─────────────────────────────────────────
// Google OAuth Strategy
// ─────────────────────────────────────────
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // Check if user already exists via googleId
                let user = await User.findOne({ googleId: profile.id });

                if (user) {
                    return done(null, user);
                }

                // Check if a user with the same email exists
                const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
                if (email) {
                    user = await User.findOne({ email });
                    if (user) {
                        // Link Google account to existing user
                        user.googleId = profile.id;
                        user.avatar = profile.photos && profile.photos[0] ? profile.photos[0].value : user.avatar;
                        await user.save();
                        return done(null, user);
                    }
                }

                // Create a new user
                const newUser = new User({
                    username: profile.displayName || profile.username || `user_${profile.id}`,
                    email,
                    googleId: profile.id,
                    avatar: profile.photos && profile.photos[0] ? profile.photos[0].value : null,
                    isVerified: true,
                    loginMethod: 'google',
                });

                await newUser.save();
                return done(null, newUser);
            } catch (error) {
                return done(error, null);
            }
        }
    )
);

// ─────────────────────────────────────────
// GitHub OAuth Strategy
// ─────────────────────────────────────────
passport.use(
    new GitHubStrategy(
        {
            clientID: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            callbackURL: process.env.GITHUB_CALLBACK_URL || 'http://localhost:5000/api/auth/github/callback',
            scope: ['user:email'],
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // Check if user already exists via githubId
                let user = await User.findOne({ githubId: profile.id });

                if (user) {
                    return done(null, user);
                }

                // Check if a user with the same email exists
                const email =
                    profile.emails && profile.emails[0] ? profile.emails[0].value : null;
                if (email) {
                    user = await User.findOne({ email });
                    if (user) {
                        // Link GitHub account to existing user
                        user.githubId = profile.id;
                        user.avatar = profile.photos && profile.photos[0] ? profile.photos[0].value : user.avatar;
                        await user.save();
                        return done(null, user);
                    }
                }

                // Create a new user
                const newUser = new User({
                    username: profile.username || profile.displayName || `github_${profile.id}`,
                    email,
                    githubId: profile.id,
                    avatar: profile.photos && profile.photos[0] ? profile.photos[0].value : null,
                    isVerified: true,
                    loginMethod: 'github',
                });

                await newUser.save();
                return done(null, newUser);
            } catch (error) {
                return done(error, null);
            }
        }
    )
);

module.exports = passport;
