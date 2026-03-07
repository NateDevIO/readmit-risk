import { render, screen, fireEvent } from '@testing-library/react';
import ChatTrigger from '@/components/ChatTrigger';

describe('ChatTrigger', () => {
  it('renders children', () => {
    render(<ChatTrigger>Open Chat</ChatTrigger>);
    expect(screen.getByText('Open Chat')).toBeInTheDocument();
  });

  it('applies className prop', () => {
    render(<ChatTrigger className="custom-class">Click</ChatTrigger>);
    expect(screen.getByRole('button')).toHaveClass('custom-class');
  });

  it('dispatches open-chat event on click', () => {
    const handler = jest.fn();
    window.addEventListener('open-chat', handler);

    render(<ChatTrigger>Open</ChatTrigger>);
    fireEvent.click(screen.getByText('Open'));

    expect(handler).toHaveBeenCalledTimes(1);
    window.removeEventListener('open-chat', handler);
  });
});
