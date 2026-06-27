import jwt from 'jsonwebtoken';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '3d' });

const setCookieAndRespond = (res, user, statusCode = 200) => {
  const token = signToken(user._id);
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days
  });
  return res.status(statusCode).json({ success: true, token, user: user.toSafeObject() });
};

// --- Register ---
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ success: false, message: 'Email already registered' });

    const user = await User.create({ name, email, password });
    return setCookieAndRespond(res, user, 201);
  } catch (err) {
    next(err);
  }
};

// --- Login ---
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });
    return setCookieAndRespond(res, user);
  } catch (err) {
    next(err);
  }
};

// --- Logout ---
export const logout = (req, res) => {
  res.clearCookie('token', { httpOnly: true, sameSite: 'lax' });
  return res.json({ success: true, message: 'Logged out successfully' });
};

// --- Get Me ---
export const getMe = (req, res) => {
  return res.json({ success: true, user: req.user.toSafeObject() });
};

// --- Google OAuth Setup ---
export const setupPassport = () => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
        proxy: true,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await User.findOne({ googleId: profile.id });
          if (!user) {
            user = await User.findOne({ email: profile.emails[0].value });
            if (user) {
              user.googleId = profile.id;
              user.avatar = profile.photos?.[0]?.value || '';
              await user.save({ validateBeforeSave: false });
            } else {
              user = await User.create({
                name: profile.displayName,
                email: profile.emails[0].value,
                googleId: profile.id,
                avatar: profile.photos?.[0]?.value || '',
              });
            }
          }
          done(null, user);
        } catch (err) {
          done(err, null);
        }
      }
    )
  );
};

export const googleCallback = (req, res) => {
  const token = signToken(req.user._id);
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 3 * 24 * 60 * 60 * 1000,
  });
  res.redirect(`${process.env.CLIENT_URL}/dashboard?token=${token}`);
};
