import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Input } from '../Input';

describe('Input', () => {
  it('should render input with label', () => {
    render(
      <Input
        label="Test Label"
        value=""
        onChange={() => {}}
      />
    );

    expect(screen.getByLabelText('Test Label')).toBeInTheDocument();
    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  it('should render input without label', () => {
    render(
      <Input
        value=""
        onChange={() => {}}
        placeholder="Enter text"
      />
    );

    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
    expect(screen.queryByRole('label')).not.toBeInTheDocument();
  });

  it('should display error message', () => {
    render(
      <Input
        label="Test Input"
        value=""
        onChange={() => {}}
        error="This field is required"
      />
    );

    expect(screen.getByText('This field is required')).toBeInTheDocument();
    expect(screen.getByText('This field is required')).toHaveClass('text-red-600');
  });

  it('should apply error styling when error is present', () => {
    render(
      <Input
        label="Test Input"
        value=""
        onChange={() => {}}
        error="Error message"
      />
    );

    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('border-red-500');
  });

  it('should apply normal styling when no error', () => {
    render(
      <Input
        label="Test Input"
        value=""
        onChange={() => {}}
      />
    );

    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('border-gray-300');
    expect(input).not.toHaveClass('border-red-500');
  });

  it('should call onChange when input value changes', () => {
    const handleChange = vi.fn();
    
    render(
      <Input
        label="Test Input"
        value=""
        onChange={handleChange}
      />
    );

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'new value' } });

    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith(expect.objectContaining({
      target: expect.objectContaining({
        value: 'new value'
      })
    }));
  });

  it('should display current value', () => {
    render(
      <Input
        label="Test Input"
        value="current value"
        onChange={() => {}}
      />
    );

    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.value).toBe('current value');
  });

  it('should handle different input types', () => {
    render(
      <Input
        label="Email Input"
        type="email"
        value=""
        onChange={() => {}}
      />
    );

    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('type', 'email');
  });

  it('should handle disabled state', () => {
    render(
      <Input
        label="Disabled Input"
        value=""
        onChange={() => {}}
        disabled
      />
    );

    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
  });

  it('should handle required attribute', () => {
    render(
      <Input
        label="Required Input"
        value=""
        onChange={() => {}}
        required
      />
    );

    const input = screen.getByRole('textbox');
    expect(input).toBeRequired();
  });

  it('should apply custom className', () => {
    render(
      <Input
        label="Custom Input"
        value=""
        onChange={() => {}}
        className="custom-class"
      />
    );

    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('custom-class');
  });

  it('should handle placeholder text', () => {
    render(
      <Input
        label="Test Input"
        value=""
        onChange={() => {}}
        placeholder="Enter your text here"
      />
    );

    expect(screen.getByPlaceholderText('Enter your text here')).toBeInTheDocument();
  });
});