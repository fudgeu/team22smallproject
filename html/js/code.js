//const urlBase = 'http://161.35.2.206/LAMPAPI';
const urlBase = 'http://galaxycollapse.com/LAMPAPI';
const extension = 'php';

let userId = 0;
let firstName = "";
let lastName = "";

let saveContactTimeoutId = null

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
	document.getElementById("registerGif").innerHTML = '<img style="width: 50%" src="../images/yippee.gif"></img>'
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
		const rawResult = await fetch(url, {
			method: 'POST',
			body: JSON.stringify(payload),
			headers: {
				'Content-type': 'application.json; charset=UTF-8',
			},
		})
		if (!rawResponse.ok) throw Error(rawResponse.statusText)
		const result = await rawResult.json()
		markRegistrationComplete()
	} catch(e) {
		console.error('Failed to register user')
		console.error(e)
		document.getElementById("registerResult").innerHTML = 'Failed to register, please try again later';
	}
}

async function doLogin() {
	userId = 0
	firstName = ''
	lastName = ''
	
	let login = document.getElementById('loginName').value
	let password = document.getElementById('loginPassword').value
	
	document.getElementById('loginResult').innerHTML = ""

	let payload = {login, password}
	let url = urlBase + '/Login.' + extension
	try {
		const rawResult = await fetch(url, {
			method: 'POST',
			body: JSON.stringify(payload),
			headers: {
				'Content-type': 'application.json; charset=UTF-8',
			},
		})
		if (!rawResponse.ok) throw Error(rawResponse.statusText)
		const result = await rawResult.json()

		if (result.id < 1) { // Incorrect login
			document.getElementById('loginResult').innerHTML = 'Incorrect username or password, please try again'
			return
		}

		firstName = result.firstName
		lastName = result.lastName
		userId = result.id

		saveCookie()
		window.location.href = 'color.html'
	} catch (e) {
		console.error('Failed to log in')
		console.error(e)
		document.getElementById('loginResult').innerHTML = 'Failed to log in, please try again'
	}
}

function onColorPageLoaded() {
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

// Color logic (to be removed)
function addColor()
{
	let newColor = document.getElementById("colorText").value;
	document.getElementById("colorAddResult").innerHTML = "";

	let tmp = {color:newColor,userId,userId};
	let jsonPayload = JSON.stringify( tmp );

	let url = urlBase + '/AddColor.' + extension;
	
	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.onreadystatechange = function() 
		{
			if (this.readyState == 4 && this.status == 200) 
			{
				document.getElementById("colorAddResult").innerHTML = "Color has been added";
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err)
	{
		document.getElementById("colorAddResult").innerHTML = err.message;
	}
	
}

function searchColor()
{
	let srch = document.getElementById("searchText").value;
	document.getElementById("colorSearchResult").innerHTML = "";
	
	let colorList = "";

	let tmp = {search:srch,userId:userId};
	let jsonPayload = JSON.stringify( tmp );

	let url = urlBase + '/SearchColors.' + extension;
	
	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.onreadystatechange = function() 
		{
			if (this.readyState == 4 && this.status == 200) 
			{
				document.getElementById("colorSearchResult").innerHTML = "Color(s) has been retrieved";
				let jsonObject = JSON.parse( xhr.responseText );
				
				for( let i=0; i<jsonObject.results.length; i++ )
				{
					colorList += jsonObject.results[i];
					if( i < jsonObject.results.length - 1 )
					{
						colorList += "<br />\r\n";
					}
				}
				
				document.getElementsByTagName("p")[0].innerHTML = colorList;
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err)
	{
		document.getElementById("colorSearchResult").innerHTML = err.message;
	}
	
}

// Contact logic
function searchContacts() {
	console.log("search contact hit")
}

async function saveContact() {
	if (userId < 1) return
	const resultText = document.getElementById('saveContactResult')

	// Get data from fields
	const name = document.getElementById("nameField").value
	const phone = document.getElementById("phoneNumberField").value
	const email = document.getElementById("emailField").value

	// Make sure none are empty
	if (name.trim() === '' || email.trim() === '' || phone.trim() === '') {
		resultText.innerHTML = 'Please fill out all fields'
		return
	}

	resultText.innerHTML = "Adding..."
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
		document.getElementById("nameField").value = ''
		document.getElementById("phoneNumberField").value = ''
		document.getElementById("emailField").value = ''

		// Display success message
		resultText.innerHTML = 'Contact added!'
		saveContactTimeoutId = setTimeout(() => resultText.innerHTML = '', 3000)
	} catch (e) {
		console.error('Failed to add contact')
		console.error(e)
		resultText.innerHTML = 'There was an error contacting the server, please try again later'
	}
}

// Cookie logic
function loadCookie() {
	const [firstNameRaw, lastnameRaw, userIdRaw, _] = document.cookie.split(';')
	firstName = firstNameRaw.split('=')[1] ?? 'Unknown'
	lastName = lastnameRaw.split('=')[1] ?? 'User'
	userId = parseInt(userIdRaw.split('=')[1]) ?? -1

	if (userId < 0) { // Kick back to login screen if cookie is invalid
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
