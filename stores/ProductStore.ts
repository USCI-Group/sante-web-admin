import { defineStore } from 'pinia'
import type { Product } from '@/types/menu'

export const useProductStore = defineStore('product', {
    state: () => {
        // Initialize state and immediately load from localStorage
        const initialState = {
            product: null as Product | null,
        }
        
        // Try to load from localStorage when the store is created
        try {
            const savedProduct = localStorage.getItem('currentProduct')
            if (savedProduct) {
                initialState.product = JSON.parse(savedProduct)
            }
        } catch (error) {
            console.error('Failed to load product from localStorage:', error)
        }
        
        return initialState
    },
    actions: {
        setCurrentProduct(product: Product) {
            this.product = product
            localStorage.setItem('currentProduct', JSON.stringify(product))
        },
        clearCurrentProduct() {
            this.product = null
            localStorage.removeItem('currentProduct');
        },
        loadFromLocalStorage() {
            try {
                const product = localStorage.getItem('currentProduct');
                if (product) {
                    this.product = JSON.parse(product);
                } else {
                    console.log('No product found in localStorage')
                }
            } catch (error) {
                console.error('Error loading product from localStorage:', error)
            }
        },
    }
})