var myMap = function () {
	var self = this;
	this.markers = [];

	this.initializeMap = function () {
		var myLatlng1 = new google.maps.LatLng(53.65914, 0.072050);

		var mapOptions = {
			zoom: 8,
			center: myLatlng1
		};

		self.map = new google.maps.Map(document.getElementById('mapdiv'), mapOptions);
		self.service = new google.maps.places.PlacesService(self.map);

		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(function (position) {
				initialLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
				self.map.setCenter(initialLocation);
			});
		}

		// Sets the boundaries of the map based on pin locations
  		window.mapBounds = new google.maps.LatLngBounds();
	};

	this.doSearch = function (string, item) {
		var request = { query : string };
		self.service.textSearch(request, function (results, status) {
			if (status == google.maps.places.PlacesServiceStatus.OK) {
				self.addMapMarker(results[0], item);
			}
		});
	};

	this.addMapMarker = function (placeData, item) {
		// The next lines save location data from the search result object to local variables
		var lat = placeData.geometry.location.lat();  // latitude from the place service
		var lon = placeData.geometry.location.lng();  // longitude from the place service
		var name = placeData.formatted_address;   // name of the place from the place service
		var bounds = window.mapBounds;            // current boundaries of the map window

		// marker is an object with additional data about the pin for a single location
		var marker = new google.maps.Marker({
			map: self.map,
			position: placeData.geometry.location,
			animation: google.maps.Animation.DROP,
			title: name
		});

		// infoWindows are the little helper windows that open when you click
		// or hover over a pin on a map. They usually contain more information
		// about a location.
		var infoWindow = new google.maps.InfoWindow({
			content: name
		});

		// hmmmm, I wonder what this is about...
		google.maps.event.addListener(marker, 'click', function() {
			infoWindow.open(marker.map, marker);
			self.toggleBounce(marker);
		});

		google.maps.event.addDomListener(item, 'click', function () {
			infoWindow.open(marker.map, marker);
			self.toggleBounce(marker);
		})

		self.markers.push(marker);

		// this is where the pin actually gets added to the map.
		// bounds.extend() takes in a map location object
		bounds.extend(new google.maps.LatLng(lat, lon));
		// fit the map to the new marker
		self.map.fitBounds(bounds);
		// center the map
		self.map.setCenter(bounds.getCenter());
	};

	this.toggleBounce = function (marker) {

		if (marker.getAnimation() == null) {
			marker.setAnimation(google.maps.Animation.BOUNCE);

			setTimeout(function () {
				marker.setAnimation(null);
			}, 1400);
		}
	};

	this.filterMap = function (string) {
		console.log(string);
	}

	// Calls the initializeMap() function when the page loads
	window.addEventListener('load', self.initializeMap);

	// Vanilla JS way to listen for resizing of the window
	// and adjust map bounds
	window.addEventListener('resize', function(e) {
	  //Make sure the map bounds get updated on page resize
	  self.map.fitBounds(mapBounds);
	});
};

var ViewModel = function () {
	var self = this;
	this.myMap = new myMap();
	this.searchTerm = ko.observable("");
	this.myList = ko.observableArray([]);

	this.addListItem = function (item) {
		var newItem = { name : self.searchTerm(), index : self.myList().length };

		self.myList.push(newItem);
		self.myMap.doSearch(newItem.name, $('li').children()[newItem.index]);
		self.searchTerm("");
		this.filterList("");
	};

	this.filterList = function (string) {
		list = self.myList();
		console.log(list);

		if (list.length > 0) {
			for (var item in list) {
				var check = list[item];
				var toggler = $('li').children()[check.index];

				if (check.name.indexOf(string) === -1) {
					toggler.style.display = "none";
				}
				else {
					toggler.style.display = "block";
				}
			}
		}
	}

	this.myMap.initializeMap();

	$('#search').on('input', function (string) {
		self.filterList(string.target.value);
		//self.myMap.filterMap(string.target.value);
	});
};

ko.applyBindings (new ViewModel());