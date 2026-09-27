sed -i '' -e 's/title: string,/type?: string,\n        title: string,/' \
-e "s/formData.append('is_active', body.is_active.toString())/formData.append('is_active', body.is_active.toString())\n            if (body.type) formData.append('type', body.type)/" \
/Users/vikneshbalasubramaniam/developer/SANTE/sante-admin-web/composables/useCommunication.ts
