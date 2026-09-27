import re

with open("/Users/vikneshbalasubramaniam/developer/SANTE/sante-admin-web/components/custom/communication/CreateAnnouncementDialog.vue", "r") as f:
    content = f.read()

content = content.replace("is_active: props.form.is_active,", "is_active: form.value.is_active,")
content = content.replace("start_date: form.start_date || '',", "start_date: form.value.start_date || '',")
content = content.replace("end_date: form.end_date || '',", "end_date: form.value.end_date || '',")
content = content.replace("type: form.type || 'slide',", "type: form.value.type || 'slide',")
content = content.replace("title: form.title,", "title: form.value.title,")
content = content.replace("description: form.description,", "description: form.value.description,")

with open("/Users/vikneshbalasubramaniam/developer/SANTE/sante-admin-web/components/custom/communication/CreateAnnouncementDialog.vue", "w") as f:
    f.write(content)
