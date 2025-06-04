import UserRepository from '../repository/User.repository';

global.fetch = jest.fn();

describe('UserRepository', () => {
  let repo: UserRepository;

  beforeEach(() => {
    repo = new UserRepository();
    (fetch as jest.Mock).mockReset();
  });

  it('create: should POST and return created user', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({ data: { id: 1, name: 'John'} })
    });
    // getOneByParams est appelé pour vérifier l'unicité du nom
    repo.getOneByParams = jest.fn().mockResolvedValue(null);
    const user = await repo.create({ name: 'John' });
    expect(user).toEqual({ id: 1, name: 'John' });
  });

  it('create: should throw if creation fails', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({ json: async () => ({ data: null }) });
    repo.getOneByParams = jest.fn().mockResolvedValue(null);
    await expect(repo.create({ name: 'John' })).rejects.toThrow('User creation failed');
  });

  it('getAll: should fetch all users', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({
        data: [
          { id: 1, name: 'John' },
          { id: 2, name: 'Jane' }
        ]
      })
    });
    const users = await repo.getAll();
    expect(Array.isArray(users)).toBe(true);
    expect(users.length).toBe(2);
  });

  it('getById: should fetch user by id', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({ data: { id: 1, name: 'John' } })
    });
    const user = await repo.getById(1);
    expect(user).toEqual({ id: 1, name: 'John' });
  });

  it('getByParams: should fetch users by params', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({ data: [{ id: 1, name: 'John' }] })
    });
    const users = await repo.getByParams({ name: 'John' });
    expect(Array.isArray(users)).toBe(true);
    expect(users?.[0].name).toBe('John');
  });

  it('getOneByParams: should fetch one user by params', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({ data: [{ id: 1, name: 'John' }] })
    });
    const user = await repo.getOneByParams({ name: 'John' });
    expect(user).toEqual({ id: 1, name: 'John' });
  });

  it('update: should PUT and return updated user', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({ data: { id: 1, name: 'John Updated' } })
    });
    const user = await repo.update({ id: 1, name: 'John Updated' });
    expect(user).toEqual({ id: 1, name: 'John Updated' });
  });

  it('update: should throw if update fails', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({ json: async () => ({ data: null }) });
    await expect(repo.update({ id: 1, name: 'John' })).rejects.toThrow('User update failed');
  });

  it('delete: should DELETE and return result', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => true
    });
    const result = await repo.delete(1);
    expect(result).toBe(true);
  });
});