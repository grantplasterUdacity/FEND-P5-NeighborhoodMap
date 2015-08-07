var myMap = function () {
	var self = this;
	self.markers = [];

	this.initializeMap = function () {
		var myLatlng1 = new google.maps.LatLng(53.65914, 0.072050);

		var mapOptions = {
			zoom: 8,
			center: myLatlng1
		};

		self.map = new google.maps.Map($('.mapdiv')[0], mapOptions);
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
			//content: name + ' ' + windowInfo

			content: "<h5>" + marker.title +
						"</h5><button type='button' onclick='yelpResponse(" + self.markers.length +  ")'" +
						"><img src='img/yelp.gif' width='110' height='28'" +
						"border='0' alt='yelp btn'></button><br>"
		});

		// Add event listeners so that markers animate and open info windows when clicked
		google.maps.event.addListener(marker, 'click', function() {
			infoWindow.open(marker.map, marker);
			self.toggleBounce(marker);
		});

		google.maps.event.addDomListener(item, 'click', function () {
			infoWindow.open(marker.map, marker);
			self.toggleBounce(marker);
		});

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

	this.filterMap = function (string, list) {
		if (list.length > 0) {
			for (var item in list) {
				var check = list[item];
				var toggler = self.markers[check.index];

				if (check.name.indexOf(string) === -1) {
					toggler.setVisible(false);
				}
				else {
					if (toggler) {
						toggler.setVisible(true);
					}
				}
			}
		}
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

var yelpResponse = function(index) {
		var lat = globalMap.markers[index].position.lat();
		var lon = globalMap.markers[index].position.lng();
		var name = globalMap.markers[index].title;
		globalIndex = index;

		function nonce_generate() {
			return (Math.floor(Math.random() * 1e12).toString());
		}

		var yelp_url = 'http://api.yelp.com/v2/search';
		var windowInfo;

		var oauth_params = {
			oauth_consumer_key: "Q8Pi5pYP5kjoCXHtfzpDhQ",
			oauth_token: "mBF0otGu3bB9lX1BiaUsMLE1iG3AkmjZ",
			oauth_nonce: nonce_generate(),
			oauth_timestamp: Math.floor(Date.now()/1000),
			oauth_signature_method: "HMAC-SHA1",
			oauth_version : '1.0',
			location: name,
			cll: lat + ', ' + lon,
			callback: 'cb'
		};

		// oathSignature generate in oauth-signature.js : (httpMethod, url, parameters, consumerSecret, tokenSecret, [options])
		var encodedSignature = oauthSignature.generate('GET', yelp_url, oauth_params, "XFWwdl3rlpQosgiOl3kql1OjxUA", "sYOp8lGYOGAo_S54OikUBaftBbU");
		oauth_params.oauth_signature = encodedSignature;

		$.ajax({
			url: yelp_url,
			data: oauth_params,
			cache: true,
			dataType: "jsonp",
			success : function (response) {
				var name = globalMap.markers[globalIndex].title;
				var array = response.businesses;
				var bizResponse = "error";

				for (biz in array) {
					if (name.indexOf(array[biz].location.display_address[0]) !== -1) {
						bizResponse = array[biz];
						break;
					}
				}

				if (bizResponse === "error") {
					alert("Unable to display Yelp information at this time.");
				}
				else {

					var image = bizResponse['image_url'];
					var name = bizResponse['name'];
					var address1 = bizResponse['location']['display_address'][0];
					var address2 = bizResponse['location']['display_address'][1];
					var tn = bizResponse['display_phone'];
					var ratingUrl = bizResponse['rating_img_url_small'];
					var yelpUrl = bizResponse['url'];

					bootbox.alert({
						title: "<img src=" + image + ">" + "&nbsp&nbsp" + name,
						message: address1 + "<br>" + address2 + "<br>" + tn + "<br><br>" +
							"<a href=" + yelpUrl + ">Click Here For More Information </a><br>" +
							"Rating: <img src=" + ratingUrl + "><br><img src='img/yelp.gif'>",
						closeButton: false,
						className: "dialog-wrapper"
					});

					var dialogHolder = $('.modal-dialog');
					dialogHolder.css({ marginLeft: ($(window).width() - dialogHolder.width()) / 2 });
				}
			},
			error: function () {
				alert("Unable to display Yelp information at this time.");
			}
		});
    };

var ViewModel = function () {
	var self = this;
	globalMap = self.myMap = new myMap();
	self.searchTerm = ko.observable("");
	self.myList = ko.observableArray([]);

	this.addListItem = function (item) {
		var newItem = {
			name : self.searchTerm(),
			index : self.myList().length
		};

		self.myList.push(newItem);
		self.myMap.doSearch(newItem.name, $('li').children()[newItem.index]);
		self.searchTerm("");
		this.filterList("");
		this.myMap.filterMap("", this.myList());
	};

	this.filterList = function (string) {
		list = self.myList();

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
	};

	self.myMap.initializeMap();

	$('.search').on('input', function (string) {
		self.filterList(string.target.value);
		self.myMap.filterMap(string.target.value, self.myList());
	});
};

ko.applyBindings (new ViewModel());