#!/bin/bash
sed -i '' 's/is_active: boolean/is_active: boolean\
  type?: string/' /Users/vikneshbalasubramaniam/developer/SANTE/sante-admin-web/types/communication.ts

# In composables/useCommunication.ts
sed -i '' 's/file: File/file: File\
  type?: string/' /Users/vikneshbalasubramaniam/developer/SANTE/sante-admin-web/composables/useCommunication.ts

sed -i '' 's/formData.append('\''end_date'\'', payload.end_date)/formData.append('\''end_date'\'', payload.end_date)\
    if (payload.type) {\
      formData.append('\''type'\'', payload.type)\
    }/' /Users/vikneshbalasubramaniam/developer/SANTE/sante-admin-web/composables/useCommunication.ts

