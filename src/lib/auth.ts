import {
  signIn as amplifySignIn,
  signOut as amplifySignOut,
  signUp as amplifySignUp,
  confirmSignUp as amplifyConfirmSignUp,
  getCurrentUser,
  fetchUserAttributes,
  resetPassword,
  confirmResetPassword,
  type SignInInput,
  type SignUpInput,
} from "aws-amplify/auth"

export async function login({ email, password }: { email: string; password: string }) {
  return amplifySignIn({ username: email, password } as SignInInput)
}

export async function logout() {
  return amplifySignOut()
}

export async function register({
  email,
  password,
  name,
}: {
  email: string
  password: string
  name: string
}) {
  return amplifySignUp({
    username: email,
    password,
    options: {
      userAttributes: {
        email,
        name,
      },
    },
  } as SignUpInput)
}

export async function confirmEmail({ email, code }: { email: string; code: string }) {
  return amplifyConfirmSignUp({ username: email, confirmationCode: code })
}

export async function getUser() {
  try {
    const user = await getCurrentUser()
    const attrs = await fetchUserAttributes()
    return { ...user, attributes: attrs }
  } catch {
    return null
  }
}

export async function forgotPassword(email: string) {
  return resetPassword({ username: email })
}

export async function confirmForgotPassword({
  email,
  code,
  password,
}: {
  email: string
  code: string
  password: string
}) {
  return confirmResetPassword({ username: email, confirmationCode: code, newPassword: password })
}
