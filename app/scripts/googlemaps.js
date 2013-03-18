
<script type="text/javascript" src="http://www.google.com/jsapi"></script>
<script type="text/javascript">
  google.load("maps", "3", { other_params: "sensor=false" });
  google.load("jquery", "1.3.2");

  function initialize() {
    var myLatlng = new google.maps.LatLng(54.252892, -3.123009);
    var myOptions = {
      zoom: 8,
      center: myLatlng,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    }
    var map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);

    // Probably should have some sort of fall back or message displayed
    // get function fails to find .XML

    jQuery.get("assets/xml/CumbriaPolice.XML", {}, function (data) {

      var i = 0;

      jQuery(data).find("incident").each(function () {

        var incident = jQuery(this);

        var latlng = new google.maps.LatLng(parseFloat(incident.attr("lat")),
                  parseFloat(incident.attr("lon")));
        var marker = new google.maps.Marker({ position: latlng, map: map });

        // create list of incident items
        var incidentId = 'incident_' + i;

        var incidentColumnItem = '<div class="incident_item" id="' + incidentId + '">'
        + '<div class="icon">'
        + '<img src="assets/images/alert_icon.png" alt="Alert icon" />'
        + '</div>'
        + '<div class="text">'
        + incident.find('locations').find('[type="PRIMARY"]').text()
        + '</div>'
        + '</div>';

        $('#incident_column').append(incidentColumnItem);

        // create html for details

        var incidentDetail = '<div class="incident_detail_wrapper" id="' + incidentId + '_detail' + '">'
        + '<p>' + '<span class="incident_date">' + incident.find('entry').find('[type="REPORT"]').text().split(' ')[0] + '</span>' + ' > Incident ' + incident.attr('id') + '</p>'
        + '<h4>General Information</h4>'
        + '<table class="incident_table">'
        + '<tr><td class="detail_title">Type</td><td class="detail">' + incident.find('details').attr('category') + '</td></tr>'
        + '<tr><td class="detail_title">Priority</td><td class="detail">' + createPriorityHTML(incident.find('details').attr('priority')) + '</td></tr>'
        + '<tr><td class="detail_title">Details</td><td class="detail">' + incident.find('details').attr('template') + '</td></tr>'
        + '<tr><td class="detail_title">Reported</td><td class="detail">' + incident.find('entry').find('[type="REPORT"]').text() + '</td></tr>'
        + '<tr><td class="detail_title">Updated</td><td class="detail">' + incident.find('entry').find('[type="UPDATE"]').text() + '</td></tr>'
        + '<tr><td colspan="2"><h4>Estimated Disruption Period</h4></td></tr>'
        + '<tr><td class="detail_title">Concluding</td><td class="detail">' + incident.find('schedule').find('date-time').text() + '</td></tr>'
        + '</table>'
        + '</div>';

        // *--create events--*

        // mousedown used as it appears quicker than click event
        $('#' + incidentId).bind('mousedown', function (e) {

          // show incident detail based on incidentId_detail naming convention
          $('#incident_details').html(incidentDetail);
          $('.incident_detail_wrapper').fadeIn();

          // also center map on marker position on mousedown of that particular incident
          map.panTo(marker.position);

          // bounce marker for effect
          marker.setAnimation(google.maps.Animation.BOUNCE);

          // time out animation as it never stops!
          setTimeout(function () {
            marker.setAnimation(null);
          }, 1500)

        });

        // set first marker incident details to be show as default in incident_details div
        if (i == 0) {
          $('#incident_details').html(incidentDetail);
          $('.incident_detail_wrapper').fadeIn();
        }

        // info bubble

        var contentString = '<h3 class="info_header">Address:</h3><p class="info">' + incident.find('locations').find('[type="PRIMARY"]').text() + '</p>';

        var infowindow = new google.maps.InfoWindow({
          content: contentString
        });

        // flag open window variable
        var openWindow = 0;

        google.maps.event.addListener(marker, 'click', function () {

          //close the open window
          if (openWindow > 0) {
            map.panTo(marker.position);
            infowindow.close();
            openWindow = 0;

          } else {
            map.panTo(marker.position);
            infowindow.open(map, marker);
            openWindow = 1;

            // when user clicks marker related incident details will appear in
            // incident_details div
            $('#incident_details').html(incidentDetail);
            $('.incident_detail_wrapper').fadeIn();

          }
        });

        // dblclick event zooms close into marker

        google.maps.event.addListener(marker, 'dblclick', function () {

          map.setZoom(13);
          map.panTo(marker.position);

        });
        // increment i for id's
        i++;
      });
    });
  }

  google.setOnLoadCallback(initialize);

  // function for priority visualisation
  function createPriorityHTML(priorityNumber) {

    var priorityNumberInt = parseFloat(priorityNumber);

    // loop and create li's based priorityNumber of times

    var priorityListHTML = '';

    for (var i = 0; i < priorityNumberInt; i++) {
      priorityListHTML += '<li class="priority"></li>';
    }

    var html = '<ul class="priority_list">' + priorityListHTML + '</ul>';

    return html;

  }
</script>