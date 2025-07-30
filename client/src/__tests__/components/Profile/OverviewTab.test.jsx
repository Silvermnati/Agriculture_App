import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import OverviewTab from '../../../components/Profile/OverviewTab';

// Mock the LoadingSpinner component
vi.mock('../../../components/common/LoadingSpinner/LoadingSpinner', () => ({
  default: ({ text }) => <div data-testid="loading-spinner">{text}</div>
}));

describe('OverviewTab', () => {
  const mockUser = {
    email: 'test@example.com',
    first_name: 'John',
    last_name: 'Doe',
    role: 'farmer',
    created_at: '2023-01-01T00:00:00Z'
  };

  const mockStats = {
    posts_created: 5,
    communities_joined: 3,
    comments_made: 10,
    likes_received: 25,
    profile_views: 100
  };

  const mockRecentActivity = [
    {
      id: '1',
      type: 'post',
      title: 'Created a new post',
      description: 'Test post description',
      timestamp: new Date().toISOString()
    }
  ];

  it('should render user information correctly', () => {
    render(
      <OverviewTab 
        user={mockUser}
        stats={mockStats}
        recentActivity={mockRecentActivity}
        isLoadingStats={false}
        isLoadingActivity={false}
      />
    );

    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('Personal Information')).toBeInTheDocument();
  });

  it('should show loading spinner when stats are loading', () => {
    render(
      <OverviewTab 
        user={mockUser}
        stats={null}
        recentActivity={mockRecentActivity}
        isLoadingStats={true}
        isLoadingActivity={false}
      />
    );

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.getByText('Loading activity statistics...')).toBeInTheDocument();
  });

  it('should show loading spinner when activity is loading', () => {
    render(
      <OverviewTab 
        user={mockUser}
        stats={mockStats}
        recentActivity={[]}
        isLoadingStats={false}
        isLoadingActivity={true}
      />
    );

    expect(screen.getByText('Loading recent activity...')).toBeInTheDocument();
  });

  it('should display activity statistics when loaded', () => {
    render(
      <OverviewTab 
        user={mockUser}
        stats={mockStats}
        recentActivity={mockRecentActivity}
        isLoadingStats={false}
        isLoadingActivity={false}
      />
    );

    expect(screen.getByText('5')).toBeInTheDocument(); // posts_created
    expect(screen.getByText('3')).toBeInTheDocument(); // communities_joined
    expect(screen.getByText('10')).toBeInTheDocument(); // comments_made
    expect(screen.getByText('25')).toBeInTheDocument(); // likes_received
    expect(screen.getByText('100')).toBeInTheDocument(); // profile_views
  });

  it('should show no activity message when no recent activity', () => {
    render(
      <OverviewTab 
        user={mockUser}
        stats={mockStats}
        recentActivity={[]}
        isLoadingStats={false}
        isLoadingActivity={false}
      />
    );

    expect(screen.getByText('No recent activity to display.')).toBeInTheDocument();
  });

  it('should display expert-specific stats for expert users', () => {
    const expertUser = { ...mockUser, role: 'expert' };
    const expertStats = { ...mockStats, consultations_given: 8 };

    render(
      <OverviewTab 
        user={expertUser}
        stats={expertStats}
        recentActivity={mockRecentActivity}
        isLoadingStats={false}
        isLoadingActivity={false}
      />
    );

    expect(screen.getByText('8')).toBeInTheDocument(); // consultations_given
    expect(screen.getByText('Consultations')).toBeInTheDocument();
  });
});