import re

with open("/Users/vikneshbalasubramaniam/developer/SANTE/sante-admin-web/components/custom/communication/CreateAnnouncementDialog.vue", "r") as f:
    content = f.read()

content = content.replace("async function updateAnnouncementFunction(announcement: any) {", "async function updateAnnouncementFunction() {")
content = content.replace("announcement_id: announcement.id,", "announcement_id: form.value.id,")
content = content.replace("is_active: form.is_active,", "is_active: form.value.is_active,")
content = content.replace("start_date: announcement.start_date || '',", "start_date: form.value.start_date || '',")
content = content.replace("end_date: announcement.end_date || '',", "end_date: form.value.end_date || '',")
content = content.replace("type: announcement.type || 'slide',", "type: form.value.type || 'slide',")
content = content.replace("title: announcement.title,", "title: form.value.title,")
content = content.replace("description: announcement.description,", "description: form.value.description,")
content = content.replace("await updateAnnouncementFunction(form.value)", "await updateAnnouncementFunction()")

with open("/Users/vikneshbalasubramaniam/developer/SANTE/sante-admin-web/components/custom/communication/CreateAnnouncementDialog.vue", "w") as f:
    f.write(content)
