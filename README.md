Front-End Web Development P5: Neighborhood Map

To open this file, all you need to do is double-click on the index.html file
provided. If you have an HTTP server set up then the Google Maps API used will
display a map centered at your current location, but if not then the location is
initialized to coordinates in the UK.

To complete this project I created an html structure of divs - one for the header, one for
the search bar, and one for the application area. The application contains a div for the list
of locations a user has searched for, and a div for the map.

Typing a location into the search bar and clicking enter will run a Google Maps search for it
and add a marker at the appropriate location on the map while adding that location to the list
on the left of the map. If items are in the list and a user starts typing a new location, the list
will filter to display on list items that are relevant to the search in case the user already has
searched for them. If a user clicks on the marker, or the list item that corresponds to the location,
then the marker will animate to show the user feedback, and display a window with information provided by
the Yelp API, and a link to the Yelp address containing the relevant information.

This was all accomplished using Knockout.js to monitor changes in the searchbar and clicks on links or markers,
using OAuth for the Yelp API information, and a ViewModel structure that references an outside map class that
can create the map, add markers to it, and filter it. The "myMap" class handles actions related to the map, while
the "ViewModel" directs the "myMap's" action and handles the list/searchbar functionality.

--- Helpful References ---
Udacity courses on Ajax and JavaScript Design Patterns
Google Maps API website
Yelp API website
Kevin Taylor's forum post located at: https://discussions.udacity.com/t/trouble-getting-yelp-api-to-work-correctly/27153