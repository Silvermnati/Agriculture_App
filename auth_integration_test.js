/**
 * Authentication Integration Test Script
 * 
 * This script provides functions to test the authentication API integration.
 * You can run these functions in your browser's console to test the API.
 */

// Base URL for API requests
const API_URL = 'https://agriculture-app-1-u2a6.onrender.com/api';

// Test login function
async function testLogin(email, password) {
  console.log(`Testing login with email: ${email}`);
  
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Login successful!');
      console.log('Token:', data.token);
      console.log('User:', data.user);
      return data;
    } else {
      console.error('❌ Login failed:', data.message);
      return null;
    }
  } catch (error) {
    console.error('❌ Error during login:', error);
    return null;
  }
}

// Test registration function
async function testRegister(userData) {
  console.log(`Testing registration with email: ${userData.email}`);
  
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Registration successful!');
      console.log('Token:', data.token);
      console.log('User:', data.user);
      return data;
    } else {
      console.error('❌ Registration failed:', data.message);
      return null;
    }
  } catch (error) {
    console.error('❌ Error during registration:', error);
    return null;
  }
}

// Test get profile function
async function testGetProfile(token) {
  console.log('Testing get profile');
  
  try {
    const response = await fetch(`${API_URL}/auth/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Get profile successful!');
      console.log('User profile:', data);
      return data;
    } else {
      console.error('❌ Get profile failed:', data.message);
      return null;
    }
  } catch (error) {
    console.error('❌ Error during get profile:', error);
    return null;
  }
}

// Test update profile function
async function testUpdateProfile(token, profileData) {
  console.log('Testing update profile');
  
  try {
    const response = await fetch(`${API_URL}/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(profileData),
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Update profile successful!');
      console.log('Response:', data);
      return data;
    } else {
      console.error('❌ Update profile failed:', data.message);
      return null;
    }
  } catch (error) {
    console.error('❌ Error during update profile:', error);
    return null;
  }
}

// Run all tests
async function runAllTests() {
  console.log('=== Running Authentication Integration Tests ===');
  
  // Test login with existing user
  const loginResult = await testLogin('farmer@example.com', 'securepassword');
  
  if (loginResult && loginResult.token) {
    // Test get profile
    await testGetProfile(loginResult.token);
    
    // Test update profile
    await testUpdateProfile(loginResult.token, {
      bio: 'Updated bio for testing',
    });
  }
  
  // Test registration with new user
  const randomEmail = `testuser${Date.now()}@example.com`;
  await testRegister({
    email: randomEmail,
    password: 'SecurePassword123',
    first_name: 'Test',
    last_name: 'User',
    role: 'farmer',
    farm_size: 25.5,
    farm_size_unit: 'hectares',
    farming_experience: 5,
    farming_type: 'organic',
  });
  
  console.log('=== Authentication Integration Tests Complete ===');
}

// Instructions for running tests
console.log(`
=== Authentication Integration Test Script ===

This script provides functions to test the authentication API integration.
You can run these functions in your browser's console to test the API.

Available functions:
- testLogin(email, password): Test login functionality
- testRegister(userData): Test registration functionality
- testGetProfile(token): Test get profile functionality
- testUpdateProfile(token, profileData): Test update profile functionality
- runAllTests(): Run all tests in sequence

Example usage:
1. Test login:
   testLogin('farmer@example.com', 'securepassword')

2. Test registration:
   testRegister({
     email: 'newuser@example.com',
     password: 'SecurePassword123',
     first_name: 'New',
     last_name: 'User',
     role: 'farmer'
   })

3. Run all tests:
   runAllTests()
`);