import type { User } from "./user"

export interface ActivityLog {
  id: string
  activity: string
  status: string
  action_by_user_id: string
  action_by: string
  user: User
  details: string
  error_message?: string
  created_at: string
}