import { User, UserRole } from "@prisma/client"
import { PublicData, SimpleRolesIsAuthorized } from "@blitzjs/auth"
import { SessionContext } from "@blitzjs/auth"
import { UserRole as EUserRole } from "./auth/mutations/login"

declare module "@blitzjs/auth" {
  export interface Session {
    isAuthorized: SimpleRolesIsAuthorized<UserRole>
    PublicData: {
      name: User["name"]
      email: User["email"]
      userId: User["id"]
      companyId: User["companyId"]
      auth0Id: User["auth0Id"]
      externalUserId: User["auth0Id"]
      role: EUserRole
      source: string
      _redirectUrl?: string
    }
  }
}

export type SessionProps = {
  userId: number
  publicData: SessionContext["$publicData"]
}

export type PassportAuth0Profile = {
  displayName: string
  id: string
  provider: string
  name: { familyName?: string; givenName?: string }
  emails: { value: string }[]
  picture: string
  nickname: string
  _json: Required<
    Pick<IdToken, "nickname" | "name" | "picture" | "updated_at" | "email" | "email_verified">
  > & {
    sub: string
  }
  _raw: string
}

export type VerifyCallbackResult = {
  publicData: PublicData
  privateData?: Record<string, any>
  redirectUrl?: string
}

export interface IdToken {
  __raw: string
  name?: string
  given_name?: string
  family_name?: string
  middle_name?: string
  nickname?: string
  preferred_username?: string
  profile?: string
  picture?: string
  website?: string
  email?: string
  email_verified?: boolean
  gender?: string
  birthdate?: string
  zoneinfo?: string
  locale?: string
  phone_number?: string
  phone_number_verified?: boolean
  address?: string
  updated_at?: string
  iss?: string
  aud?: string
  exp?: number
  nbf?: number
  iat?: number
  jti?: string
  azp?: string
  nonce?: string
  auth_time?: string
  at_hash?: string
  c_hash?: string
  acr?: string
  amr?: string[]
  sub_jwk?: string
  cnf?: string
  sid?: string
  org_id?: string
  org_name?: string
  [key: string]: any
}

export type TokenEndpointResponse = {
  id_token: string
  access_token: string
  refresh_token?: string
  expires_in: number
  scope?: string
}
