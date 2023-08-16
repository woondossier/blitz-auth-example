import { passportAuth, PublicData } from "@blitzjs/auth"
import { Strategy as Auth0Strategy } from "passport-auth0"
import { PassportAuth0Profile, TokenEndpointResponse, VerifyCallbackResult } from "../../../types"
import { api } from "../../../blitz-server"
import db from "../../../../db"
import { UserRole } from "../../../auth/mutations/login"

export default api(
  passportAuth(({ ctx }) => ({
    successRedirectUrl: "/",
    errorRedirectUrl: "/",
    strategies: [
      {
        // strategy name is 'auth0'
        authenticateOptions: { scope: "openid email profile" },
        strategy: new Auth0Strategy(
          {
            domain: "dev-nv4kor434ds3ajmp.eu.auth0.com",
            clientID: "Cfwl07LcCK3JqFqxWGa7t5LZRYi0O0rV",
            clientSecret: "QIzHBolCZMRipKGvX2VN50JQUwANUEl16PN15YOXBOUKVv3G9Mc283xjY9UZj1gS",
            callbackURL: `http://localhost:3000/api/auth/auth0/callback`, // the 'auth0' part here is the strategy name
          },
          async (
            _accessToken: string, // access token
            _tokenSecret: string, // ???
            authTokens: TokenEndpointResponse & { token_type: string },
            profile: PassportAuth0Profile,
            done: (error?: Error, result?: VerifyCallbackResult) => void
          ) => {
            const email = profile.emails && profile.emails[0]?.value
            if (!email) {
              // This can happen if you haven't enabled email access in your Auth0 app permissions
              return done(new Error("Auth response doesn't have email."))
            }

            // Get user from database
            const user = await db.user.findUnique({
              where: { auth0Id: profile.id },
              include: { userRoles: { select: { name: true } } },
            })
            if (user == null) done(new Error("Can't find user in database."))
            else {
              // Define publicData for session
              const publicData: PublicData = {
                name: user.name,
                email: user.email,
                userId: user.id,
                auth0Id: user.auth0Id,
                externalUserId: user.auth0Id,
                role: Math.max(
                  ...user.userRoles.map(({ name }) => UserRole[name.replace(" ", "")])
                ),
                companyId: user.companyId,
                source: profile.provider,
              }

              const { _redirectUrl: redirectUrl } = ctx.session.$publicData

              // Create blitz session in redis from with publicData
              done(undefined, { publicData, redirectUrl })
            }
          }
        ),
      },
    ],
  }))
)
