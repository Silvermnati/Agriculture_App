import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { vi } from 'vitest';
import LoginForm from '../../../components/Auth/LoginForm';
import { BrowserRouter } from 'react-router-dom';

// Create mock store
const mockStore = configureStore([]);

describe('LoginForm Component', () => {
  let store;
  
  beforeEach(() => {
    store = mockStore({
      auth: {
        isLoading: false,
        isError: false,
        isSuccess: false,
        message: ''
      }
    });
    
    // Mock the dispatch function
    store.dispatch = vi.fn();
  });
  
  test('renders login form correctly', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <LoginForm />
        </BrowserRouter>
      </Provider>
    );
    
    // Check if form elements are rendered
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Login$/i })).toBeInTheDocument();
  });
  
  test('handles form submission', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <LoginForm />
        </BrowserRouter>
      </Provider>
    );
    
    // Fill in the form
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' }
    });
    
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' }
    });
    
    // Submit the form
    fireEvent.submit(screen.getByRole('button', { name: /^Login$/i }));
    
    // Check if dispatch was called
    expect(store.dispatch).toHaveBeenCalled();
  });
  
  test('displays error message when isError is true', () => {
    store = mockStore({
      auth: {
        isLoading: false,
        isError: true,
        isSuccess: false,
        message: 'Invalid credentials'
      }
    });
    
    render(
      <Provider store={store}>
        <BrowserRouter>
          <LoginForm />
        </BrowserRouter>
      </Provider>
    );
    
    // Check if error message is displayed
    expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
  });
  
  test('displays success message when isSuccess is true', () => {
    store = mockStore({
      auth: {
        isLoading: false,
        isError: false,
        isSuccess: true,
        message: ''
      }
    });
    
    render(
      <Provider store={store}>
        <BrowserRouter>
          <LoginForm />
        </BrowserRouter>
      </Provider>
    );
    
    // Check if success message is displayed
    expect(screen.getByText('Login successful!')).toBeInTheDocument();
  });
  
  test('disables login button when isLoading is true', () => {
    store = mockStore({
      auth: {
        isLoading: true,
        isError: false,
        isSuccess: false,
        message: ''
      }
    });
    
    render(
      <Provider store={store}>
        <BrowserRouter>
          <LoginForm />
        </BrowserRouter>
      </Provider>
    );
    
    // Check if login button is disabled and shows loading text
    const loginButton = screen.getByRole('button', { name: /logging in.../i });
    expect(loginButton).toBeDisabled();
    expect(loginButton).toHaveTextContent('Logging in...');
  });

  test('renders heading', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <LoginForm />
        </BrowserRouter>
      </Provider>
    );
    const headingElement = screen.getByText(/Login to Agricultural Super App/i);
    expect(headingElement).toBeInTheDocument();
  });
});