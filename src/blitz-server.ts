import { setupBlitzServer } from "@blitzjs/next"
import { AuthServerPlugin, PrismaStorage, PublicData, SessionModel } from "@blitzjs/auth"
import { simpleRolesIsAuthorized } from "@blitzjs/auth"
import { BlitzLogger } from "blitz"
import { authConfig } from "./blitz-client"
import { getAuthRedis } from "./redis"

export const { gSSP, gSP, api } = setupBlitzServer({
  plugins: [
    AuthServerPlugin({
      ...authConfig,
      //storage: PrismaStorage(db),
      storage: {
        getSession(handle: string): Promise<SessionModel | null> {
          return new Promise<SessionModel | null>((resolve, reject) => {
            getAuthRedis()
              .get(`token:${handle}`)
              .then((data: string | null) => {
                if (data) {
                  let session = JSON.parse(data) as SessionModel
                  if (session.expiresAt != null) session.expiresAt = new Date(session.expiresAt)
                  resolve(session)
                } else {
                  resolve(null)
                }
              })
              .catch(reject)
          })
        },
        getSessions(userId: PublicData["userId"]): Promise<SessionModel[]> {
          return new Promise<SessionModel[]>((resolve, reject) => {
            getAuthRedis()
              .lrange(`device:${String(userId)}`, 0, -1)
              .then((result) => {
                if (result) {
                  resolve(
                    result.map((handle) => {
                      return this.getSession(handle)
                    })
                  )
                } else {
                  resolve([])
                }
              })
              .catch(reject)
          })
        },
        createSession: (session: SessionModel): Promise<SessionModel> => {
          return new Promise<SessionModel>((resolve, reject) => {
            void getAuthRedis().set(`token:${session.handle}`, JSON.stringify(session), (err) => {
              if (err) {
                reject(err)
              } else {
                void getAuthRedis().lpush(`device:${String(session.userId)}`, session.handle)
                resolve(session)
              }
            })
          })
        },
        updateSession(handle: string, session: Partial<SessionModel>): Promise<SessionModel> {
          return new Promise<SessionModel>((resolve, reject) => {
            void getAuthRedis()
              .get(`token:${handle}`)
              .then((result) => {
                if (result) {
                  let oldSession = JSON.parse(result) as SessionModel
                  if (oldSession.expiresAt != null)
                    oldSession.expiresAt = new Date(oldSession.expiresAt)
                  console.debug(oldSession, session)
                  const mergedSession = Object.assign(oldSession, session)
                  getAuthRedis().set(`token:${handle}`, JSON.stringify(mergedSession)).catch(reject)
                  resolve(mergedSession)
                } else {
                  reject(new Error("cant update session"))
                }
              })
          })
        },
        deleteSession(handle: string): Promise<SessionModel> {
          return new Promise<SessionModel>((resolve, reject) => {
            void getAuthRedis()
              .get(`token:${handle}`)
              .then((result) => {
                if (result) {
                  const session = JSON.parse(result) as SessionModel
                  if (session.expiresAt != null) session.expiresAt = new Date(session.expiresAt)
                  const userId = session.userId as unknown as string
                  getAuthRedis().lrem(userId, 0, handle).catch(reject)
                }
                void getAuthRedis().del(handle, (err) => {
                  if (err) {
                    reject(err)
                  } else {
                    resolve({ handle })
                  }
                })
              })
          })
        },
      },
      isAuthorized: simpleRolesIsAuthorized,
    }),
  ],
  logger: BlitzLogger({}),
})
