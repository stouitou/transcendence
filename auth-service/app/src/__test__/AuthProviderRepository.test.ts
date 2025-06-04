import AuthProviderRepository from '../repository/AuthProvider.repository';

global.fetch = jest.fn();

describe('AuthProviderRepository', () => {
  let repo: AuthProviderRepository;

  beforeEach(() => {
    repo = new AuthProviderRepository();
    (fetch as jest.Mock).mockReset();
  });

  it('create: should POST and return created entity', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({ data: { id: 1, provider: 'local', provider_id: 'john@example.com' } })
    });
    const entity = await repo.create({ provider: 'local', provider_id: 'john@example.com' });
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('AuthProvider'), expect.objectContaining({ method: 'POST' }));
    expect(entity).toEqual({ id: 1, provider: 'local', provider_id: 'john@example.com' });
  });

  it('create: should throw if creation fails', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({ json: async () => ({ data: null }) });
    await expect(repo.create({  provider: 'local', provider_id: 'john@example.com' })).rejects.toThrow('entity creation failed');
  });

  it('getAll: should fetch all entities', async () => {
	(fetch as jest.Mock).mockResolvedValueOnce({
		json: async () => ({
		data: [
			{ id: 1, provider: 'local', provider_id: 'john@example.com' },
			{ id: 2, provider: 'local', provider_id: 'jane@example.com' }
		]
		})
	});
	const reporesitory = new AuthProviderRepository();
	const result = await reporesitory.getAll();
	expect(Array.isArray(result)).toBe(true);
	expect(result.length).toBe(2);
  });

  it('getById: should fetch by id', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({ length: 1, 0: { id: 1, provider: 'local', provider_id: 'john@example.com' } })
    });
    const result = await repo.getById(1);
    expect(result).toBeDefined();
  });

  it('getByParams: should fetch with params', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({ data: [{ id: 1 }] })
    });
    const result = await repo.getByParams({ email: 'john@example.com' });
    expect(result).toBeTruthy();
  });

  it('update: should PUT and return updated entity', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({ data: { id: 1, provider_id: 'john@example.com' } })
    });
    const entity = await repo.update({ id: 1, provider_id: 'john@example.com' });
    expect(entity).toEqual({ id: 1, provider_id: 'john@example.com' });
  });

  it('delete: should DELETE and return result', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => true
    });
    const result = await repo.delete(1);
    expect(result).toBe(true);
  });

  it('isValidPassword: should call bcrypt.compare', async () => {
    const bcrypt = require('bcryptjs');
    jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(true);
    const result = await repo.isValidPassword('pw', 'hash');
    expect(result).toBe(true);
  });

  // Ajoute des tests pour set2FASecret et set2FAEmailCode si besoin
});