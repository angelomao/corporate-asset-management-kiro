import { render, screen } from '@testing-library/react';
import { StatusBadge } from '../StatusBadge';

describe('StatusBadge Component', () => {
  it('should render AVAILABLE status correctly', () => {
    render(<StatusBadge status="AVAILABLE" />);
    
    const badge = screen.getByText('Available');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-green-100', 'text-green-800');
  });

  it('should render ASSIGNED status correctly', () => {
    render(<StatusBadge status="ASSIGNED" />);
    
    const badge = screen.getByText('Assigned');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-blue-100', 'text-blue-800');
  });

  it('should render MAINTENANCE status correctly', () => {
    render(<StatusBadge status="MAINTENANCE" />);
    
    const badge = screen.getByText('Maintenance');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-yellow-100', 'text-yellow-800');
  });

  it('should render RETIRED status correctly', () => {
    render(<StatusBadge status="RETIRED" />);
    
    const badge = screen.getByText('Retired');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-gray-100', 'text-gray-800');
  });

  it('should render LOST status correctly', () => {
    render(<StatusBadge status="LOST" />);
    
    const badge = screen.getByText('Lost');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-red-100', 'text-red-800');
  });

  it('should apply additional className', () => {
    render(<StatusBadge status="AVAILABLE" className="extra-class" />);
    
    const badge = screen.getByText('Available');
    expect(badge).toHaveClass('extra-class');
  });
});