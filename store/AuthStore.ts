import { defineStore } from 'pinia'

export const useAuthStore = defineStore('AuthStore', {
  // initial state configuration for the auth store
  state: () => ({
    user: {},
    authToken: null
  }),
  
  // Getter to retrieve the auth tokenfrom the state
  getters: {
    getAuthToken: (state) => state.authToken,
    getUser: (state) => state.user,
    isAuthenticated: (state) => !!state.authToken,
  },

  // Actions to mutate the state
  actions: {
    setUser(user: any) {
      this.user = user
    },
    setAuthToken(authToken: any) {
      this.authToken = authToken
    },

    clearAuth() {
        this.user = {};
        this.authToken = null;
        localStorage.removeItem('token');
    }
  }
})