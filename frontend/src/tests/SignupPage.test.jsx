/**
 * Smoke tests for SignupPage component
 * Verifies component renders and has expected structure
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { SignupPage } from '../pages/SignupPage'

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

describe('SignupPage - Smoke Tests', () => {
  it('should render without crashing', () => {
    renderWithRouter(<SignupPage />)
    expect(screen.getByText('Create Account')).toBeInTheDocument()
  })

  it('should have email input field', () => {
    renderWithRouter(<SignupPage />)
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
  })

  it('should have password input field', () => {
    renderWithRouter(<SignupPage />)
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument()
  })

  it('should have confirm password input field', () => {
    renderWithRouter(<SignupPage />)
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
  })

  it('should have terms checkbox', () => {
    renderWithRouter(<SignupPage />)
    expect(screen.getByLabelText(/i agree to the/i)).toBeInTheDocument()
  })

  it('should have submit button', () => {
    renderWithRouter(<SignupPage />)
    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
  })

  it('should have link to login page', () => {
    renderWithRouter(<SignupPage />)
    const loginLink = screen.getByRole('link', { name: /log in/i })
    expect(loginLink).toHaveAttribute('href', '/login')
  })

  it('should have link back to home', () => {
    renderWithRouter(<SignupPage />)
    const homeLink = screen.getByRole('link', { name: /back to home/i })
    expect(homeLink).toHaveAttribute('href', '/')
  })

  it('should have links to terms and privacy', () => {
    renderWithRouter(<SignupPage />)
    const termsLink = screen.getByRole('link', { name: /terms of service/i })
    const privacyLink = screen.getByRole('link', { name: /privacy policy/i })
    expect(termsLink).toHaveAttribute('href', '/terms')
    expect(privacyLink).toHaveAttribute('href', '/privacy')
  })

  it('should show password requirements hint', () => {
    renderWithRouter(<SignupPage />)
    expect(screen.getByText(/minimum 8 characters/i)).toBeInTheDocument()
  })
})
