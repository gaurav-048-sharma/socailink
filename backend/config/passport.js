const passport = require('passport');
const MicrosoftStrategy = require('passport-microsoft').Strategy;
const { OIDCStrategy } = require('passport-azure-ad');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../model/authModel.js');
const jwt = require('jsonwebtoken');

passport.use(
  new MicrosoftStrategy(
    {
      clientID: process.env.MICROSOFT_CLIENT_ID,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
      callbackURL: '/api/auth/microsoft/callback', // We’ll fix this next
      scope: ['user.read'],
      tenantId: process.env.MICROSOFT_TENANT_ID,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        let user = await User.findOne({ email });
        if (!user) {
          user = new User({
            email,
            name: profile.displayName,
            microsoftId: profile.id,
            username: email.split('@')[0], // e.g., 23BTIT101
          });
          await user.save();
        } else if (!user.microsoftId) {
          user.microsoftId = profile.id;
          await user.save();
        }
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        user.token = token;
        return done(null, { id: user._id, accessToken });
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

passport.use(new GoogleStrategy(
  {
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/api/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ googleId: profile.id });

      if (!user) {
        const existingEmailUser = await User.findOne({ email: profile.emails[0].value });
        if (existingEmailUser) {
          return done(null, false, { message: 'Email already registered with another account.' });
        }

        user = new User({
          username: profile.displayName || profile.emails[0].value.split('@')[0],
          email: profile.emails[0].value,
          googleId: profile.id,
        });

        await user.save();
      }

      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
));

// Serialize user into session
passport.serializeUser((user, done) => {
    done(null, user._id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

module.exports = passport;





