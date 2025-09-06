# chrome_extension

## Key Files

### background.js
<p>Service worker for chrome extension.</p>

### content_dashboard_a.js
<p>Content script for User A dashboard.</p>

### side_panel.js
<p>Script to manage chrome extension side panel.</p>

### content_email.js
<p>Content script for email webpage.</p>

### side_panel.html
<p>HTML for browser extension side panel.</p>

### info_popup.html
<p>HTML for information popup injected into email webpage.</p>

### menu_popup.html
<p>HTML for option menu popup injected into email webpage.</p>



## Members

<dl>
<dt><a href="#EXTENSION_LOADED">EXTENSION_LOADED</a> : <code>Boolean</code></dt>
<dd><p>Boolean to track if system is activated.</p>
</dd>
<dt><a href="#LINK">LINK</a> : <code>String</code></dt>
<dd><p>Variable to store link HTML element.</p>
</dd>
<dt><a href="#CURRENT_PARENT">CURRENT_PARENT</a> : <code>String</code></dt>
<dd><p>Variable to store HTML element that opens current email.</p>
</dd>
<dt><a href="#PENDING_ACTIONS">PENDING_ACTIONS</a> : <code>Array</code></dt>
<dd><p>Array to store unresolved actions.</p>
</dd>
<dt><a href="#CLICKED_BEFORE">CLICKED_BEFORE</a> : <code>Array</code></dt>
<dd><p>Array to store previously visited CURRENT_PARENT elements.</p>
</dd>
<dt><a href="#TRUSTED_CONTACTS">TRUSTED_CONTACTS</a> : <code>Array</code></dt>
<dd><p>Array to store trusted contacts.</p>
</dd>
<dt><a href="#PARENT_LINKS">PARENT_LINKS</a> : <code>Map</code></dt>
<dd><p>Map to store HTML elements and corresponding links.</p>
</dd>
<dt><a href="#CHOICES">CHOICES</a> : <code>Map</code></dt>
<dd><p>Map to store current pending links and corresponding choices.</p>
</dd>
<dt><a href="#MODIFIED_HTML">MODIFIED_HTML</a> : <code>Map</code></dt>
<dd><p>Map to store modified HTML for a CURRENT_PARENT element.</p>
</dd>
<dt><a href="#ORIGINAL_HTML">ORIGINAL_HTML</a> : <code>Map</code></dt>
<dd><p>Map to store original HTML for a CURRENT_PARENT element.</p>
</dd>
<dt><a href="#ORIGINAL_LINKS">ORIGINAL_LINKS</a> : <code>Map</code></dt>
<dd><p>Map to store original links for pending actions.</p>
</dd>
</dl>

## Constants

<dl>
<dt><del><a href="#A_FRONTEND">A_FRONTEND</a> : <code>Number</code></del></dt>
<dd><p>Port on which User A dashboard frontend runs.</p>
</dd>
<dt><del><a href="#EXTENSION_ID">EXTENSION_ID</a> : <code>String</code></del></dt>
<dd><p>Chrome extension ID.</p>
</dd>
<dt><del><a href="#A_FRONTEND">A_FRONTEND</a> : <code>Number</code></del></dt>
<dd><p>Port on which User A dashboard frontend runs.</p>
</dd>
<dt><del><a href="#EMAIL_PORT">EMAIL_PORT</a> : <code>Number</code></del></dt>
<dd><p>Port on which email environment runs.</p>
</dd>
<dt><del><a href="#A_FRONTEND">A_FRONTEND</a> : <code>Number</code></del></dt>
<dd><p>Port on which User A dashboard frontend runs.</p>
</dd>
<dt><del><a href="#EMAIL_PORT">EMAIL_PORT</a> : <code>Number</code></del></dt>
<dd><p>Port on which email webpage frontend runs.</p>
</dd>
<dt><a href="#CHOICE_SPEECH">CHOICE_SPEECH</a> : <code>Map</code></dt>
<dd><p>Mapping between chosen option and side panel speech content.</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#getActiveTabUrl">getActiveTabUrl()</a></dt>
<dd><p>Get URL of the active tab and send to dashboard.</p>
</dd>
<dt><a href="#openDashboard">openDashboard()</a></dt>
<dd><p>Switch to or create dashboard tab.</p>
</dd>
<dt><a href="#setNums">setNums(pending, updates)</a></dt>
<dd><p>Set the number of pending requests and updates.</p>
</dd>
<dt><a href="#stripTags">stripTags(email)</a></dt>
<dd><p>Strip tags for email preview.</p>
</dd>
<dt><a href="#stripSender">stripSender(from)</a></dt>
<dd><p>Strip tags from email sender.</p>
</dd>
<dt><a href="#processOutcome">processOutcome(url, outcome)</a></dt>
<dd><p>Process User B response.</p>
</dd>
<dt><a href="#completeAction">completeAction(elem, choice)</a></dt>
<dd><p>Process User A choice.</p>
</dd>
<dt><a href="#injectInfoHtml">injectInfoHtml(link)</a></dt>
<dd><p>Fetch and inject HTML for information popup.</p>
</dd>
<dt><a href="#injectMenuHtml">injectMenuHtml(link)</a></dt>
<dd><p>Fetch and inject HTML for menu popup.</p>
</dd>
<dt><a href="#attachInfoListeners">attachInfoListeners(informationPopup, link)</a></dt>
<dd><p>Attach event listeners to the information popup buttons.</p>
</dd>
<dt><a href="#attachMenuListeners">attachMenuListeners(informationPopup, link)</a></dt>
<dd><p>Attach event listeners to the menu popup buttons.</p>
</dd>
<dt><a href="#emailID">emailID()</a> ⇒ <code>String</code></dt>
<dd><p>Get unique ID for email actions.</p>
</dd>
<dt><a href="#processChoice">processChoice(choice, link)</a></dt>
<dd><p>Process User A choice and send to background script.</p>
</dd>
<dt><a href="#getStorageData">getStorageData(keys)</a> ⇒ <code>Promise.&lt;result&gt;</code></dt>
<dd><p>Get data from local chrome storage.</p>
</dd>
<dt><a href="#getEmailSettings">getEmailSettings()</a> ⇒ <code>Array</code></dt>
<dd><p>Get email settings.</p>
</dd>
<dt><a href="#getTrustedContacts">getTrustedContacts()</a> ⇒ <code>Array</code></dt>
<dd><p>Get trusted contacts.</p>
</dd>
<dt><a href="#loadAll">loadAll()</a></dt>
<dd><p>Inject HTML and add listeners for system intervention on email webpage.</p>
</dd>
<dt><a href="#setUpdate">setUpdate(btn)</a></dt>
<dd><p>Set an update for a side panel button.</p>
</dd>
<dt><a href="#removeUpdate">removeUpdate(btn)</a></dt>
<dd><p>Reset updates to zero for a side panel button.</p>
</dd>
<dt><a href="#getStorageData">getStorageData(keys)</a> ⇒ <code>Promise.&lt;result&gt;</code></dt>
<dd><p>Get data from local chrome storage.</p>
</dd>
<dt><a href="#getNumPending">getNumPending()</a> ⇒ <code>Number</code></dt>
<dd><p>Get number of pending requests.</p>
</dd>
<dt><a href="#getEmailSettings">getEmailSettings()</a> ⇒ <code>Array</code></dt>
<dd><p>Get email settings.</p>
</dd>
<dt><a href="#getTrustedContacts">getTrustedContacts()</a> ⇒ <code>Array</code></dt>
<dd><p>Get trusted contacts.</p>
</dd>
<dt><a href="#getNumUpdates">getNumUpdates()</a> ⇒ <code>Number</code></dt>
<dd><p>Get number of updates.</p>
</dd>
<dt><a href="#setNums">setNums(newPending, newUpdate)</a></dt>
<dd><p>Set the number of pending requests and updates.</p>
</dd>
<dt><a href="#updateNumPending">updateNumPending(newPending)</a></dt>
<dd><p>Update the number of pending requests and modify number of updates.</p>
</dd>
<dt><a href="#addUpdate">addUpdate()</a></dt>
<dd><p>Add an update.</p>
</dd>
</dl>

<a name="EXTENSION_LOADED"></a>

## EXTENSION\_LOADED : <code>Boolean</code>
Boolean to track if system is activated.

**Kind**: global variable  
<a name="LINK"></a>

## LINK : <code>String</code>
Variable to store link HTML element.

**Kind**: global variable  
<a name="CURRENT_PARENT"></a>

## CURRENT\_PARENT : <code>String</code>
Variable to store HTML element that opens current email.

**Kind**: global variable  
<a name="PENDING_ACTIONS"></a>

## PENDING\_ACTIONS : <code>Array</code>
Array to store unresolved actions.

**Kind**: global variable  
<a name="CLICKED_BEFORE"></a>

## CLICKED\_BEFORE : <code>Array</code>
Array to store previously visited CURRENT_PARENT elements.

**Kind**: global variable  
<a name="TRUSTED_CONTACTS"></a>

## TRUSTED\_CONTACTS : <code>Array</code>
Array to store trusted contacts.

**Kind**: global variable  
<a name="PARENT_LINKS"></a>

## PARENT\_LINKS : <code>Map</code>
Map to store HTML elements and corresponding links.

**Kind**: global variable  
<a name="CHOICES"></a>

## CHOICES : <code>Map</code>
Map to store current pending links and corresponding choices.

**Kind**: global variable  
<a name="MODIFIED_HTML"></a>

## MODIFIED\_HTML : <code>Map</code>
Map to store modified HTML for a CURRENT_PARENT element.

**Kind**: global variable  
<a name="ORIGINAL_HTML"></a>

## ORIGINAL\_HTML : <code>Map</code>
Map to store original HTML for a CURRENT_PARENT element.

**Kind**: global variable  
<a name="ORIGINAL_LINKS"></a>

## ORIGINAL\_LINKS : <code>Map</code>
Map to store original links for pending actions.

**Kind**: global variable  
<a name="A_FRONTEND"></a>

## ~~A\_FRONTEND : <code>Number</code>~~
***since version 1.0. May be updated.***

Port on which User A dashboard frontend runs.

**Kind**: global constant  
<a name="EXTENSION_ID"></a>

## ~~EXTENSION\_ID : <code>String</code>~~
***since version 1.0. Must be updated.***

Chrome extension ID.

**Kind**: global constant  
<a name="A_FRONTEND"></a>

## ~~A\_FRONTEND : <code>Number</code>~~
***since version 1.0. May be updated.***

Port on which User A dashboard frontend runs.

**Kind**: global constant  
<a name="EMAIL_PORT"></a>

## ~~EMAIL\_PORT : <code>Number</code>~~
***since version 1.0. May be updated.***

Port on which email environment runs.

**Kind**: global constant  
<a name="A_FRONTEND"></a>

## ~~A\_FRONTEND : <code>Number</code>~~
***since version 1.0. May be updated.***

Port on which User A dashboard frontend runs.

**Kind**: global constant  
<a name="EMAIL_PORT"></a>

## ~~EMAIL\_PORT : <code>Number</code>~~
***since version 1.0. May be updated.***

Port on which email webpage frontend runs.

**Kind**: global constant  
<a name="CHOICE_SPEECH"></a>

## CHOICE\_SPEECH : <code>Map</code>
Mapping between chosen option and side panel speech content.

**Kind**: global constant  
<a name="getActiveTabUrl"></a>

## getActiveTabUrl()
Get URL of the active tab and send to dashboard.

**Kind**: global function  
<a name="openDashboard"></a>

## openDashboard()
Switch to or create dashboard tab.

**Kind**: global function  
<a name="setNums"></a>

## setNums(pending, updates)
Set the number of pending requests and updates.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| pending | <code>Number</code> | The number of unresolved actions. |
| updates | <code>Number</code> | The number of updates for User A. |

<a name="stripTags"></a>

## stripTags(email)
Strip tags for email preview.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| email | <code>String</code> | The HTML of the email content. |

<a name="stripSender"></a>

## stripSender(from)
Strip tags from email sender.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| from | <code>String</code> | The HTML of the email sender. |

<a name="processOutcome"></a>

## processOutcome(url, outcome)
Process User B response.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| url | <code>String</code> | The URL corresponding to the action. |
| outcome | <code>String</code> | The response from User B. |

<a name="completeAction"></a>

## completeAction(elem, choice)
Process User A choice.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| elem | <code>String</code> | The parent element corresponding to the email. |
| choice | <code>String</code> | Choice made by User A. |

<a name="injectInfoHtml"></a>

## injectInfoHtml(link)
Fetch and inject HTML for information popup.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| link | <code>String</code> | The HTML corresponding to the current email. |

<a name="injectMenuHtml"></a>

## injectMenuHtml(link)
Fetch and inject HTML for menu popup.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| link | <code>String</code> | The HTML corresponding to the current email. |

<a name="attachInfoListeners"></a>

## attachInfoListeners(informationPopup, link)
Attach event listeners to the information popup buttons.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| informationPopup | <code>String</code> | The HTML element corresponding to the information popup. |
| link | <code>String</code> | The HTML corresponding to the current email. |

<a name="attachMenuListeners"></a>

## attachMenuListeners(informationPopup, link)
Attach event listeners to the menu popup buttons.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| informationPopup | <code>String</code> | The HTML element corresponding to the menu popup. |
| link | <code>String</code> | The HTML corresponding to the current email. |

<a name="emailID"></a>

## emailID() ⇒ <code>String</code>
Get unique ID for email actions.

**Kind**: global function  
**Returns**: <code>String</code> - A unique identifier for the action.  
<a name="processChoice"></a>

## processChoice(choice, link)
Process User A choice and send to background script.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| choice | <code>String</code> | Choice made by User A. |
| link | <code>String</code> | link The HTML corresponding to the current email. |

<a name="getStorageData"></a>

## getStorageData(keys) ⇒ <code>Promise.&lt;result&gt;</code>
Get data from local chrome storage.

**Kind**: global function  
**Returns**: <code>Promise.&lt;result&gt;</code> - A promise that resolves with successful collection.  

| Param | Type | Description |
| --- | --- | --- |
| keys | <code>String</code> | Key to identify targeted data. |

<a name="getEmailSettings"></a>

## getEmailSettings() ⇒ <code>Array</code>
Get email settings.

**Kind**: global function  
**Returns**: <code>Array</code> - The allowed and blocked email settings.  
**Throws**:

- <code>Error</code> If the email settings cannot be retrieved.

<a name="getTrustedContacts"></a>

## getTrustedContacts() ⇒ <code>Array</code>
Get trusted contacts.

**Kind**: global function  
**Returns**: <code>Array</code> - The trusted email addresses.  
**Throws**:

- <code>Error</code> If the trusted contacts cannot be retrieved.

<a name="loadAll"></a>

## loadAll()
Inject HTML and add listeners for system intervention on email webpage.

**Kind**: global function  
<a name="setUpdate"></a>

## setUpdate(btn)
Set an update for a side panel button.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| btn | <code>String</code> | ID for button element. |

<a name="removeUpdate"></a>

## removeUpdate(btn)
Reset updates to zero for a side panel button.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| btn | <code>String</code> | ID for button element. |

<a name="getStorageData"></a>

## getStorageData(keys) ⇒ <code>Promise.&lt;result&gt;</code>
Get data from local chrome storage.

**Kind**: global function  
**Returns**: <code>Promise.&lt;result&gt;</code> - A promise that resolves with successful collection.  

| Param | Type | Description |
| --- | --- | --- |
| keys | <code>String</code> | Key to identify targeted data. |

<a name="getNumPending"></a>

## getNumPending() ⇒ <code>Number</code>
Get number of pending requests.

**Kind**: global function  
**Returns**: <code>Number</code> - The number of pending requests.  
**Throws**:

- <code>Error</code> If the number of pending requests cannot be retrieved.

<a name="getEmailSettings"></a>

## getEmailSettings() ⇒ <code>Array</code>
Get email settings.

**Kind**: global function  
**Returns**: <code>Array</code> - The allowed and blocked email settings.  
**Throws**:

- <code>Error</code> If the email settings cannot be retrieved.

<a name="getTrustedContacts"></a>

## getTrustedContacts() ⇒ <code>Array</code>
Get trusted contacts.

**Kind**: global function  
**Returns**: <code>Array</code> - The trusted email addresses.  
**Throws**:

- <code>Error</code> If the trusted contacts cannot be retrieved.

<a name="getNumUpdates"></a>

## getNumUpdates() ⇒ <code>Number</code>
Get number of updates.

**Kind**: global function  
**Returns**: <code>Number</code> - The number of updates.  
**Throws**:

- <code>Error</code> If the number of updates cannot be retrieved.

<a name="setNums"></a>

## setNums(newPending, newUpdate)
Set the number of pending requests and updates.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| newPending | <code>Number</code> | The number of unresolved actions. |
| newUpdate | <code>Number</code> | The number of updates for User A. |

<a name="updateNumPending"></a>

## updateNumPending(newPending)
Update the number of pending requests and modify number of updates.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| newPending | <code>Number</code> | The number of unresolved actions. |

<a name="addUpdate"></a>

## addUpdate()
Add an update.

**Kind**: global function  
