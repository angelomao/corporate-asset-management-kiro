import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Card } from '../Card';

describe('Card', () => {
  it('should render children correctly', () => {
    render(
      <Card>
        <h2>Test Title</h2>
        <p>Test content</p>
      </Card>
    );

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('should apply default classes', () => {
    const { container } = render(
      <Card>
        <p>Content</p>
      </Card>
    );

    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('bg-white', 'rounded-lg', 'shadow-md', 'p-6');
  });

  it('should apply custom className', () => {
    const { container } = render(
      <Card className="custom-class">
        <p>Content</p>
      </Card>
    );

    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('custom-class');
    expect(card).toHaveClass('bg-white', 'rounded-lg', 'shadow-md', 'p-6');
  });

  it('should apply custom title', () => {
    render(
      <Card title="Custom Title">
        <p>Content</p>
      </Card>
    );

    expect(screen.getByText('Custom Title')).toBeInTheDocument();
    expect(screen.getByText('Custom Title')).toHaveClass('text-lg', 'font-semibold', 'mb-4');
  });

  it('should render without title when not provided', () => {
    render(
      <Card>
        <p>Content</p>
      </Card>
    );

    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });

  it('should handle empty children', () => {
    const { container } = render(<Card>Test content</Card>);
    
    const card = container.firstChild as HTMLElement;
    expect(card).toBeInTheDocument();
    expect(card).toBeEmptyDOMElement();
  });
});