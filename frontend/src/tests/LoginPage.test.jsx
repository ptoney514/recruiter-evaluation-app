/**
 * Smoke tests for LoginPage component
 * Verifies component renders and has expected structure
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { LoginPage } from '../pages/LoginPage'

// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// Helper to render with router
const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('LoginPage - Smoke Tests', () => {
  it('should render without crashing', () => {
    renderWithRouter(<LoginPage />)
    expect(screen.getByText('Welcome Back')).toBeInTheDocument()
  })

  it('should have email input field', () => {
    renderWithRouter(<LoginPage />)
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
  })

  it('should have password input field', () => {
    renderWithRouter(<LoginPage />)
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
  })

  it('should have submit button', () => {
    renderWithRouter(<LoginPage />)
    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
  })

  it('should have link to signup page', () => {
    renderWithRouter(<LoginPage />)
    const signupLink = screen.getByRole('link', { name: /sign up/i })
    expect(signupLink).toHaveAttribute('href', '/signup')
  })

  it('should have link back to home', () => {
    renderWithRouter(<LoginPage />)
    const homeLink = screen.getByRole('link', { name: /back to home/i })
    expect(homeLink).toHaveAttribute('href', '/')
  })
})
