$(function() {    
      
JQTWEET = {
     
    // Set twitter hash/user, number of tweets & id/class to append tweets
    // You need to clear tweet-date.txt before toggle between hash and user
    // for multiple hashtags, you can separate the hashtag with OR, eg:
    // hash: '%23jquery OR %23css'          
    search: '%23High5ives%20%40HAVASLYNXEU', //leave this blank if you want to show user's tweet
    user: 'HAVASLYNXEU', //username
    numTweets: 1, //number of tweets
    appendTo: '#jstwitter',
    useGridalicious: false,
    template: '<header>{IMG}<ul><li><a href="{URL}" target="_blank">{AGO}</a></li><li><a href="{URL}" target="_blank">@{USER}</a></li></ul></header><p>{TEXT}</p>',

    // core function of jqtweet
    // https://dev.twitter.com/docs/using-search
    loadTweets: function() {

        var request;
 
        // different JSON request {hash|user}
        if (JQTWEET.search) {
          request = {
              q: JQTWEET.search,
              count: JQTWEET.numTweets,
              api: 'search_tweets'
          }
        } else {
          request = {
              q: JQTWEET.user,
              count: JQTWEET.numTweets,
              api: 'statuses_userTimeline'
          }
        }

        $.ajax({
          url: 'timtracker/api/grabtweets.php',
          type: 'POST',
          dataType: 'json',
          data: request,
          error: function (xhr, ajaxOptions, thrownError) {
            console.log(xhr.status);
            console.log(thrownError);
          },
          success: function(data, textStatus, xhr) {

           if (data.httpstatus == 200) {

            if (JQTWEET.search) data = data.statuses;

            var text, name, img;   

            // test time

            console.log(data)



            

            // try {

                  // append tweets into page
                  for (var i = 0; i < JQTWEET.numTweets; i++) {   
var now = new Date();
 var nowWrapper = moment(now);                  
 var pastDateWrapper = moment(data[i].created_at);
 var displayDate = pastDateWrapper.from(nowWrapper);
 console.log(displayDate) // displays humanized time difference between now and pastDate

                    var time = moment(data[i].created_at).format("MM-DD-YYYY");

                    img = '';
                    url = 'http://twitter.com/' + data[i].user.screen_name + '/status/' + data[i].id_str;
                    try {
                      if (data[i].user.profile_image_url) {
                        img = '<a href="' + url + '" target="_blank"><img class="twitter-user-img" src="' + data[i].user.profile_image_url + '" /></a>';
                      }
                    } catch (e) {  
                      //no media
                    }

                    $(JQTWEET.appendTo).html( JQTWEET.template.replace('{TEXT}', JQTWEET.ify.clean(data[i].text) ).replace('{USER}', data[i].user.screen_name).replace('{IMG}', img).replace('{AGO}', time ).replace('{URL}', url ));

                  
                  }

                // } catch (e) {
                //   //item is less than item count
                // }
                
                if (JQTWEET.useGridalicious) {                
                  //run grid-a-licious
                 $(JQTWEET.appendTo).gridalicious({
                  gutter: 13, 
                  width: 200, 
                  animate: true
                });                    
               }                  

             } else alert('no data returned');
             
           }   

         });
 
    }, 
     
         
    /**
      * relative time calculator FROM TWITTER
      * @param {string} twitter date string returned from Twitter API
      * @return {string} relative time like "2 minutes ago"
      */
    timeAgo: function(dateString) {
        var rightNow = new Date();
        var then = new Date(dateString);
         
        // if ($.browser.msie) {
        //     // IE can't parse these crazy Ruby dates
        //     then = Date.parse(dateString.replace(/( \+)/, ' UTC$1'));
        // }
 
        var diff = rightNow - then;
 
        var second = 1000,
        minute = second * 60,
        hour = minute * 60,
        day = hour * 24,
        week = day * 7;
 
        if (isNaN(diff) || diff < 0) {
            return ""; // return blank string if unknown
        }
 
        if (diff < second * 2) {
            // within 2 seconds
            return "right now";
        }
 
        if (diff < minute) {
            return Math.floor(diff / second) + " seconds ago";
        }
 
        if (diff < minute * 2) {
            return "about 1 minute ago";
        }
 
        if (diff < hour) {
            return Math.floor(diff / minute) + " minutes ago";
        }
 
        if (diff < hour * 2) {
            return "about 1 hour ago";
        }
 
        if (diff < day) {
            return  Math.floor(diff / hour) + " hours ago";
        }
 
        if (diff > day && diff < day * 2) {
            return "yesterday";
        }
 
        if (diff < day * 365) {
            return Math.floor(diff / day) + " days ago";
        }
 
        else {
            return "over a year ago";
        }
    }, // timeAgo()
     
     
    /**
      * The Twitalinkahashifyer!
      * http://www.dustindiaz.com/basement/ify.html
      * Eg:
      * ify.clean('your tweet text');
      */
    ify:  {
      link: function(tweet) {
        return tweet.replace(/\b(((https*\:\/\/)|www\.)[^\"\']+?)(([!?,.\)]+)?(\s|$))/g, function(link, m1, m2, m3, m4) {
          var http = m2.match(/w/) ? 'http://' : '';
          return '<a class="twtr-hyperlink" target="_blank" href="' + http + m1 + '">' + ((m1.length > 25) ? m1.substr(0, 24) + '...' : m1) + '</a>' + m4;
        });
      },
 
      at: function(tweet) {
        return tweet.replace(/\B[@＠]([a-zA-Z0-9_]{1,20})/g, function(m, username) {
          return '<a target="_blank" class="twtr-atreply" href="http://twitter.com/intent/user?screen_name=' + username + '">@' + username + '</a>';
        });
      },
 
      list: function(tweet) {
        return tweet.replace(/\B[@＠]([a-zA-Z0-9_]{1,20}\/\w+)/g, function(m, userlist) {
          return '<a target="_blank" class="twtr-atreply" href="http://twitter.com/' + userlist + '">@' + userlist + '</a>';
        });
      },
 
      hash: function(tweet) {
        return tweet.replace(/(^|\s+)#(\w+)/gi, function(m, before, hash) {
          return before + '<a target="_blank" class="twtr-hashtag" href="http://twitter.com/search?q=%23' + hash + '">#' + hash + '</a>';
        });
      },
 
      clean: function(tweet) {
        return this.hash(this.at(this.list(this.link(tweet))));
      }
    } // ify
 
     
};    

});
