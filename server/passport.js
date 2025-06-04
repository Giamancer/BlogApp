require('dotenv').config();

const passport = require("passport");
const GoogleStrategy = require('passport-google-oauth20').Strategy;

// code to setup using google auth credentials clientId and clientSecret, and assigning a callback url 
passport.use(new GoogleStrategy({
	    clientID: process.env.clientID,
	    clientSecret: process.env.clientSecret,
	    callbackURL: "http://localhost:4000/users/google/callback",
	    passReqToCallback: true
	},

	function(request, accessToken, refreshToken, profile, done){
		return done(null,profile); // 1st argument is reserved for errors, we want to pass no error as default that's why we always use null as first argument value
	}
));


/*
serializeUser → Saves user data to the session.
deserializeUser → Retrieves user data from the session.
*/

// without serializeUser and deserializeUser, Passport won’t store or retrieve session data.
passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});




