import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'

afterEach(cleanup)

describe('authentication flows', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('opens the login form and displays API authentication errors', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ success: false, message: 'Invalid email or password' }), { status: 401 })))
    render(<App />)

    fireEvent.click(screen.getAllByRole('button', { name: 'Get started' })[0])
    fireEvent.change(screen.getByPlaceholderText('Enter your email'), { target: { value: 'wrong@example.com' } })
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), { target: { value: 'wrong-password' } })
    fireEvent.click(screen.getByRole('button', { name: 'Log in' }))

    await waitFor(() => expect(screen.getByText('Server error: Invalid email or password')).toBeInTheDocument())
  })

  it('switches to registration and displays validation errors from the API', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ success: false, message: 'Email already exists' }), { status: 400 })))
    render(<App />)

    fireEvent.click(screen.getAllByRole('button', { name: 'Get started' })[0])
    fireEvent.click(screen.getByRole('button', { name: /Create account/ }))
    fireEvent.change(screen.getByPlaceholderText('Enter your full name'), { target: { value: 'Asha' } })
    fireEvent.change(screen.getByPlaceholderText('Enter your email'), { target: { value: 'asha@example.com' } })
    fireEvent.change(screen.getByPlaceholderText('Create a password'), { target: { value: 'secret1' } })
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }))

    await waitFor(() => expect(screen.getByText('Server error: Email already exists')).toBeInTheDocument())
  })
})
