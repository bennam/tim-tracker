/* global describe it */
'use strict';
(function () {

    describe('Latest tweet', function () {

    	it('should display the latest #High5ives tweet', function() {

		});

    	it('should update the latest tweet every five minutes', function() {

		});

    });

    describe('Donations', function () {

        it('should display the total amount donated', function () {

        });

        it('should return a round number as a string with commas', function () {

			var number = app.global.roundNumberWithCommas(2300.198);
			number.should.equal('2,300');  

        });

    });

    describe('Should display the latest donation amount', function () {

    });

    describe('Give it some context', function () {
        describe('maybe a bit more context here', function () {
            it('should run here few assertions', function () {

            });
        });
    });

	describe("DOM Tests", function () {
	    var el = document.createElement("div");
	    el.id = "myDiv";
	    el.innerHTML = "Hi there!";
	    el.style.background = "#ccc";
	    document.body.appendChild(el);
	 
	    var myEl = document.getElementById('myDiv');
	    it("is in the DOM", function () {
	        expect(myEl).to.not.equal(null);
	    });
	 
	    it("is a child of the body", function () {
	        expect(myEl.parentElement).to.equal(document.body);
	    });
	 
	    it("has the right text", function () {
	        expect(myEl.innerHTML).to.equal("Hi there!");
	    });
	 
	    it("has the right background", function () {
	        expect(myEl.style.background).to.equal("rgb(204, 204, 204)");
	    });
	});

})();


