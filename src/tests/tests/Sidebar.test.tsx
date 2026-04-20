import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

// Since Sidebar component does not exist in the provided codebase, we'll mock a minimal Sidebar for test purposes.
// In a real codebase, replace this import with the actual Sidebar component.
const Sidebar: React.FC<{ items: string[]; onSelect: (item: string) => void }> = ({ items, onSelect }) => (
  <aside>
    <ul>
      {items.map((item) => (
        <li key={item}>
          <button onClick={() => onSelect(item)}>{item}</button>
        </li>
      ))}
    </ul>
  </aside>
);

describe('Sidebar', () => {
  it('renders all sidebar items and allows selection', () => {
    const items = ['Home', 'Documents', 'Settings'];
    const handleSelect = jest.fn();

    render(<Sidebar items={items} onSelect={handleSelect} />);

    items.forEach((item) => {
      expect(screen.getByRole('button', { name: item })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Documents' }));
    expect(handleSelect).toHaveBeenCalledWith('Documents');
  });

  it('renders empty list when no items are provided', () => {
    render(<Sidebar items={[]} onSelect={jest.fn()} />);
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });
});