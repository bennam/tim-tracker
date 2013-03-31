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
    messageInterval: null,
    overlay: null,
    spotUrl: 'https://api.findmespot.com/spot-main-web/consumer/rest-api/2.0/public/feed/0JQ8uiQGUq96qSapP3CixZnP00iH66CDb/',

    init: function () {

      this.loadMap();
      this.getJustGivingInformation();
      this.latestTweet();

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

      // JQTWEET.loadTweets();

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

      var ts = Math.round((new Date()).getTime() / 1000),
          that = this,
          url = 'https://maps.googleapis.com/maps/api/timezone/json?location=' + latLng.lat() + ',' + latLng.lng() + '&timestamp=' + ts + '&sensor=false';   

      $.ajax({
        type: "GET",
        url: url,
        dataType: "json",

        success: function(json) {

          that.displayLocalTime(json.rawOffset);

        },

        error: function (xhr, err) {  
          console.log("readyState: " + xhr.readyState + "\nstatus: " + xhr.status);  
          console.log("responseText: " + xhr.responseText);  
        }

      });

    },

    displayLocalTime: function (rawOffset) {

      var offset = Math.floor(parseInt(rawOffset, 10) / 3600);

      this.hourInterval = setInterval( function() {

        var currentTime = new Date();
        currentTime.setHours(currentTime.getHours() + offset);
        var hours = currentTime.getHours();

        $("#hours").html(( hours < 10 ? "0" : "" ) + hours);

      }, 1000);

      setInterval( function() {
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
        zoom: 19,
        mapTypeId: google.maps.MapTypeId.TERRAIN,
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



    getLocations: function () {

      var that = this;

      $.ajax({
        type: 'GET',
        url: this.spotUrl + 'message.json',
        dataType: 'jsonp',

        success: function(json) {

          $.each(json.response.feedMessageResponse.messages.message, function (i, item) {
              that.locations.push(new google.maps.LatLng(item.latitude, item.longitude));

          });
  
          that.drawPath(that.locations, '#ed1a3a');
          that.map.setCenter(that.locations[0]);
          that.addCustomMarkerAnimation(that.locations[0]);
          that.getLocalTime(that.locations[0]);
          that.showTotalDistance(that.route);
          that.addMarker(that.locations[that.locations.length - 1],'start-icon.png');

        }

      });

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

      var currentdate = new Date(); 

      var lastUpdate = "Position updated: " + currentdate.getDate() + "/" + (currentdate.getMonth() + 1)  + "/" + currentdate.getFullYear() + " @ " + currentdate.getHours() + ":" + currentdate.getMinutes() + ":" + currentdate.getSeconds();

      return lastUpdate;

    },
    
    updateMap: function (latLng) {

      var that = this;

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
      clearInterval(this.hourInterval);
      this.getLocalTime(latLng);

      console.log(that.logLastUpdate());

    }

  };

  $(function() {
      app.global.init();
  });

}(jQuery));