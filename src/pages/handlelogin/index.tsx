import { BlitzPage } from "@blitzjs/next"
import { useRouter } from "next/router"
import { useEffect } from "react"

const HandleLoginPage: BlitzPage = () => {
  const router = useRouter()

  useEffect(() => {
    window.opener.postMessage({
      type: "user-logged-in",
      message: "User has been logged in",
    })
  }, [router])
  return <></>
}

export default HandleLoginPage
