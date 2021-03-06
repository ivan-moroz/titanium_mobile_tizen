define(['Ti/_/Evented', 'Ti/_/lang', 'Ti/_/Contacts/helper', 'Ti/Contacts'], function(Evented, lang, contactHelper, Contacts) {

	function errorCallback(e, callback) {
		callback({
			code: -1,
			error: e.type + ': ' + e.message,
			success: false
		});
	}

	// This function is supplied as a success callback to Tizen's contact searching functions.
	// It takes an array of native Tizen's contact objects, converts them to Titanium contacts, and returns
	// to the user via callback.
	//
	// Parameters:
	//
	// - "contacts" is an array of Tizen native contact objects that were found;
	// - "successCallback" is the callback from client code, to be called when the result is ready.

	function findContactsSuccessCallback (contacts, group, callback) {
		var contactsCount = contacts.length,
			groupsCount, j, groupIds,
			i = 0,
			persons = [],
			Person = require('Ti/Contacts/Person');

		for (; i < contactsCount; i++) {
			groupIds = contacts[i].groupIds;
			groupsCount = groupIds.length;

			// Tizen's contact object contains group ids in array, but it doesn't support the indexOf method.
			// So we need a loop to find the value.
			for (j = 0; j < groupsCount; j++) {
				if (groupIds[j] === group.recordId) {
					persons.push(new Person(contactHelper.createTitaniumContact(contacts[i])));
					break;
				}
			}
		}
		callback({
			code: 0,
			success: true,
			persons: persons
		});
	}

	return lang.setObject('Ti.Contacts.Tizen.Group', Evented, {

		members: function(group, callback) {
			var addressbook = tizen.contact.getDefaultAddressBook();

			// Tell Tizen to perform the search.
			addressbook.find(function(contacts) {
				findContactsSuccessCallback(contacts, group, callback);
			}, function (e) {
				errorCallback(e, callback);
			});
		},

		sortedMembers: function(sortBy, group, callback) {
			var sortField = (sortBy === Contacts.CONTACTS_SORT_FIRST_NAME) ? 'name.firstName' : 'name.lastName',
				// Create a SortMode object to define the desired contact sorting mode:
				sortMode = new tizen.SortMode(sortField, 'ASC'),
				addressbook = tizen.contact.getDefaultAddressBook();

			// Tell Tizen to perform the search.
			addressbook.find(function(contacts) {
				findContactsSuccessCallback(contacts, group, callback);
			}, function (e) {
				errorCallback(e, callback);
			}, null, sortMode);
		}

	});
});
