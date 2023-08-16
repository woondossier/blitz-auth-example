import { SecurePassword } from "@blitzjs/auth/secure-password"
import { resolver } from "@blitzjs/rpc"
import db from "db"
import { Signup } from "../schemas"
import { UserRole } from "./login"

export default resolver.pipe(resolver.zod(Signup), async ({ email, password }, ctx) => {
  const hashedPassword = await SecurePassword.hash(password.trim())
  const user = await db.user.create({
    data: { email: email.toLowerCase().trim(), hashedPassword },
    select: { id: true, name: true, email: true },
  })

  await ctx.session.$create({
    userId: user.id,
    role: UserRole.User,
    name: "example name",
    email: user.email,
    companyId: 2,
    auth0Id: "random value",
    externalUserId: "external id",
    source: "signup page",
  })
  return user
})
