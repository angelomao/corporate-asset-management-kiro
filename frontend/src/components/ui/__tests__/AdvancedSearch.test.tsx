import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { AdvancedSearch } from '../AdvancedSearch';

describe('AdvancedSearch', () => {
  const mockProps = {
    searchTerm: '',
    categoryFilter: '',
    statusFilter: '',
    assigneeFilter: '',
    vendorFilter: '',
    locationFilter: '',
    onSearchChange: vi.fn(),
    onCategoryChange: vi.fn(),
    onStatusChange: vi.fn(),
    onAssigneeChange: vi.fn(),
    onVendorChange: vi.fn(),
    onLocationChange: vi.fn(),
    onClearFilters: vi.fn(),
    users: [],
    isExpanded: false,
    onToggleExpanded: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render basic search controls', () => {
    render(<AdvancedSearch {...mockProps} />);

    expect(screen.getByPlaceholderText('Search assets by name, description, serial number...')).toBeInTheDocument();
    expect(screen.getByDisplayValue('All Categories')).toBeInTheDocument();
    expect(screen.getByDisplayValue('All Statuses')).toBeInTheDocument();
    expect(screen.getByText('More Filters')).toBeInTheDocument();
  });

  it('should show expanded filters when isExpanded is true', () => {
    render(<AdvancedSearch {...mockProps} isExpanded={true} />);

    expect(screen.getByText('Assigned To')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Filter by vendor...')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Filter by location...')).toBeInTheDocument();
  });

  it('should call onSearchChange when search input changes', () => {
    render(<AdvancedSearch {...mockProps} />);

    const searchInput = screen.getByPlaceholderText('Search assets by name, description, serial number...');
    fireEvent.change(searchInput, { target: { value: 'laptop' } });

    expect(mockProps.onSearchChange).toHaveBeenCalledWith('laptop');
  });

  it('should show clear button when filters are active', () => {
    render(<AdvancedSearch {...mockProps} searchTerm="laptop" />);

    expect(screen.getByText('Clear')).toBeInTheDocument();
  });

  it('should show active filters summary', () => {
    render(
      <AdvancedSearch 
        {...mockProps} 
        searchTerm="laptop" 
        categoryFilter="HARDWARE"
        statusFilter="AVAILABLE"
      />
    );

    expect(screen.getByText('Active filters:')).toBeInTheDocument();
    expect(screen.getByText('Search: "laptop"')).toBeInTheDocument();
    expect(screen.getByText('Category: Hardware')).toBeInTheDocument();
    expect(screen.getByText('Status: Available')).toBeInTheDocument();
  });
});