import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import AddItemModal from './AddItemModal'

afterEach(cleanup)

describe('AddItemModal', () => {
  it('validates required fields before saving', () => {
    const onSave = vi.fn()
    render(<AddItemModal onClose={vi.fn()} onSave={onSave} />)

    fireEvent.click(screen.getByRole('button', { name: 'Add Item' }))
    expect(screen.getByRole('alert')).toHaveTextContent('item name')
    expect(onSave).not.toHaveBeenCalled()
  })

  it('submits trimmed item data and supports editing', () => {
    const onSave = vi.fn()
    render(<AddItemModal item={{ name: 'Old', category: 'Books', description: 'Old description' }} onClose={vi.fn()} onSave={onSave} />)

    fireEvent.change(screen.getByRole('textbox', { name: 'Item Name' }), { target: { value: '  Camera  ' } })
    fireEvent.change(screen.getByRole('combobox', { name: 'Category' }), { target: { value: 'Electronics' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }))
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ name: 'Camera', category: 'Electronics' }))
  })
})
