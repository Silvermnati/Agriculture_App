import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { vi } from 'vitest';
import LoginForm from '../../../components/Auth/LoginForm';

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
        <LoginForm />
      </Provider>
    );
    
    // Check if form elements are rendered
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });
  
  test('handles form submission', () => {
    render(
      <Provider store={store}>
        <LoginForm />
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
    fireEvent.submit(screen.getByRole('button', { name: /login/i }));
    
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
        <LoginForm />
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
        <LoginForm />
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
        <LoginForm />
      </Provider>
    );
    
    // Check if login button is disabled and shows loading text
    const loginButton = screen.getByRole('button');
    expect(loginButton).toBeDisabled();
    expect(loginButton).toHaveTextContent('Logging in...');
  });
});