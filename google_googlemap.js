//code is from https://developers.google.com/maps/articles/phpsqlsearch_v3?csw=1
//and that page in 2017 says it is under Apache 2.0 license. (http://www.apache.org/licenses/LICENSE-2.0)
    //<![CDATA[
    var map;
    var geocoder;

    function load() {
      if (GBrowserIsCompatible()) {
        geocoder = new GClientGeocoder();
        map = new GMap2(document.getElementById('map'));
        map.addControl(new GSmallMapControl());
        map.addControl(new GMapTypeControl());
        map.setCenter(new GLatLng(40, -100), 4);
      }
    }

   function searchLocations() {
     var address = document.getElementById('addressInput').value;
     geocoder.getLatLng(address, function(latlng) {
       if (!latlng) {
         alert(address + ' not found');
       } else {
         searchLocationsNear(latlng);
       }
     });
   }

   function searchLocationsNear(center) {
     var radius = document.getElementById('radiusSelect').value;
     var searchUrl = 'assets/phpsqlsearch_genxml.php?lat=' + center.lat() + '&lng=' + center.lng() + '&radius=' + radius;
     GDownloadUrl(searchUrl, function(data) {
       var xml = GXml.parse(data);
       var markers = xml.documentElement.getElementsByTagName('marker');
       map.clearOverlays();

       var sidebar = document.getElementById('sidebar');
       sidebar.innerHTML = '';
       if (markers.length == 0) {
         sidebar.innerHTML = 'No results found.';
         map.setCenter(new GLatLng(40, -100), 4);
         return;
       }

       var bounds = new GLatLngBounds();
       for (var i = 0; i < markers.length; i++) {
         var name = markers[i].getAttribute('name');
         var address = markers[i].getAttribute('address');
         var distance = parseFloat(markers[i].getAttribute('distance'));
         var point = new GLatLng(parseFloat(markers[i].getAttribute('lat')),
                                 parseFloat(markers[i].getAttribute('lng')));
         
         var marker = createMarker(point, name, address);
         map.addOverlay(marker);
         var sidebarEntry = createSidebarEntry(marker, name, address, distance);
         sidebar.appendChild(sidebarEntry);
         bounds.extend(point);
       }
       map.setCenter(bounds.getCenter(), map.getBoundsZoomLevel(bounds));
     });
   }

    function createMarker(point, name, address) {
      var marker = new GMarker(point);
      var html = '<b>' + name + '</b> <br/>' + address;
      GEvent.addListener(marker, 'click', function() {
        marker.openInfoWindowHtml(html);
      });
      return marker;
    }

    function createSidebarEntry(marker, name, address, distance) {
      var div = document.createElement('div');
      var html = '<b>' + name + '</b> (' + distance.toFixed(1) + ')<br/>' + address;
      div.innerHTML = html;
      div.style.cursor = 'pointer';
      div.style.marginBottom = '5px'; 
      GEvent.addDomListener(div, 'click', function() {
        GEvent.trigger(marker, 'click');
      });
      GEvent.addDomListener(div, 'mouseover', function() {
        div.style.backgroundColor = '#eee';
      });
      GEvent.addDomListener(div, 'mouseout', function() {
        div.style.backgroundColor = '#fff';
      });
      return div;
    }
    //]]>
