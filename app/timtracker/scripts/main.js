var app =  app || {};

(function () {

  "use strict";

  app.global = {

    map: null,
    route: null,
    marker: null,
    currentPositionMarker: null,
    locations: [],
    hourInterval: null,
    minuteInterval: null,
    messageInterval: null,
    overlay: null,
    spotUrl: 'https://api.findmespot.com/spot-main-web/consumer/rest-api/2.0/public/feed/0JQ8uiQGUq96qSapP3CixZnP00iH66CDb/',

    init: function () {

      this.loadMap();
      this.getJustGivingInformation();
      this.latestTweet();
      this.logLastUpdate();

      // Interval of 300000 = 5 mins.
      this.updateAll(300000);

      this.toggleSidebar();

      $('.js-drag').dragon({
        'within': $('body')
      });
      
    },

    toggleSidebar: function () {

      $("#js-close").on("click", function(e){
        e.preventDefault();
        $('.left-col').animate({"left": "-200"}, "800");
      }); 
      $("#js-open").on("click", function(e){
        e.preventDefault();
        $('.left-col').animate({"left": "0"}, "800");
      }); 

    },

    latestTweet: function () {

      JQTWEET.loadTweets();

    },

    getJustGivingInformation: function () {

      var that = this,
          url = 'http://api.jo.je/justgiving/jsonp.php?d=TimWoodcockMdS&callback=?';

      $.ajax({
        type: 'GET',
        url: url,
        dataType: "jsonp",

        success: function(json) {
            that.showTotalDonationAmount(json.donations_total);
            that.showDonationMessages(json);
        },

        error: function (xhr, err) {  
          console.log("readyState: " + xhr.readyState + "\nstatus: " + xhr.status);  
          console.log("responseText: " + xhr.responseText);  
        }

      });

    },

    showTotalDonationAmount: function (data) {

      $('.js-amount').html('£' + this.roundNumberWithCommas(data));

    },

    showDonationMessages: function (data) {

      // Clear interval and html div.
      clearInterval(this.messageInterval);
      $('#messages').html('');

      $.each(data.donations, function (i, item) {

        if ( (item.person !== '') && (item.message !== '') ) {

          // Limit text to 125 characters.
          if(item.message.length > 125){
            item.message = item.message.substring(0,125) + '...';
          }

          $('#messages').append('<div><blockquote><span>' + item.message + '</span></blockquote><p class="person">' + item.person + '</p></div>');

        }

      });

      this.donationMessageAnimation();

    },

    donationMessageAnimation: function () {

      var aniSpd = 5000,
          fadeSpd = 1000,
          startIndex = 0,
          endIndex = $('#messages div').length;
      
      $('#messages div:first').fadeIn(fadeSpd);

      this.messageInterval = window.setInterval(function() {

        $('#messages div:eq(' + startIndex + ')').fadeOut(fadeSpd);
        startIndex++;
        $('#messages div:eq(' + startIndex + ')').delay(fadeSpd).fadeIn(fadeSpd);

        if (startIndex === endIndex) {
          $('#messages div:eq(0)').delay(fadeSpd).fadeIn(fadeSpd);
          startIndex = 0;
        }

      }, aniSpd);

    },

    roundNumberWithCommas: function (num) {

      var number = Math.round(parseInt(num, 10)).toString();
      return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    },

    getLocalTime: function (latLng) {

      var that = this,
          url = 'http://api.geonames.org/timezoneJSON?formatted=true&lat=' + latLng.lat() + '&lng=' + latLng.lng() + '&username=bennam&style=full';

      $.ajax({
        type: "GET",
        url: url,
        cache: false,
        dataType: "json",

        success: function(json) {

          that.displayLocalTime(json.time);

        },

        error: function (xhr, err) {  
          console.log("readyState: " + xhr.readyState + "\nstatus: " + xhr.status);  
          console.log("responseText: " + xhr.responseText);  
        }

      });

    },

    goTo: function (place) {

      var t;

      switch (place) {

        case 'adelaide':
          t = [-34.928621,138.599959];
        break;
        case 'rome':
          t = [41.892438,12.481499];
        break;
        case 'moscow':
          t = [55.749646,37.62368];
        break;
        case 'newyork':
          t = [40.714353,-74.005973];
        break;

        // Ouarzazate, Morocco.
        default:
          t = [30.91987,-6.893539];
        break;
      }

      this.updateMap(new google.maps.LatLng(t[0],t[1]));

    },

    displayLocalTime: function (time) {

      var localHour = moment(time).hour();
      var hourOffset = localHour - new Date().getHours();

      // var localMinute = moment(time).minute();
      // var minuteOffset = localMinute - new Date().getMinutes();

      clearInterval(this.hourInterval);
      clearInterval(this.minuteInterval);

      this.hourInterval = setInterval( function() {
        var hours = new Date().getHours() + parseInt(hourOffset,10);
        $("#hours").html(( hours < 10 ? "0" : "" ) + hours);
      },1000);

      this.minuteInterval = setInterval( function() {
        var minutes = new Date().getMinutes();
        $("#min").html(( minutes < 10 ? "0" : "" ) + minutes);
      },1000);

      setInterval( function() {
        var seconds = new Date().getSeconds();
        $("#sec").html(( seconds < 10 ? "0" : "" ) + seconds);
      },1000);

      setTimeout(function() {
        $(".js-localtime-loading").hide();
        $(".js-localtime").css('display', 'block');
      }, 1010);

    },

    loadMap: function () {

      var mapOptions = {
        zoom: 13,
        mapTypeId: google.maps.MapTypeId.SATELLITE,
        panControlOptions: {
            position: google.maps.ControlPosition.RIGHT_TOP
        },
        mapTypeControlOptions: {
            position: google.maps.ControlPosition.TOP_RIGHT
        },
        zoomControlOptions: {
            position: google.maps.ControlPosition.RIGHT_TOP
        },
        streetViewControl: false
      };

      this.map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);
      this.getLocations();

    },

    getLocations: function (start) {

      var that = this;

      start = start || 0;

      $.ajax({
        type: 'GET',
        url: this.spotUrl + 'message.json?start=' + start,
        dataType: 'jsonp',

        success: function(json) {

          var count;

          if (!json.response.errors) {

            count = json.response.feedMessageResponse.count;

            $.each(json.response.feedMessageResponse.messages.message, function (i, item) {
              that.locations.push(new google.maps.LatLng(item.latitude, item.longitude));
            });

          } else {
            count = 0;
          }

          if (count < 50) {
            that.drawLocations(that.locations);
          } else {
            that.getLocations(start + 50);
          }

        }

      });

    },

    drawLocations: function (locations) {

      this.drawPath(locations, '#ed1a3a');
      this.map.setCenter(locations[0]);
      this.addCustomMarkerAnimation(locations[0]);
      this.getLocalTime(locations[0]);
      this.showTotalDistance(this.route);

      // Markers.
      this.addMarker(locations[locations.length - 1],'start-icon.png');
      this.addMarker(new google.maps.LatLng(30.94726,-4.33621),'stage-2-icon.png');
      this.addMarker(new google.maps.LatLng(30.84978,-4.57175),'stage-3-icon.png');

    },

    addMarker: function (latLng, icon) {

      var iconBase = 'timtracker/images/';

       this.marker = new google.maps.Marker({
        position: latLng,
        map: this.map,
        icon: iconBase + icon
      });

    },

    addCustomMarkerAnimation: function (latLng) {

      USGSOverlay.prototype = new google.maps.OverlayView();

      var bounds = latLng;
      var html = '<div class="marker-glow"></div><div class="marker-shape"></div>';

      this.overlay = new USGSOverlay(bounds, this.map, html);

      function USGSOverlay(bounds, map, html) {

        this.bounds_ = bounds;
        this.map_ = map;
        this.html_ = html;
        this.div_ = null;
        this.setMap(map);

      }

      USGSOverlay.prototype.onAdd = function() {

        var div = document.createElement('div');

        div.setAttribute("class", "marker");

        $(div).html(this.html_);

        this.div_ = div;

        var panes = this.getPanes();
        panes.overlayLayer.appendChild(div);

      };

      USGSOverlay.prototype.draw = function() {

        var overlayProjection = this.getProjection();

        var pos = overlayProjection.fromLatLngToDivPixel(this.bounds_);

        var div = this.div_;

        if (div !== null) {
          div.style.left = (pos.x - 20) + 'px';
          div.style.top = (pos.y - 20) + 'px';
        }

      };

      USGSOverlay.prototype.onRemove = function() {
        this.div_.parentNode.removeChild(this.div_);
        this.div_ = null;
      };
      

    },

    drawPath: function (path,strokeColor) {

      var drawPathOptions = {

        path: path,
        strokeColor: strokeColor,
        strokeOpacity: 1.0,
        strokeWeight: 2

      };

      this.route = new google.maps.Polyline(drawPathOptions);
      this.route.setMap(this.map);

    },

    showTotalDistance : function (path) {

      var km = this.getTotalDistance(path);
      var miles = Math.round(km * 0.6214);
      var html = miles + 'mi<span class="seperator">/</span>' + km + 'km';

      $('.js-total-distance').html(html);

    },

    getTotalDistance: function (path) {

      google.maps.LatLng.prototype.kmTo = function(a){ 
        var e = Math, ra = e.PI/180; 
        var b = this.lat() * ra, c = a.lat() * ra, d = b - c; 
        var g = this.lng() * ra - a.lng() * ra; 
        var f = 2 * e.asin(e.sqrt(e.pow(e.sin(d/2), 2) + e.cos(b) * e.cos 
          (c) * e.pow(e.sin(g/2), 2))); 
        return f * 6378.137; 
      }; 
      google.maps.Polyline.prototype.inKm = function(n){ 
        var a = this.getPath(n), len = a.getLength(), dist = 0; 
        for(var i=0; i<len-1; i++){ 
          dist += a.getAt(i).kmTo(a.getAt(i+1)); 
        } 
        return dist; 
      };

     return Math.round(path.inKm());

    },

    updateAll: function (interval) {

      var that = this;

      setInterval( function() {

        // Update Justgiving information.
        that.getJustGivingInformation();

        // Update Twitter feed.
        that.latestTweet();

        // Update map.
        $.ajax({
          type: 'GET',
          url: that.spotUrl + 'latest.json',
          dataType: 'jsonp',

          success: function(json) {
            var newLocation = [];
            $.each(json.response.feedMessageResponse.messages, function (i, item) {
              newLocation.push(new google.maps.LatLng(item.latitude, item.longitude));
            });
            that.updateMap(newLocation[0]);

          },

          error: function (xhr, err) {  
            console.log("readyState: " + xhr.readyState + "\nstatus: " + xhr.status);  
            console.log("responseText: " + xhr.responseText);  
          }
        });

      }, interval);

    },

    logLastUpdate: function () {

      var lastUpdate = "Position updated: " + moment().format('HH:mm:ss MMMM Do');

      return console.log(lastUpdate);

    },
    
    updateMap: function (latLng) {

      this.locations.unshift(latLng);
      this.drawPath(this.locations, '#ed1a3a');

      // Remove overlay if exists.
      if (this.overlay !== null) {
        this.overlay.onRemove(app.global.overlay);
      }

      // Update marker animation.
      this.addCustomMarkerAnimation(latLng);
      this.map.panTo(latLng);

      // Update total distance.
      this.showTotalDistance(this.route);

      // Update clock.
      this.getLocalTime(latLng);

      this.logLastUpdate();

    }

  };

  $(function() {
      app.global.init();
  });

}(jQuery));