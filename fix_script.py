import re

with open("/Users/vikneshbalasubramaniam/developer/SANTE/sante-admin-web/components/custom/communication/CreateAnnouncementDialog.vue", "r") as f:
    content = f.read()

form_decl = """
const form = ref<any>({
  id: '',
  title: '',
  description: '',
  start_date: '',
  end_date: '',
  type: 'slide',
  is_active: true,
  image_url: '',
})
"""

content = content.replace("const imageFiles = ref<File[]>([])", form_decl + "\nconst imageFiles = ref<File[]>([])")

watch_reset = """      errorMessages.value = {
        title: '',
        description: '',
        image: '',
        start_date: '',
        end_date: '',
        type: ''
      }
      if (props.mode === 'edit' && props.announcement) {
        form.value = { ...props.announcement }
      } else {
        form.value = {
          id: '',
          title: '',
          description: '',
          start_date: '',
          end_date: '',
          type: 'slide',
          is_active: true,
          image_url: '',
        }
      }"""

content = re.sub(r'errorMessages\.value = \{\n\s*title: \'\',\n\s*description: \'\',\n\s*image: \'\',\n\s*start_date: \'\',\n\s*end_date: \'\',\n\s*type: \'\',\n\s*type: \'\'\n\s*\}', watch_reset, content)

content = content.replace('await updateAnnouncementFunction(form.announcement)', 'await updateAnnouncementFunction(form.value)')
content = content.replace('function updateAnnouncementFunction(announcement: Announcement)', 'function updateAnnouncementFunction(announcement: any)')

with open("/Users/vikneshbalasubramaniam/developer/SANTE/sante-admin-web/components/custom/communication/CreateAnnouncementDialog.vue", "w") as f:
    f.write(content)
