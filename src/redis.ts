// Full redis example taken from: https://blitzjs.com/docs/auth-config#customize-session-persistence-and-database-access
import Redis from "ioredis"

const dbs: Record<string, Redis | undefined> = {
  default: undefined,
  auth: undefined,
}
export function getRedis(): Redis {
  if (dbs.default) {
    return dbs.default
  }
  return (dbs.default = createRedis(0))
}

export function getAuthRedis(): Redis {
  if (dbs.auth) {
    return dbs.auth
  }
  return (dbs.auth = createRedis(1))
}

export function createRedis(db: number) {
  // @ts-ignore // typescript how thinks keepAlive: 60 is undefined...??
  return new Redis({
    port: 6379,
    host: "localhost",
    keepAlive: 60,
    keyPrefix: "auth:",
    password: "passwordhere",
    db: db,
  })
}
