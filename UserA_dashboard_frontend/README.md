## Constants

<dl>
<dt><del><a href="#A_BACKEND">A_BACKEND</a> : <code>Number</code></del></dt>
<dd><p>Port on which the User A dashboard backend runs.</p>
</dd>
<dt><del><a href="#A_FRONTEND">A_FRONTEND</a> : <code>Number</code></del></dt>
<dd><p>Port on which User A dashboard frontend runs.</p>
</dd>
<dt><del><a href="#TEMP_EMAIL">TEMP_EMAIL</a> : <code>String</code></del></dt>
<dd><p>Temporary email address for User B notifications.</p>
</dd>
<dt><del><a href="#PUBLIC_KEY">PUBLIC_KEY</a> : <code>String</code></del></dt>
<dd><p>Public key for EmailJS.</p>
</dd>
<dt><del><a href="#SERVICE_ID">SERVICE_ID</a> : <code>String</code></del></dt>
<dd><p>Service ID for EmailJS.</p>
</dd>
<dt><del><a href="#TEMPLATE_ID">TEMPLATE_ID</a> : <code>String</code></del></dt>
<dd><p>Template ID for EmailJS.</p>
</dd>
<dt><a href="#OPTIONS_MAP">OPTIONS_MAP</a> : <code>Map</code></dt>
<dd><p>Mapping between chosen option number and its definition.</p>
</dd>
<dt><a href="#CHOICE_MAP">CHOICE_MAP</a> : <code>Map</code></dt>
<dd><p>Mapping between chosen option number and its result.</p>
</dd>
<dt><del><a href="#EXTENSION_ID">EXTENSION_ID</a> : <code>String</code></del></dt>
<dd><p>Chrome extension ID.</p>
</dd>
<dt><del><a href="#A_BACKEND">A_BACKEND</a> : <code>Number</code></del></dt>
<dd><p>Port on which the User A dashboard backend runs.</p>
</dd>
<dt><del><a href="#A_FRONTEND">A_FRONTEND</a> : <code>Number</code></del></dt>
<dd><p>Port on which User A dashboard frontend runs.</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#App">App()</a></dt>
<dd><p>Main application component.</p>
</dd>
<dt><a href="#sendDataToBackend">sendDataToBackend(data)</a> ⇒ <code>Object</code></dt>
<dd><p>Send data from frontend to backend.</p>
</dd>
</dl>

<a name="A_BACKEND"></a>

## ~~A\_BACKEND : <code>Number</code>~~
***since version 1.0. May be updated.***

Port on which the User A dashboard backend runs.

**Kind**: global constant  
<a name="A_FRONTEND"></a>

## ~~A\_FRONTEND : <code>Number</code>~~
***since version 1.0. May be updated.***

Port on which User A dashboard frontend runs.

**Kind**: global constant  
<a name="TEMP_EMAIL"></a>

## ~~TEMP\_EMAIL : <code>String</code>~~
***since version 1.0. Must be updated.***

Temporary email address for User B notifications.

**Kind**: global constant  
<a name="PUBLIC_KEY"></a>

## ~~PUBLIC\_KEY : <code>String</code>~~
***since version 1.0. Must be updated.***

Public key for EmailJS.

**Kind**: global constant  
<a name="SERVICE_ID"></a>

## ~~SERVICE\_ID : <code>String</code>~~
***since version 1.0. Must be updated.***

Service ID for EmailJS.

**Kind**: global constant  
<a name="TEMPLATE_ID"></a>

## ~~TEMPLATE\_ID : <code>String</code>~~
***since version 1.0. Must be updated.***

Template ID for EmailJS.

**Kind**: global constant  
<a name="OPTIONS_MAP"></a>

## OPTIONS\_MAP : <code>Map</code>
Mapping between chosen option number and its definition.

**Kind**: global constant  
<a name="CHOICE_MAP"></a>

## CHOICE\_MAP : <code>Map</code>
Mapping between chosen option number and its result.

**Kind**: global constant  
<a name="EXTENSION_ID"></a>

## ~~EXTENSION\_ID : <code>String</code>~~
***since version 1.0. Must be updated.***

Chrome extension ID.

**Kind**: global constant  
<a name="A_BACKEND"></a>

## ~~A\_BACKEND : <code>Number</code>~~
***since version 1.0. May be updated.***

Port on which the User A dashboard backend runs.

**Kind**: global constant  
<a name="A_FRONTEND"></a>

## ~~A\_FRONTEND : <code>Number</code>~~
***since version 1.0. May be updated.***

Port on which User A dashboard frontend runs.

**Kind**: global constant  
<a name="App"></a>

## App()
Main application component.

**Kind**: global function  
**Component**:   

* [App()](#App)
    * [~checkSettings(data)](#App..checkSettings)
    * [~formatRequest(request)](#App..formatRequest) ⇒ <code>String</code>
    * [~displayContext(context)](#App..displayContext) ⇒ <code>String</code>
    * [~formatContext(context)](#App..formatContext) ⇒ <code>String</code>
    * [~displayChoice(choice, url)](#App..displayChoice) ⇒ <code>String</code>
    * [~displayOutcome(response)](#App..displayOutcome) ⇒ <code>String</code>
    * [~displayResponse(response)](#App..displayResponse) ⇒ <code>String</code>
    * [~updateRequest(context)](#App..updateRequest)
    * [~cancelUpdateRequest(context)](#App..cancelUpdateRequest)
    * [~checkContext(context)](#App..checkContext)
    * [~getMessageIcon(user)](#App..getMessageIcon)
    * [~fetchBrowserData()](#App..fetchBrowserData)
    * [~fetchActionData()](#App..fetchActionData)
    * [~fetchMessageData()](#App..fetchMessageData)
    * [~fetchSettingsData()](#App..fetchSettingsData)
    * [~fetchTrustedData()](#App..fetchTrustedData)
    * [~settingID()](#App..settingID) ⇒ <code>String</code>
    * [~updateSettingsData(context)](#App..updateSettingsData)
    * [~updateTrustedData(context)](#App..updateTrustedData)
    * [~removeTrusted(address)](#App..removeTrusted)
    * [~sendToExt(msgType, msgContent)](#App..sendToExt)
    * [~simplifyTime(time)](#App..simplifyTime) ⇒ <code>String</code>
    * [~redactURL(url)](#App..redactURL) ⇒ <code>String</code>
    * [~sendHelpMessage()](#App..sendHelpMessage)
    * [~sendEmailContent(content)](#App..sendEmailContent)
    * [~sendAlertEmail()](#App..sendAlertEmail)
    * [~sendMessage(content)](#App..sendMessage)
    * [~switchSettingsVisibility()](#App..switchSettingsVisibility)
    * [~switchHelpVisibility()](#App..switchHelpVisibility)
    * [~switchEducationVisibility()](#App..switchEducationVisibility)
    * [~switchHistoryVisibility()](#App..switchHistoryVisibility)
    * [~switchTogetherVisibility()](#App..switchTogetherVisibility)
    * [~enableWelcomeVisibility()](#App..enableWelcomeVisibility)
    * [~disableWelcomeVisibility()](#App..disableWelcomeVisibility)
    * [~enableUpdateVisibility()](#App..enableUpdateVisibility)
    * [~disableUpdateVisibility()](#App..disableUpdateVisibility)
    * [~enableTrustedVisibility()](#App..enableTrustedVisibility)
    * [~disableTrustedVisibility()](#App..disableTrustedVisibility)
    * [~proceedToUpdate(context)](#App..proceedToUpdate)

<a name="App..checkSettings"></a>

### App~checkSettings(data)
Check settings configuration.

**Kind**: inner method of [<code>App</code>](#App)  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>Object</code> | Fetched settings data. |

<a name="App..formatRequest"></a>

### App~formatRequest(request) ⇒ <code>String</code>
Set the description for an update request in the status panel.

**Kind**: inner method of [<code>App</code>](#App)  
**Returns**: <code>String</code> - A description of the request (user and context).  

| Param | Type | Description |
| --- | --- | --- |
| request | <code>Object</code> | The request data fetched from the database. |

<a name="App..displayContext"></a>

### App~displayContext(context) ⇒ <code>String</code>
Display context of settings.

**Kind**: inner method of [<code>App</code>](#App)  
**Returns**: <code>String</code> - Verbose context description.  

| Param | Type | Description |
| --- | --- | --- |
| context | <code>String</code> | The context code (eg. 'E' for email). |

<a name="App..formatContext"></a>

### App~formatContext(context) ⇒ <code>String</code>
Check context.

**Kind**: inner method of [<code>App</code>](#App)  
**Returns**: <code>String</code> - The context code if it exists.  

| Param | Type | Description |
| --- | --- | --- |
| context | <code>String</code> | The context code (eg. 'E' for email). |

<a name="App..displayChoice"></a>

### App~displayChoice(choice, url) ⇒ <code>String</code>
Describe the choice made by User A.

**Kind**: inner method of [<code>App</code>](#App)  
**Returns**: <code>String</code> - Description of the choice made and the corresponding link.  

| Param | Type | Description |
| --- | --- | --- |
| choice | <code>String</code> | The choice made by User A. |
| url | <code>String</code> | The url corresponding to the action. |

<a name="App..displayOutcome"></a>

### App~displayOutcome(response) ⇒ <code>String</code>
Display the outcome for resolved requests.

**Kind**: inner method of [<code>App</code>](#App)  
**Returns**: <code>String</code> - 'Approved' or 'Rejected' depending on User B response.  

| Param | Type | Description |
| --- | --- | --- |
| response | <code>String</code> | Letter code corresponding to User B accepting or rejecting. |

<a name="App..displayResponse"></a>

### App~displayResponse(response) ⇒ <code>String</code>
Display which settings are allowed and blocked.

**Kind**: inner method of [<code>App</code>](#App)  
**Returns**: <code>String</code> - A tick or cross depending on if the setting is allowed or blocked.  

| Param | Type | Description |
| --- | --- | --- |
| response | <code>String</code> | Letter code corresponding to the setting being allowed or blocked. |

<a name="App..updateRequest"></a>

### App~updateRequest(context)
Send message to backend to register request to update settings.

**Kind**: inner method of [<code>App</code>](#App)  

| Param | Type | Description |
| --- | --- | --- |
| context | <code>String</code> | The context for which the request has been made. |

<a name="App..cancelUpdateRequest"></a>

### App~cancelUpdateRequest(context)
Send message to backend to register cancellation of a request to update settings.

**Kind**: inner method of [<code>App</code>](#App)  

| Param | Type | Description |
| --- | --- | --- |
| context | <code>String</code> | The context for which the request has been made. |

<a name="App..checkContext"></a>

### App~checkContext(context)
Find the corresponding icon for the action history panel.

**Kind**: inner method of [<code>App</code>](#App)  

| Param | Type | Description |
| --- | --- | --- |
| context | <code>String</code> | The context to which the action corresponds. |

<a name="App..getMessageIcon"></a>

### App~getMessageIcon(user)
Find the corresponding icon for message sender.

**Kind**: inner method of [<code>App</code>](#App)  

| Param | Type | Description |
| --- | --- | --- |
| user | <code>String</code> | The identifier of the user. |

<a name="App..fetchBrowserData"></a>

### App~fetchBrowserData()
Fetch browsing history data from database.

**Kind**: inner method of [<code>App</code>](#App)  
**Throws**:

- <code>Error</code> if the fetch request fails.

<a name="App..fetchActionData"></a>

### App~fetchActionData()
Fetch action data from database.

**Kind**: inner method of [<code>App</code>](#App)  
**Throws**:

- <code>Error</code> if the fetch request fails.

<a name="App..fetchMessageData"></a>

### App~fetchMessageData()
Fetch message data from database.

**Kind**: inner method of [<code>App</code>](#App)  
**Throws**:

- <code>Error</code> if the fetch request fails.

<a name="App..fetchSettingsData"></a>

### App~fetchSettingsData()
Fetch settings data from database.

**Kind**: inner method of [<code>App</code>](#App)  
**Throws**:

- <code>Error</code> if the fetch request fails.

<a name="App..fetchTrustedData"></a>

### App~fetchTrustedData()
Fetch trusted contacts data from database.

**Kind**: inner method of [<code>App</code>](#App)  
**Throws**:

- <code>Error</code> if the fetch request fails.

<a name="App..settingID"></a>

### App~settingID() ⇒ <code>String</code>
Create unique ID for settings update actions.

**Kind**: inner method of [<code>App</code>](#App)  
**Returns**: <code>String</code> - if the fetch request fails.  
<a name="App..updateSettingsData"></a>

### App~updateSettingsData(context)
Update the settings configurations.

**Kind**: inner method of [<code>App</code>](#App)  

| Param | Type | Description |
| --- | --- | --- |
| context | <code>String</code> | The context for the update request to cancel or instigate if null. |

<a name="App..updateTrustedData"></a>

### App~updateTrustedData(context)
Add a trusted contact.

**Kind**: inner method of [<code>App</code>](#App)  

| Param | Type | Description |
| --- | --- | --- |
| context | <code>String</code> | The context for the trusted contact. |

<a name="App..removeTrusted"></a>

### App~removeTrusted(address)
Remove a trusted contact.

**Kind**: inner method of [<code>App</code>](#App)  

| Param | Type | Description |
| --- | --- | --- |
| address | <code>String</code> | The email address to remove. |

<a name="App..sendToExt"></a>

### App~sendToExt(msgType, msgContent)
Send a message to the browser extension.

**Kind**: inner method of [<code>App</code>](#App)  

| Param | Type | Description |
| --- | --- | --- |
| msgType | <code>String</code> | The type of message. |
| msgContent | <code>String</code> | The message content. |

<a name="App..simplifyTime"></a>

### App~simplifyTime(time) ⇒ <code>String</code>
Convert ISO time to simplified format.

**Kind**: inner method of [<code>App</code>](#App)  
**Returns**: <code>String</code> - The time in a simplified format.  

| Param | Type | Description |
| --- | --- | --- |
| time | <code>String</code> | Stringified time. |

<a name="App..redactURL"></a>

### App~redactURL(url) ⇒ <code>String</code>
Strip url of excess information.

**Kind**: inner method of [<code>App</code>](#App)  
**Returns**: <code>String</code> - The redacted url.  

| Param | Type | Description |
| --- | --- | --- |
| url | <code>String</code> | The full url collected. |

<a name="App..sendHelpMessage"></a>

### App~sendHelpMessage()
Send automatic message to the backend.

**Kind**: inner method of [<code>App</code>](#App)  
<a name="App..sendEmailContent"></a>

### App~sendEmailContent(content)
Send the email content to the backend.

**Kind**: inner method of [<code>App</code>](#App)  

| Param | Type | Description |
| --- | --- | --- |
| content | <code>Object</code> | The email content. |

<a name="App..sendAlertEmail"></a>

### App~sendAlertEmail()
Send automatic email alert to User B.

**Kind**: inner method of [<code>App</code>](#App)  
<a name="App..sendMessage"></a>

### App~sendMessage(content)
Send the content and time of a message from User A to the backend.

**Kind**: inner method of [<code>App</code>](#App)  

| Param | Type | Description |
| --- | --- | --- |
| content | <code>Object</code> | The email content. |

<a name="App..switchSettingsVisibility"></a>

### App~switchSettingsVisibility()
Switch the visibility of the settings information.

**Kind**: inner method of [<code>App</code>](#App)  
<a name="App..switchHelpVisibility"></a>

### App~switchHelpVisibility()
Switch the visibility of the help centre.

**Kind**: inner method of [<code>App</code>](#App)  
<a name="App..switchEducationVisibility"></a>

### App~switchEducationVisibility()
Switch the visibility of the safety information.

**Kind**: inner method of [<code>App</code>](#App)  
<a name="App..switchHistoryVisibility"></a>

### App~switchHistoryVisibility()
Switch the visibility of the browsing history information.

**Kind**: inner method of [<code>App</code>](#App)  
<a name="App..switchTogetherVisibility"></a>

### App~switchTogetherVisibility()
Switch the visibility of the settings update warning popup.

**Kind**: inner method of [<code>App</code>](#App)  
<a name="App..enableWelcomeVisibility"></a>

### App~enableWelcomeVisibility()
Enable the visibility of the settings configuration popup.

**Kind**: inner method of [<code>App</code>](#App)  
<a name="App..disableWelcomeVisibility"></a>

### App~disableWelcomeVisibility()
Disable the visibility of the settings configuration popup.

**Kind**: inner method of [<code>App</code>](#App)  
<a name="App..enableUpdateVisibility"></a>

### App~enableUpdateVisibility()
Enable the visibility of the settings update popup.

**Kind**: inner method of [<code>App</code>](#App)  
<a name="App..disableUpdateVisibility"></a>

### App~disableUpdateVisibility()
Disable the visibility of the settings update popup.

**Kind**: inner method of [<code>App</code>](#App)  
<a name="App..enableTrustedVisibility"></a>

### App~enableTrustedVisibility()
Enable the visibility of the trusted settings configuration popup.

**Kind**: inner method of [<code>App</code>](#App)  
<a name="App..disableTrustedVisibility"></a>

### App~disableTrustedVisibility()
Disable the visibility of the trusted settings configuration popup.

**Kind**: inner method of [<code>App</code>](#App)  
<a name="App..proceedToUpdate"></a>

### App~proceedToUpdate(context)
Switch from warning to prompt users to be together to the relevant update popup.

**Kind**: inner method of [<code>App</code>](#App)  

| Param | Type | Description |
| --- | --- | --- |
| context | <code>String</code> | The letter code for the context of the settings update. |

<a name="sendDataToBackend"></a>

## sendDataToBackend(data) ⇒ <code>Object</code>
Send data from frontend to backend.

**Kind**: global function  
**Returns**: <code>Object</code> - The result of the fetch.  
**Throws**:

- <code>Error</code> If the fetch request fails.


| Param | Type | Description |
| --- | --- | --- |
| data | <code>Object</code> | The data to send to the backend. |

