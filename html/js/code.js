const urlBase = 'http://161.35.2.206/LAMPAPI';
const extension = 'php';

let userId = 0;
let firstName = "";
let lastName = "";

//
// To do: doRegister function for register.html page
// Refer to register.html for id names
function doRegister()
{
	// Redirects to homepage if registration is good.
	window.location.href = "index.html";
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
		const result = await rawResult.json()

		if (result.id < 1) { // Incorrect login
			document.getElementById('loginResult').innerHTML = 'Incorrect username or password, please try again'
			return
		}

		firstName = result.firstName
		lastName = result.lastName
		saveCookie()
		window.location.href = 'color.html'
	} catch (e) {
		console.error('Failed to log in')
		console.error(e)
		document.getElementById('loginResult').innerHTML = 'Failed to log in, please try again'
	}
}

function saveCookie() {
	const minutes = 20
	const expires = new Date()
	expires.setTime(expires.getTime() + (minutes * 60 * 1000))

	const newCookie = {firstName, lastName, userId, expires: expires.toGMTString()}
	document.cookie = JSON.stringify(newCookie)
}

function onColorPageLoaded() {
	// Read in cookie
	userId = -1
	const data = JSON.parse(document.cookie)
	
	firstName = data.firstName ?? 'Unknown'
	lastName = data.lastName ?? 'User'
	userId = data.userId ?? -1
	
	if (userId < 0) { // Kick back to login screen if cookie is invalid
		window.location.href = "index.html"
	}

	// Update page content to include username
	document.getElementById('userName').innerHTML = `${firstName} ${lastName}`
}

function doLogout() {
	userId = -1
	firstName = ''
	lastName = ''
	document.cookie = ''
	window.location.href = 'index.html'
}

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
