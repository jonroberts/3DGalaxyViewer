var db = null;
function html5_storage_support() {
  try {
    return 'localStorage' in window && window['localStorage'] !== null;
  } catch (e) {
    return false;
  }
}

function storeMyContact(id) {
	var fullname	= document.getElementById('fullname').innerHTML;
	var phone		= document.getElementById('phone').innerHTML;
	var email		= document.getElementById('email').innerHTML;
	localStorage.setItem('mcFull',fullname);
	localStorage.setItem('mcPhone',phone);
	localStorage.setItem('mcEmail',email);
}

function getMyContact() {
	if (localStorage.getItem('mcFull')) {
		  var fullname	= localStorage.getItem('mcFull');
		  var phone		= localStorage.getItem('mcPhone');
		  var email		= localStorage.getItem('mcEmail');
	}
	else {
		  var fullname	= 'Enter A Name';
		  var phone		= 'Enter A Phone Number';
		  var email		= 'Enter An Email Address'
	}
	document.getElementById('fullname').innerHTML = fullname;
	document.getElementById('phone').innerHTML = phone;
	document.getElementById('email').innerHTML = email;
}

if (!html5_storage_support) {
  alert("This Might Be a Good Time to Upgrade Your Browser or Turn On Jeavascript");
}
else {
  db = openDatabase("MyContacts", "0.1", "My Personal Contacts", 100000);

}