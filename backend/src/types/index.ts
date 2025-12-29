// Common type definitions for the application

export interface User {
  id: string
  email: string
  username: string
  passwordHash: string
  createdAt: Date
  updatedAt: Date
}

export interface Resume {
  id: string
  userId: string
  content: Record<string, unknown>
  version: number
  createdAt: Date
  updatedAt: Date
}

export interface Project {
  id: string
  userId: string
  title: string
  description: string
  polishedDescription?: string
  technologies?: string[]
  createdAt: Date
  updatedAt: Date
}

export interface CoverLetter {
  id: string
  userId: string
  jobTitle: string
  jobDescription: string
  content: string
  resumeId?: string
  createdAt: Date
  updatedAt: Date
}

