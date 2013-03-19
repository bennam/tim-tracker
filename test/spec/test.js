/* global describe it */

console.log(app);

'use strict';

(function () {

	//console.log(app.global.roundNumberWithCommas(2300.198))

    describe('Latest tweet', function () {

    	it('should display the latest #High5ives tweet');

    	it('should update the latest tweet every five minutes');

    });

    describe('Donations', function () {

        it('should display all donation messages');

        it('should display the total amount donated');

        it('should return a round number as a string with commas', function () {

			var number1 = app.global.roundNumberWithCommas(2300.198);
			var number2 = app.global.roundNumberWithCommas(14134.2345);
			var number3 = app.global.roundNumberWithCommas(44442222.1627474);

			expect(number1).to.equal('2,3,00');
			expect(number2).to.equal('14,134'); 
			expect(number3).to.equal('44,442,222');

        });

    });

 //    describe('Should display the latest donation amount');

 //    describe('Give it some context', function () {
 //        describe('maybe a bit more context here', function () {
 //            it('should run here few assertions', function () {

 //            });
 //        });
 //    });

	// describe("DOM Tests", function () {
	//     var el = document.createElement("div");
	//     el.id = "myDiv";
	//     el.innerHTML = "Hi there!";
	//     el.style.background = "#ccc";
	//     document.body.appendChild(el);
	 
	//     var myEl = document.getElementById('myDiv');
	//     it("is in the DOM", function () {
	//         expect(myEl).to.not.equal(null);
	//     });
	 
	//     it("is a child of the body", function () {
	//         expect(myEl.parentElement).to.equal(document.body);
	//     });
	 
	//     it("has the right text", function () {
	//         expect(myEl.innerHTML).to.equal("Hi there!");
	//     });
	 
	//     it("has the right background", function () {
	//         expect(myEl.style.background).to.equal("rgb(204, 204, 204)");
	//     });
	// });

})();


