import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Select } from '../Select';

describe('Select', () => {
  const mockOptions = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' }
  ];

  it('should render select with label', () => {
    render(
      <Select
        label="Test Select"
        value=""
        onChange={() => {}}
        options={mockOptions}
      />
    );

    expect(screen.getByLabelText('Test Select')).toBeInTheDocument();
    expect(screen.getByText('Test Select')).toBeInTheDocument();
  });

  it('should render select without label', () => {
    render(
      <Select
        value=""
        onChange={() => {}}
        options={mockOptions}
      />
    );

    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.queryByRole('label')).not.toBeInTheDocument();
  });

  it('should render all options', () => {
    render(
      <Select
        label="Test Select"
        value=""
        onChange={() => {}}
        options={mockOptions}
      />
    );

    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
    expect(screen.getByText('Option 3')).toBeInTheDocument();
  });

  it('should display error message', () => {
    render(
      <Select
        label="Test Select"
        value=""
        onChange={() => {}}
        options={mockOptions}
        error="This field is required"
      />
    );

    expect(screen.getByText('This field is required')).toBeInTheDocument();
    expect(screen.getByText('This field is required')).toHaveClass('text-red-600');
  });

  it('should apply error styling when error is present', () => {
    render(
      <Select
        label="Test Select"
        value=""
        onChange={() => {}}
        options={mockOptions}
        error="Error message"
      />
    );

    const select = screen.getByRole('combobox');
    expect(select).toHaveClass('border-red-500');
  });

  it('should apply normal styling when no error', () => {
    render(
      <Select
        label="Test Select"
        value=""
        onChange={() => {}}
        options={mockOptions}
      />
    );

    const select = screen.getByRole('combobox');
    expect(select).toHaveClass('border-gray-300');
    expect(select).not.toHaveClass('border-red-500');
  });

  it('should call onChange when selection changes', () => {
    const handleChange = vi.fn();
    
    render(
      <Select
        label="Test Select"
        value=""
        onChange={handleChange}
        options={mockOptions}
      />
    );

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'option2' } });

    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith(expect.objectContaining({
      target: expect.objectContaining({
        value: 'option2'
      })
    }));
  });

  it('should display current value', () => {
    render(
      <Select
        label="Test Select"
        value="option2"
        onChange={() => {}}
        options={mockOptions}
      />
    );

    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select.value).toBe('option2');
  });

  it('should handle disabled state', () => {
    render(
      <Select
        label="Disabled Select"
        value=""
        onChange={() => {}}
        options={mockOptions}
        disabled
      />
    );

    const select = screen.getByRole('combobox');
    expect(select).toBeDisabled();
  });

  it('should handle required attribute', () => {
    render(
      <Select
        label="Required Select"
        value=""
        onChange={() => {}}
        options={mockOptions}
        required
      />
    );

    const select = screen.getByRole('combobox');
    expect(select).toBeRequired();
  });

  it('should apply custom className', () => {
    render(
      <Select
        label="Custom Select"
        value=""
        onChange={() => {}}
        options={mockOptions}
        className="custom-class"
      />
    );

    const select = screen.getByRole('combobox');
    expect(select).toHaveClass('custom-class');
  });

  it('should render placeholder option when provided', () => {
    render(
      <Select
        label="Test Select"
        value=""
        onChange={() => {}}
        options={mockOptions}
        placeholder="Choose an option"
      />
    );

    expect(screen.getByText('Choose an option')).toBeInTheDocument();
  });

  it('should handle empty options array', () => {
    render(
      <Select
        label="Empty Select"
        value=""
        onChange={() => {}}
        options={[]}
      />
    );

    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
    expect(select.children).toHaveLength(0);
  });

  it('should handle options with same value but different labels', () => {
    const duplicateOptions = [
      { value: 'same', label: 'Label 1' },
      { value: 'same', label: 'Label 2' }
    ];

    render(
      <Select
        label="Duplicate Select"
        value=""
        onChange={() => {}}
        options={duplicateOptions}
      />
    );

    expect(screen.getByText('Label 1')).toBeInTheDocument();
    expect(screen.getByText('Label 2')).toBeInTheDocument();
  });
});