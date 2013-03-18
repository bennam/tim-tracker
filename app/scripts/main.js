// TODO:
// Markers - custom animations
// Latest tweets
// Style
// Testing

var app =  app || {};

(function () {

  "use strict";

  app.global = {

    map: null,
    route: null,
    currentPositionMarker: null,
    locations: [],
    hourInterval: null,
    messageInterval: null,
    spotUrl: 'https://api.findmespot.com/spot-main-web/consumer/rest-api/2.0/public/feed/0JQ8uiQGUq96qSapP3CixZnP00iH66CDb/',
    justGivingUrl: 'http://api.jo.je/justgiving/jsonp.php?d=TimWoodcockMdS&callback=?',

    init: function () {

      this.loadMap();
      this.getJustGivingInformation();
      this.updatePosition(300000);
      
    },

    latestTweet: function () {

    },

    getJustGivingInformation: function () {

      var that = this;

      $.ajax({
        type: 'GET',
        url: this.justGivingUrl,
        dataType: "jsonp",

        success: function(json) {
            that.showTotalDonationAmount(json.donations_total);
            that.showDonationMessages(json)
            console.log(JSON.stringify(json))
        },

        error: function (xhr, err) {  
          console.log("readyState: " + xhr.readyState + "\nstatus: " + xhr.status);  
          console.log("responseText: " + xhr.responseText);  
        }

      });

    },

    showTotalDonationAmount: function (data) {

      $('.js-amount').html('<p>Total amount raised:' + this.roundNumberWithCommas(data) + '</p>');

    },

    showDonationMessages: function (data) {

      clearInterval(this.messageInterval);
      $('#messages').html('')

      $.each(data.donations, function (i, item) {

        if ( (item.person !== '') && (item.message !== '') ) {
          $('#messages').append('<div><p>"' + item.message + '"</p><p>' + item.person + '</p></div>');
        }

      });

      this.donationMessageAnimation();

    },

    donationMessageAnimation: function () {

      var aniSpd = 5000;
      var fadeSpd = 1000;
      var startIndex = 0;
      var endIndex = $('#messages div').length;
      
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

    getLocalTime: function () {

      var curLatLong = String(this.currentPositionMarker.getPosition()).replace(/[() ]/g, ''),
          ts = Math.round((new Date()).getTime() / 1000),
          that = this;   

      $.ajax({
        type: "GET",
        url: 'https://maps.googleapis.com/maps/api/timezone/json?location=' + curLatLong + '&timestamp=' + ts + '&sensor=false',
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
        $(".js-localtime").show();
      }, 1000);

    },

    loadMap: function () {

      var mapOptions = {
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };

      this.map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);
      this.getLocations();

    },

    updatePosition: function (interval) {

      var that = this;

      setInterval( function() {

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
            console.log('Position updated');
          },

          error: function (xhr, err) {  
            console.log("readyState: " + xhr.readyState + "\nstatus: " + xhr.status);  
            console.log("responseText: " + xhr.responseText);  
          }
        });

      }, interval);

    },

    updateMap: function (latLng) {

      var that = this;

      this.locations.unshift(latLng);

      this.drawPath(this.locations, '#FF0000');
      this.currentPositionMarker.setAnimation(google.maps.Animation.BOUNCE);

      setTimeout(function(){ 
        that.currentPositionMarker.setAnimation(null); 
      }, 2000);

      this.currentPositionMarker.setPosition(latLng);
      this.map.panTo(latLng);

      $(".js-totaldistance").html(this.getTotalDistance(this.route));
      clearInterval(this.hourInterval);
      this.getLocalTime();

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

          that.drawPath(that.locations, '#FF0000');
          that.map.setCenter(that.locations[0]);

          that.currentPositionMarker = new google.maps.Marker({
            position: that.locations[0],
            map: that.map
          });

          that.getLocalTime();

          $(".js-totaldistance").html(that.getTotalDistance(that.route));

        }

      });

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

    getTotalDistance: function (path) {

      google.maps.LatLng.prototype.kmTo = function(a){ 
        var e = Math, ra = e.PI/180; 
        var b = this.lat() * ra, c = a.lat() * ra, d = b - c; 
        var g = this.lng() * ra - a.lng() * ra; 
        var f = 2 * e.asin(e.sqrt(e.pow(e.sin(d/2), 2) + e.cos(b) * e.cos 
          (c) * e.pow(e.sin(g/2), 2))); 
        return f * 6378.137; 
      } 
      google.maps.Polyline.prototype.inKm = function(n){ 
        var a = this.getPath(n), len = a.getLength(), dist = 0; 
        for(var i=0; i<len-1; i++){ 
          dist += a.getAt(i).kmTo(a.getAt(i+1)); 
        } 
        return dist; 
      }

     // Convert result to miles from km.
     return Math.round(path.inKm() * 0.6214);

    }

  }

  $(function() {
      app.global.init();
  });

}(jQuery));