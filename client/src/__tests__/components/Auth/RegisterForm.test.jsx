import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { vi } from 'vitest';
import RegisterForm from '../../../components/Auth/RegisterForm';
import { BrowserRouter } from 'react-router-dom';

// Mock the constants module
vi.mock('../../../utils/constants', () => ({
  COUNTRIES: ['Kenya', 'Uganda', 'Tanzania'],
  FARMING_TYPES: [
    { value: 'organic', label: 'Organic' },
    { value: 'conventional', label: 'Conventional' },
    { value: 'mixed', label: 'Mixed' }
  ],
  USER_ROLES: [
    { value: 'farmer', label: 'Farmer' },
    { value: 'expert', label: 'Agricultural Expert' },
    { value: 'supplier', label: 'Supplier' },
    { value: 'researcher', label: 'Researcher' },
    { value: 'student', label: 'Student' }
  ],
  VALIDATION: {
    PASSWORD: {
      MIN_LENGTH: 8,
      PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
      MESSAGE: 'Password must be at least 8 characters and include uppercase, lowercase, and numbers'
    },
    EMAIL: {
      PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      MESSAGE: 'Please enter a valid email address'
    },
    FARM_SIZE: {
      MIN: 0.01,
      MAX: 100000,
      MESSAGE: 'Farm size must be greater than 0'
    },
    FARMING_EXPERIENCE: {
      MIN: 0,
      MAX: 100,
      MESSAGE: 'Farming experience must be between 0 and 100 years'
    },
    NAME: {
      MIN_LENGTH: 2,
      MAX_LENGTH: 50,
      MESSAGE: 'Name must be between 2 and 50 characters'
    }
  }
}));

// Create mock store
const mockStore = configureStore([]);

describe('RegisterForm Component', () => {
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
  
  test('renders register form correctly', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <RegisterForm />
        </BrowserRouter>
      </Provider>
    );
    
    // Check if form elements are rendered
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/i am a:/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
  });
  
  test('shows agricultural fields when role is farmer', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <RegisterForm />
        </BrowserRouter>
      </Provider>
    );
    
    // Select farmer role (default)
    const roleSelect = screen.getByLabelText(/i am a:/i);
    fireEvent.change(roleSelect, { target: { value: 'farmer' } });
    
    // Check if farmer-specific fields are rendered
    expect(screen.getByLabelText(/farm size/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/unit/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/years of experience/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/farming type/i)).toBeInTheDocument();
  });
  
  test('hides agricultural fields when role is not farmer', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <RegisterForm />
        </BrowserRouter>
      </Provider>
    );
    
    // Select expert role
    const roleSelect = screen.getByLabelText(/i am a:/i);
    fireEvent.change(roleSelect, { target: { value: 'expert' } });
    
    // Check if farmer-specific fields are not rendered
    expect(screen.queryByLabelText(/farm size/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/farming type/i)).not.toBeInTheDocument();
  });
  
  test('validates password match', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <RegisterForm />
        </BrowserRouter>
      </Provider>
    );
    
    // Fill in passwords that don't match
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: 'password123' }
    });
    
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: 'password456' }
    });
    
    // Check if error message is displayed
    expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    
    // Check if register button is disabled
    const registerButton = screen.getByRole('button', { name: /register/i });
    expect(registerButton).toBeDisabled();
  });
  
  test('handles form submission with valid data', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <RegisterForm />
        </BrowserRouter>
      </Provider>
    );
    
    // Fill in the form
    fireEvent.change(screen.getByLabelText(/first name/i), {
      target: { value: 'John' }
    });
    
    fireEvent.change(screen.getByLabelText(/last name/i), {
      target: { value: 'Farmer' }
    });
    
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'john@example.com' }
    });
    
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: 'password123' }
    });
    
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: 'password123' }
    });
    
    // Submit the form
    fireEvent.submit(screen.getByRole('button', { name: /register/i }));
    
    // Check if dispatch was called
    expect(store.dispatch).toHaveBeenCalled();
  });

  test('renders heading', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <RegisterForm />
        </BrowserRouter>
      </Provider>
    );
    const headingElement = screen.getByText(/Join Agricultural Super App/i);
    expect(headingElement).toBeInTheDocument();
  });
});