<template>
  <div class="px-5 w-full bg-white h-screen overflow-hidden overflow-y-auto pt-6 flex flex-col pb-[350px]">
    <!-- Header -->
    <div class="flex flex-col gap-2 w-full mt-2">
      <h1 class="text-2xl font-bold text-[#011B1F]">Free Item Promo</h1>
      <p class="text-sm text-gray-500">
        Each customer can redeem one free item while the promo is running. It appears on the app's home page.
      </p>
    </div>

    <!-- Create / edit form -->
    <div class="mt-6 max-w-2xl border border-gray-200 rounded-lg p-5">
      <h2 class="font-semibold text-[#011B1F] mb-4">{{ editingId ? 'Edit promo' : 'New promo' }}</h2>

      <div class="flex flex-col gap-4 text-sm">
        <label class="flex flex-col gap-1">
          <span class="text-gray-600">Name shown to customers</span>
          <input v-model="form.name" type="text" placeholder="e.g. Free Sante Clucker" class="h-11 rounded-md border border-gray-200 bg-gray-50 px-3" />
        </label>

        <label class="flex flex-col gap-1">
          <span class="text-gray-600">Free product</span>
          <select v-model="form.product_id" class="h-11 rounded-md border border-gray-200 bg-gray-50 px-3">
            <option value="">Choose a product</option>
            <option v-for="product in products" :key="product.id" :value="product.id">{{ product.name }}</option>
          </select>
        </label>

        <div class="grid grid-cols-2 gap-4">
          <label class="flex flex-col gap-1">
            <span class="text-gray-600">Starts</span>
            <input v-model="form.starts_at" type="datetime-local" class="h-11 rounded-md border border-gray-200 bg-gray-50 px-3" />
          </label>
          <label class="flex flex-col gap-1">
            <span class="text-gray-600">Ends</span>
            <input v-model="form.ends_at" type="datetime-local" class="h-11 rounded-md border border-gray-200 bg-gray-50 px-3" />
          </label>
        </div>

        <label class="flex items-center gap-2">
          <input v-model="form.is_active" type="checkbox" />
          <span>Running (untick to pause it)</span>
        </label>

        <div class="flex gap-3">
          <button
            class="h-11 px-5 rounded-md bg-[#011B1F] text-white font-semibold disabled:opacity-50"
            :disabled="saving"
            @click="savePromo"
          >
            {{ editingId ? 'Save changes' : 'Create promo' }}
          </button>
          <button v-if="editingId" class="h-11 px-5 rounded-md border border-gray-300" @click="resetForm">Cancel</button>
        </div>
      </div>
    </div>

    <!-- Promo list -->
    <div class="mt-8 max-w-5xl">
      <h2 class="font-semibold text-[#011B1F] mb-3">Promos</h2>
      <table class="w-full text-sm border border-gray-100 rounded-lg overflow-hidden">
        <thead class="bg-gray-50 border-b border-gray-100">
          <tr>
            <th class="px-4 py-3 text-left font-semibold text-gray-600">Name</th>
            <th class="px-4 py-3 text-left font-semibold text-gray-600">Product</th>
            <th class="px-4 py-3 text-left font-semibold text-gray-600">Starts</th>
            <th class="px-4 py-3 text-left font-semibold text-gray-600">Ends</th>
            <th class="px-4 py-3 text-left font-semibold text-gray-600">Status</th>
            <th class="px-4 py-3 text-right font-semibold text-gray-600">Redeemed</th>
            <th class="px-4 py-3 text-right font-semibold text-gray-600">Used</th>
            <th class="px-4 py-3 text-right font-semibold text-gray-600">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="promos.length === 0 && !loading">
            <td colspan="8" class="px-4 py-6 text-center text-gray-400">No promos yet.</td>
          </tr>
          <tr v-for="promo in promos" :key="promo.id" class="border-b border-gray-100">
            <td class="px-4 py-3 font-medium">{{ promo.name }}</td>
            <td class="px-4 py-3">{{ promo.product_name }}</td>
            <td class="px-4 py-3">{{ formatDate(promo.starts_at) }}</td>
            <td class="px-4 py-3">{{ formatDate(promo.ends_at) }}</td>
            <td class="px-4 py-3">{{ statusLabel[promo.status] || promo.status }}</td>
            <td class="px-4 py-3 text-right font-semibold">{{ promo.redeemed_count }}</td>
            <td class="px-4 py-3 text-right font-semibold">{{ promo.used_count }}</td>
            <td class="px-4 py-3 text-right">
              <button class="text-[#011B1F] underline" @click="editPromo(promo)">Edit</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useToast } from '@/components/ui/toast/use-toast'

const { toast } = useToast()
const { token } = useAuth()
const config = useRuntimeConfig()
const { me, getMe } = useUsers()
const { getAllProducts } = useMenu()

const promos = ref([])
const products = ref([])
const loading = ref(true)
const saving = ref(false)
const editingId = ref(null)

const statusLabel = { upcoming: 'Upcoming', running: 'Running', paused: 'Paused', ended: 'Ended' }

const emptyForm = () => ({ name: 'Free Sante Clucker', product_id: '', starts_at: '', ends_at: '', is_active: true })
const form = ref(emptyForm())

// Stored times are UTC ISO strings. A datetime-local input needs local time without a zone.
const toLocalInput = (iso) => {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const formatDate = (iso) => new Date(iso).toLocaleString('en-MY', { dateStyle: 'medium', timeStyle: 'short' })

const businessId = () => me.value?.business_id

const loadData = async () => {
  loading.value = true
  try {
    await getMe()
    const id = businessId()
    if (!id) {
      console.error('No business_id found for user')
      return
    }
    const [promoResponse, productResponse] = await Promise.all([
      $fetch(`${config.public.apiUrl}/api/admin/free-item-promos/${id}`, {
        headers: { Authorization: token.value }
      }),
      getAllProducts(id)
    ])
    promos.value = promoResponse.promos || []
    products.value = (productResponse.data || []).map((p) => ({ id: p.id, name: p.name }))
  } catch (error) {
    console.error('Failed to load free item promos', error)
    toast({ title: 'Error', description: 'Could not load promos.', variant: 'destructive' })
  } finally {
    loading.value = false
  }
}

const editPromo = (promo) => {
  editingId.value = promo.id
  form.value = {
    name: promo.name,
    product_id: promo.product_id,
    starts_at: toLocalInput(promo.starts_at),
    ends_at: toLocalInput(promo.ends_at),
    is_active: promo.is_active
  }
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const resetForm = () => {
  editingId.value = null
  form.value = emptyForm()
}

const savePromo = async () => {
  const id = businessId()
  if (!id) return
  if (!form.value.name.trim() || !form.value.product_id || !form.value.starts_at || !form.value.ends_at) {
    toast({ title: 'Missing details', description: 'Fill in the name, the product and both dates.', variant: 'destructive' })
    return
  }

  const details = {
    name: form.value.name.trim(),
    product_id: form.value.product_id,
    starts_at: new Date(form.value.starts_at).toISOString(),
    ends_at: new Date(form.value.ends_at).toISOString(),
    is_active: form.value.is_active
  }

  saving.value = true
  try {
    if (editingId.value) {
      await $fetch(`${config.public.apiUrl}/api/admin/free-item-promos/${id}/${editingId.value}`, {
        method: 'PUT',
        headers: { Authorization: token.value },
        body: details
      })
    } else {
      await $fetch(`${config.public.apiUrl}/api/admin/free-item-promos`, {
        method: 'POST',
        headers: { Authorization: token.value },
        body: { business_id: id, ...details }
      })
    }
    toast({ title: 'Saved', description: 'Free item promo saved.' })
    resetForm()
    await loadData()
  } catch (error) {
    toast({
      title: 'Could not save',
      description: error?.data?.message || error?.message || 'Please check the details and try again.',
      variant: 'destructive'
    })
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>
