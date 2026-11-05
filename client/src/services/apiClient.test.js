import '@testing-library/jest-dom/vitest'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiRequest } from './apiClient'

describe('apiRequest', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    localStorage.clear()
  })

  it('sends JSON and bearer headers and returns successful API data', async () => {
    localStorage.setItem('token', 'stored-token')
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ success: true, data: [{ _id: '1' }] }), { status: 200 })))

    await expect(apiRequest('/items', { method: 'POST', body: JSON.stringify({ name: 'Camera' }) })).resolves.toEqual({ success: true, data: [{ _id: '1' }] })
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/items'), expect.objectContaining({
      method: 'POST',
      headers: expect.objectContaining({
        'Content-Type': 'application/json',
        Authorization: 'Bearer stored-token',
      }),
    }))
  })

  it('surfaces API validation and unavailable-server errors', async () => {
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ success: false, message: 'Invalid item' }), { status: 400 }))
      .mockResolvedValueOnce(new Response('', { status: 503 })))

    await expect(apiRequest('/items')).rejects.toThrow('Invalid item')
    await expect(apiRequest('/items')).rejects.toThrow('API server is unavailable')
  })
})
