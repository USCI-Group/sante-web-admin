import { defineStore } from 'pinia'
import type { ModifierGroup, ModifierGroupOption } from '@/types/menu'

export const useModifierStore = defineStore('modifier', {
    state: () => {
        // Initialize state and immediately load from localStorage
        const initialState = {
            modifier: null as ModifierGroup | null,
        }
        
        // Try to load from localStorage when the store is created
        try {
            const savedModifier = localStorage.getItem('currentModifierGroup')
            if (savedModifier) {
                initialState.modifier = JSON.parse(savedModifier)
            }
        } catch (error) {
            console.error('Failed to load modifier from localStorage:', error)
        }
        
        return initialState
    },
    actions: {
        setCurrentModifier(modifier: ModifierGroup) {
            this.modifier = modifier
            localStorage.setItem('currentModifierGroup', JSON.stringify(modifier))
        },
        clearCurrentModifier() {
            this.modifier = null
            localStorage.removeItem('currentModifierGroup');
        },
        loadFromLocalStorage() {
            try {
                const modifier = localStorage.getItem('currentModifierGroup');
                if (modifier) {
                    this.modifier = JSON.parse(modifier);
                } else {
                    console.log('No modifier found in localStorage')
                }
            } catch (error) {
                console.error('Error loading modifier from localStorage:', error)
            }
        },
        updateModifierOption(modifierOption: ModifierGroupOption) {
            if (this.modifier) {
                const optionIndex = this.modifier.modifier_options.findIndex(option => option.id === modifierOption.id)
                if (optionIndex !== -1) {
                    this.modifier.modifier_options[optionIndex] = modifierOption
                    this.setCurrentModifier(this.modifier)
                }
            }
        }
    }
})