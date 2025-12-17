export type UserRole = "user" | "admin" | "tester"

export type User = {
  id: string
  name: string
  role: UserRole
}

export function getUser(): User {
  // Mock user - in production this would come from your auth system
  if (typeof window === 'undefined') {
    return { id: "1", name: "Guest", role: "user" }
  }
  
  const stored = localStorage.getItem('currentUser')
  if (stored) {
    return JSON.parse(stored)
  }
  
  return { id: "1", name: "Demo User", role: "user" }
}

export function setUser(user: User) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('currentUser', JSON.stringify(user))
  }
}
