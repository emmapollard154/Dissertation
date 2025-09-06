# UserB_dashboard_frontend

## Key Files

### dashboard_b_frontend.js
<p>Content script for User B dashboard (port 6173).</p>

### ./src/App.jsx
<p>Main App component for User B dashboard.</p>

## Constants

<dl>
<dt><del><a href="#A_BACKEND">A_BACKEND</a> : <code>Number</code></del></dt>
<dd><p>Port on which the User A dashboard backend runs.</p>
</dd>
<dt><del><a href="#B_BACKEND">B_BACKEND</a> : <code>Number</code></del></dt>
<dd><p>Port on which the User B dashboard backend runs.</p>
</dd>
<dt><del><a href="#B_FRONTEND">B_FRONTEND</a> : <code>Number</code></del></dt>
<dd><p>Port on which User B dashboard frontend runs.</p>
</dd>
<dt><a href="#OPTIONS_MAP">OPTIONS_MAP</a> : <code>Map</code></dt>
<dd><p>Mapping between chosen option number and its definition.</p>
</dd>
<dt><a href="#CHOICE_MAP">CHOICE_MAP</a> : <code>Map</code></dt>
<dd><p>Mapping between chosen option number and its result.</p>
</dd>
<dt><del><a href="#B_BACKEND">B_BACKEND</a> : <code>Number</code></del></dt>
<dd><p>Port on which the User B dashboard backend runs.</p>
</dd>
<dt><del><a href="#B_FRONTEND">B_FRONTEND</a> : <code>Number</code></del></dt>
<dd><p>Port on which User B dashboard frontend runs.</p>
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
<a name="B_BACKEND"></a>

## ~~B\_BACKEND : <code>Number</code>~~
***since version 1.0. May be updated.***

Port on which the User B dashboard backend runs.

**Kind**: global constant  
<a name="B_FRONTEND"></a>

## ~~B\_FRONTEND : <code>Number</code>~~
***since version 1.0. May be updated.***

Port on which User B dashboard frontend runs.

**Kind**: global constant  
<a name="OPTIONS_MAP"></a>

## OPTIONS\_MAP : <code>Map</code>
Mapping between chosen option number and its definition.

**Kind**: global constant  
<a name="CHOICE_MAP"></a>

## CHOICE\_MAP : <code>Map</code>
Mapping between chosen option number and its result.

**Kind**: global constant  
<a name="B_BACKEND"></a>

## ~~B\_BACKEND : <code>Number</code>~~
***since version 1.0. May be updated.***

Port on which the User B dashboard backend runs.

**Kind**: global constant  
<a name="B_FRONTEND"></a>

## ~~B\_FRONTEND : <code>Number</code>~~
***since version 1.0. May be updated.***

Port on which User B dashboard frontend runs.

**Kind**: global constant  
<a name="App"></a>

## App()
Main application component.

**Kind**: global function  
**Component**:   

* [App()](#App)
    * [~formatRequest(request)](#App..formatRequest) ⇒ <code>String</code>
    * [~updateRequest(context)](#App..updateRequest)
    * [~formatContext(context)](#App..formatContext) ⇒ <code>String</code>
    * [~displayChoice(choice, url)](#App..displayChoice) ⇒ <code>String</code>
    * [~displayOutcome(response)](#App..displayOutcome) ⇒ <code>String</code>
    * [~cancelUpdateRequest(context)](#App..cancelUpdateRequest)
    * [~checkContext(context)](#App..checkContext)
    * [~getMessageIcon(user)](#App..getMessageIcon)
    * [~fetchSettingsData()](#App..fetchSettingsData)
    * [~fetchTrustedData()](#App..fetchTrustedData)
    * [~fetchBrowserData()](#App..fetchBrowserData)
    * [~fetchActionData()](#App..fetchActionData)
    * [~fetchRequestData()](#App..fetchRequestData)
    * [~fetchMessageData()](#App..fetchMessageData)
    * [~responseBtn(btn, actionID)](#App..responseBtn)
    * [~simplifyTime(time)](#App..simplifyTime) ⇒ <code>String</code>
    * [~redactURL(url)](#App..redactURL) ⇒ <code>String</code>
    * [~displayContext(context)](#App..displayContext) ⇒ <code>String</code>
    * [~displayResponse(response)](#App..displayResponse) ⇒ <code>String</code>
    * [~sendMessage(content)](#App..sendMessage)
    * [~viewID()](#App..viewID) ⇒ <code>String</code>
    * [~logBrowsingView()](#App..logBrowsingView)
    * [~switchSettingsVisibility()](#App..switchSettingsVisibility)
    * [~switchHelpVisibility()](#App..switchHelpVisibility)
    * [~switchEducationVisibility()](#App..switchEducationVisibility)
    * [~switchHistoryVisibility()](#App..switchHistoryVisibility)

<a name="App..formatRequest"></a>

### App~formatRequest(request) ⇒ <code>String</code>
Set the description for an update request in the status panel.

**Kind**: inner method of [<code>App</code>](#App)  
**Returns**: <code>String</code> - A description of the request (user and context).  

| Param | Type | Description |
| --- | --- | --- |
| request | <code>Object</code> | The request data fetched from the database. |

<a name="App..updateRequest"></a>

### App~updateRequest(context)
Send message to backend to register request to update settings.

**Kind**: inner method of [<code>App</code>](#App)  

| Param | Type | Description |
| --- | --- | --- |
| context | <code>String</code> | The context for which the request has been made. |

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

<a name="App..fetchRequestData"></a>

### App~fetchRequestData()
Fetch request data from database.

**Kind**: inner method of [<code>App</code>](#App)  
**Throws**:

- <code>Error</code> if the fetch request fails.

<a name="App..fetchMessageData"></a>

### App~fetchMessageData()
Fetch message data from database.

**Kind**: inner method of [<code>App</code>](#App)  
**Throws**:

- <code>Error</code> if the fetch request fails.

<a name="App..responseBtn"></a>

### App~responseBtn(btn, actionID)
Allow User B to accept or reject a request.

**Kind**: inner method of [<code>App</code>](#App)  

| Param | Type | Description |
| --- | --- | --- |
| btn | <code>Object</code> | click event target (button). |
| actionID | <code>Object</code> | The request item (unique identifier). |

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

<a name="App..displayContext"></a>

### App~displayContext(context) ⇒ <code>String</code>
Display context of settings.

**Kind**: inner method of [<code>App</code>](#App)  
**Returns**: <code>String</code> - Verbose context description.  

| Param | Type | Description |
| --- | --- | --- |
| context | <code>String</code> | The context code (eg. 'E' for email). |

<a name="App..displayResponse"></a>

### App~displayResponse(response) ⇒ <code>String</code>
Display which settings are allowed and blocked.

**Kind**: inner method of [<code>App</code>](#App)  
**Returns**: <code>String</code> - A tick or cross depending on if the setting is allowed or blocked.  

| Param | Type | Description |
| --- | --- | --- |
| response | <code>String</code> | Letter code corresponding to the setting being allowed or blocked. |

<a name="App..sendMessage"></a>

### App~sendMessage(content)
Send the content and time of a message from User A to the backend.

**Kind**: inner method of [<code>App</code>](#App)  

| Param | Type | Description |
| --- | --- | --- |
| content | <code>Object</code> | The email content. |

<a name="App..viewID"></a>

### App~viewID() ⇒ <code>String</code>
Create unique ID for viewing browsing history action.

**Kind**: inner method of [<code>App</code>](#App)  
**Returns**: <code>String</code> - A unique ID.  
<a name="App..logBrowsingView"></a>

### App~logBrowsingView()
Add browsing history view to action table.

**Kind**: inner method of [<code>App</code>](#App)  
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

