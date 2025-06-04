export const fakeUserWith2FA = {
  id: 'user1',
  email: 'user1@example.com',
  authProviders: [
    {
      provider_id: 'provider1',
      two_factor_auth: true,
      two_factor_auth_method: 'email'
    }
  ]
};

export const fakeUserWithout2FA = {
  id: 'user2',
  email: 'user2@example.com',
  authProviders: [
    {
      provider_id: 'provider2',
      two_factor_auth: false
    }
  ]
};

export const fakeUserNoAuthProviders = {
  id: 'user3',
  email: 'user3@example.com',
  authProviders: []
};
