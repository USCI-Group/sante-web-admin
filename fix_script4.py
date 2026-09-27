import re

with open("/Users/vikneshbalasubramaniam/developer/SANTE/sante-admin-web/components/custom/communication/CreateAnnouncementDialog.vue", "r") as f:
    content = f.read()

content = content.replace("!form.start_date", "!form.value.start_date")
content = content.replace("!form.end_date", "!form.value.end_date")
content = content.replace("!form.title", "!form.value.title")
content = content.replace("!form.description", "!form.value.description")
content = content.replace("await updateAnnouncementFunction(props.announcement)", "await updateAnnouncementFunction()")

with open("/Users/vikneshbalasubramaniam/developer/SANTE/sante-admin-web/components/custom/communication/CreateAnnouncementDialog.vue", "w") as f:
    f.write(content)
