import re

with open('components/custom/communication/CreateAnnouncementDialog.vue', 'r') as f:
    content = f.read()

# Add to error messages
content = content.replace("end_date: ''", "end_date: '',\n        type: ''")
content = content.replace("end_date: '',", "end_date: '',\n    type: '',")

# Add to create payload
content = content.replace("end_date: props.announcement.end_date || '',", "end_date: props.announcement.end_date || '',\n      type: props.announcement.type || 'slide',")

# Add to update payload
content = content.replace("end_date: announcement.end_date || '',", "end_date: announcement.end_date || '',\n      type: announcement.type || 'slide',")

# Add HTML for the dropdown before Status
html_to_inject = """        <div class="grid gap-2">
          <Label>Display Location <span class="text-red-500">*</span></Label>
          <div class="w-full">
            <select
              v-model="announcement.type"
              class="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black focus:border-black bg-white"
            >
              <option value="slide">Home Screen Slide</option>
              <option value="promotion">Promotions Page Event</option>
            </select>
          </div>
        </div>

        <div class="grid gap-2">
          <Label>Status <span class="text-red-500">*</span></Label>"""

content = content.replace("""        <div class="grid gap-2">
          <Label>Status <span class="text-red-500">*</span></Label>""", html_to_inject)

with open('components/custom/communication/CreateAnnouncementDialog.vue', 'w') as f:
    f.write(content)
