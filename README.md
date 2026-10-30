# Connect the guestbook (free, about 5 minutes)

Wishes are saved in a Google Sheet that you own. You can read them there and delete any message you don't want shown.

1. Go to https://sheets.google.com and create a blank spreadsheet. Name it "Anniversary wishes".
2. In the sheet, click **Extensions → Apps Script**.
3. Delete the sample code, paste in everything from `Code.gs`, and click the save icon.
4. Click **Deploy → New deployment**. Click the gear icon and choose **Web app**.
   - Execute as: **Me**
   - Who has access: **Anyone**
   Click **Deploy**, then **Authorize access** and approve with your Google account
   (if Google warns the app is unverified, click **Advanced → Go to ... (unsafe)**; it is your own script).
5. Copy the **Web app URL** (it starts with https://script.google.com/macros/s/ ...).
6. Open `script.js` and put the URL between the quotes on the first line:
   `var GUESTBOOK_URL = 'https://script.google.com/macros/s/.../exec';`
   Save, and upload `script.js` to GitHub again (replace the old one).
7. Open your site, send a test wish, and check that a row appears in the sheet.

If you change `Code.gs` later, use **Deploy → Manage deployments → Edit → New version** so the URL stays the same.
To remove a message, delete its row in the sheet.
