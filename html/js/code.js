const urlBase = 'http://galaxycollapse.com/LAMPAPI';
const extension = 'php';

let userId = 0;
let firstName = "";
let lastName = "";

let saveContactTimeoutId = null
let contactListTimeoutId = null

let displayedContacts = []

function markRegistrationComplete() {
	document.getElementById("registerFirstName").remove();
	document.getElementById("registerLastName").remove();
	document.getElementById("registerUsername").remove();
	document.getElementById("registerPassword").remove();
	document.getElementById("dotImg").remove();
	document.getElementById("dotImg2").remove();
	document.getElementById("userImg").remove();
	document.getElementById("keyImg").remove();
	document.getElementById("registerButton").remove();
	document.getElementById("inner-title2").remove();
	document.getElementById("registerGif").innerHTML = '<img style="width: 50%" src="../images/yippee.gif" alt="weird thing doing a backflip"></img>'
	document.getElementById("registerResult").innerHTML = "Registration Complete!";
	document.getElementById("registerResult").style.color="#39ff14";
}

async function doRegister() {
	const firstName = document.getElementById("registerFirstName").value;
	const lastName = document.getElementById("registerLastName").value;
	const login = document.getElementById("registerUsername").value;
	const password = document.getElementById("registerPassword").value;
 
	if (firstName === "" || lastName === "" || login === "" | password === "") {
		document.getElementById("registerResult").innerHTML = "One or more fields not filled";
		return;
	}

	const payload = {firstName,lastName,login,password};
	const url = urlBase + '/AddUser.' + extension;
	try {
		const rawResponse = await fetch(url, {
			method: 'POST',
			body: JSON.stringify(payload),
			headers: {
				'Content-type': 'application.json; charset=UTF-8',
			},
		})
		if (!rawResponse.ok) throw Error(rawResponse.statusText)
		const result = await rawResponse.json()
		markRegistrationComplete()
	} catch(e) {
		console.error('Failed to register user')
		console.error(e)
		document.getElementById("registerResult").innerHTML = 'Failed to register, please try again later';
	}
}

async function doLogin() {
	userId = -1
	firstName = ''
	lastName = ''
	
	let login = document.getElementById('loginName').value
	let password = document.getElementById('loginPassword').value
	
	document.getElementById('loginResult').innerHTML = ""

	let payload = {login, password}
	let url = urlBase + '/Login.' + extension
	try {
		const rawResponse = await fetch(url, {
			method: 'POST',
			body: JSON.stringify(payload),
			headers: {
				'Content-type': 'application.json; charset=UTF-8',
			},
		})
		if (!rawResponse.ok) throw Error(rawResponse.statusText)
		const result = await rawResponse.json()

		if (result.id < 1) { // Incorrect login
			document.getElementById('loginResult').innerHTML = 'Incorrect username or password, please try again'
			return
		}

		firstName = result.firstName
		lastName = result.lastName
		userId = result.id

		saveCookie()
		window.location.href = 'contacts.html'
	} catch (e) {
		console.error('Failed to log in')
		console.error(e)
		document.getElementById('loginResult').innerHTML = 'Failed to log in, please try again'
	}
}

function onPrivilegedPageLoaded() {
	loadCookie()
	document.getElementById('userName').innerHTML = `${firstName} ${lastName}`
}

function doLogout() {
	userId = -1
	firstName = ''
	lastName = ''
	document.cookie = 'firstName="";lastName="";userId=""'
	window.location.href = 'index.html'
}

// Contact logic
async function searchContacts() {
	if (userId < 1) return
	const resultText = document.getElementById('searchContactResult')
	const contactTable = document.getElementById('contactTable')
	const contactList = document.getElementById('contactList')

	// Get data from fields
	const query = document.getElementById('searchText').value

	// Make sure it isn't empty
	if (query.trim() === '') {
		resultText.innerHTML = 'Please fill out the search field'
		return
	}

	resultText.innerHTML = 'Searching...'
	contactList.innerHTML = ''

	// Grab results from server
	const payload = { search: query, userID: userId }
	url = urlBase + '/SearchContact.' + extension
	try {
		const rawResponse = await fetch(url, {
			method: 'POST',
			body: JSON.stringify(payload),
			headers: {
				'Content-type': 'application.json; charset=UTF-8',
			},
		})
		if (!rawResponse.ok) throw Error(rawResponse.statusText)
		const result = await rawResponse.json()

		if (result.error.trim() != '') {
			// Error occurred (like no contacts found)
			resultText.innerHTML = result.error
			contactTable.style.display = 'none'
			return
		} else {
			resultText.innerHTML = '' // Clear loading text
		}

		// Load results into table
		displayedContacts = result.results.map(contact => {
			return { info: contact.split(','), editing: false, editIds: [] }
		})

		// Render
		renderTable()
	} catch (e) {
		console.error("Failed to search contacts on server")
		console.error(e)
		resultText.innerHTML = 'There was an error processing your request, please try again later'
		contactTable.style.display = 'none'
	}
}

async function saveContact(event) {
	event.preventDefault()
	if (userId < 1) return
	const resultText = document.getElementById('saveContactResult')

	// Get data from fields
	const name = document.getElementById('nameField').value
	const phone = document.getElementById('phoneNumberField').value
	const email = document.getElementById('emailField').value

	// Make sure none are empty
	if (name.trim() === '' || email.trim() === '' || phone.trim() === '') {
		resultText.innerHTML = 'Please fill out all fields'
		return
	}

	resultText.innerHTML = 'Adding...'
	clearTimeout(saveContactTimeoutId)

	// Push request to server
	const payload = { name, phone, email, userID: userId }
	const url = urlBase + '/AddContact.' + extension
	try {
		const rawResponse = await fetch(url, {
			method: 'POST',
			body: JSON.stringify(payload),
			headers: {
				'Content-type': 'application.json; charset=UTF-8',
			},
		})
		if (!rawResponse.ok) throw Error(rawResponse.statusText)

		// Clear fields
		document.getElementById('nameField').value = ''
		document.getElementById('phoneNumberField').value = ''
		document.getElementById('emailField').value = ''

		// Display success message
		resultText.innerHTML = 'Contact added!'
		saveContactTimeoutId = setTimeout(() => resultText.innerHTML = '', 3000)
	} catch (e) {
		console.error('Failed to add contact')
		console.error(e)
		resultText.innerHTML = 'There was an error processing your request, please try again later'
	}
}

async function onClickDeleteContact(name, phone, email) {
	if (userId < 1) return
	const resultText = document.getElementById('searchContactResult')

	clearTimeout(contactListTimeoutId)
	resultText.innerHTML = 'Deleting...'

	// Request server to delete
	const payload = { name, phone, email, userID: userId }
	const url = urlBase + '/DeleteContact.' + extension
	try {
		const rawResponse = await fetch(url, {
			method: 'POST',
			body: JSON.stringify(payload),
			headers: {
				'Content-type': 'application.json; charset=UTF-8',
			}
		})
		if (!rawResponse.ok) throw Error(rawResponse.statusText)
		const result = await rawResponse.json()

		// Check if there was error while deleting
		if (result.error.trim() !== '') {
			resultText.innerHTML = `Could not delete contact: ${result.error}`
			return
		}

		// Contact removed on server, remove from table
		displayedContacts = displayedContacts.filter((entry) => {
			const [n, p, e] = entry.info
			return n !== name || p !== phone || e != email
		})

		renderTable()
		resultText.innerHTML = 'Deleted!'
		contactListTimeoutId = setTimeout(() => resultText.innerHTML = '', 3000)
	} catch (e) {
		console.error("Error while attempting to delete contact")
		console.error(e)
		resultText.innerHTML = 'There was an error processing your request, please try again later'
	}
}

function startEditContact(name, phone, email) {
	// Find entry and mark as editing
	displayedContacts.forEach((entry) => {
		if (entry.info[0] !== name || entry.info[1] !== phone || entry.info[2] !== email) return
		entry.editing = true
	})

	renderTable()
}

function cancelEditContact(name, phone, email) {
	// Find entry and unmark as editing
	displayedContacts.forEach((entry) => {
		if (entry.info[0] !== name || entry.info[1] !== phone || entry.info[2] !== email) return
		entry.editing = false
		entry.editIds = []
	})

	renderTable()
}

async function saveContactEdits(name, phone, email) {
	if (userId < 1) return
	const resultText = document.getElementById('searchContactResult')

	// Get data from textboxes
	const entry = displayedContacts.find((e) => e.info[0] === name && e.info[1] === phone && e.info[2] === email)
	if (!entry) return
	const newName = document.getElementById(entry.editIds[0]).value ?? name
	const newPhone = document.getElementById(entry.editIds[1]).value ?? phone
	const newEmail = document.getElementById(entry.editIds[2]).value ?? email

	clearTimeout(contactListTimeoutId)
	resultText.innerHTML = 'Updating...'

	// Push request to server
	const payload = {
		name, phone, email,
		newname: newName, newphone: newPhone, newemail: newEmail,
		userID: userId,
	}

	const url = urlBase + '/EditContact.' + extension
	try {
		const rawResponse = await fetch(url, {
			method: 'POST',
			body: JSON.stringify(payload)
		})
		if (!rawResponse.ok) throw Error(rawResponse.statusText)
		const result = await rawResponse.json()

		// Check for error
		if (result.error.trim() !== '') {
			resultText.innerHTML = `Could not edit contact: ${result.error}`
			return
		}

		// Update local entry in table and disable editing
		entry.info = [newName, newPhone, newEmail]
		cancelEditContact(newName, newPhone, newEmail)

		// Update result text
		resultText.innerHTML = 'Updated!'
		contactListTimeoutId = setTimeout(() => resultText.innerHTML = '', 3000)
	} catch (e) {
		console.error('Error while attempting to edit contact')
		console.error(e)
		result.innerHTML = 'There was an error processing your request, please try again later'
	}
}

// Table rendering logic
function renderTable() {
	const contactTable = document.getElementById('contactTable')
	const contactList = document.getElementById('contactList')

	// Hide table if no items to show
	if (displayedContacts.length === 0) {
		contactTable.style.display = 'none'
		return
	}

	// Render contents of table
	contactList.innerHTML = displayedContacts.map(entry => {
		const splitText = entry.info

		if (entry.editing) {
			if (entry.editIds.length === 0) {
				entry.editIds[0] = Math.random().toString()
				entry.editIds[1] = Math.random().toString()
				entry.editIds[2] = Math.random().toString()
			}
			const id1 = entry.editIds[0]
			const id2 = entry.editIds[1]
			const id3 = entry.editIds[2]

			return `
			<tr>
				<td><input id="${id1}" type="text" value="${splitText[0]}" placeholder="Name" /></td>
				<td><input id="${id2}" type="tel" value="${splitText[1]}" placeholder="Phone" /></td>
				<td><input id="${id3}" type="email" value="${splitText[2]}" placeholder="Email" /></td>
				<td>
					<button class="editButton" onClick="cancelEditContact('${splitText[0]}', '${splitText[1]}', '${splitText[2]}')">
						Cancel
					</button>
					<button class="saveButton" onClick="saveContactEdits('${splitText[0]}', '${splitText[1]}', '${splitText[2]}')">
						<b>Save</b>
					</button>
				</td>
			</tr>`
		}

		return `
			<tr>
				<td>${splitText[0]}</td>
				<td>${splitText[1]}</td>
				<td>${splitText[2]}</td>
				<td>
					<button class="editButton" onClick="startEditContact('${splitText[0]}', '${splitText[1]}', '${splitText[2]}')">
						Edit
					</button>
					<button class="removeButton" onClick="onClickDeleteContact('${splitText[0]}', '${splitText[1]}', '${splitText[2]}')">
						<b>X</b>
					</button>
				</td>
			</tr>`
	}).join('')

	// Show table
	contactTable.style.display = 'block'
}

// Cookie logic
function loadCookie() {
	// Dump out old data
	firstName = ''
	lastName = ''
	userId = -1

	// Get and parse each cookie
	const cookies = document.cookie.split(';')
	for (let i = 0; i < cookies.length; i++) {
		const cookie = cookies[i]
		const splitText = cookie.split('=')

		switch (splitText[0].trim()) {
			case 'firstName':
				firstName = splitText[1]
				break
			case 'lastName':
				lastName = splitText[1]
				break
			case 'userId':
				userId = parseInt(splitText[1])
				break
		}
	}

	// Kick back to login screen if cookie is invalid
	if (userId < 0) {
		window.location.href = "index.html"
	}
}

function saveCookie() {
	const minutes = 20
	const expires = new Date()
	expires.setTime(expires.getTime() + (minutes * 60 * 1000))

	document.cookie = `firstName=${firstName}`
	document.cookie = `lastName=${lastName}`
	document.cookie = `userId=${userId}`
	document.cookie = `expires=${expires.toGMTString()}`
}
