chrome.extension.sendMessage({}, function(response) {
	var readyStateCheckInterval = setInterval(function() {
	if (document.readyState === "complete") {
		clearInterval(readyStateCheckInterval);

		// ----------------------------------------------------------
		// This part of the script triggers when page is done loading
		console.log("Hello. This message was sent from scripts/inject.js");

		var targetNode = document.getElementsByTagName('body')[0];
		var config = { attributes: true, childList: true };

		var observer = new MutationObserver(updateListing);

		observer.observe(targetNode, config);

		function updateListing() {
			getActualPrice(search);
		}

		var search = {
			guests: 1,
			listing_id: '12579291',
			format: 'for_web_with_date',
			check_in: '2018-01-07',
			check_out: '2018-01-09',
			adults: '1',
			children: '0',
			infants: '0',
			apiKey: 'd306zoyjsyarp7ifhu67rjxn52tv0t20',
			currency: 'EUR'
		}


		function getActualPrice(searchData) {
			let parentListingDivEl = $(`#listing-${searchData.listing_id}`);
			console.log(parentListingDivEl);
			var settings = {
				"async": true,
				"crossDomain": true,
				"url": `https://www.airbnb.com/api/v2/pdp_listing_booking_details?guests=${search.guests}&listing_id=${search.listing_id}&_format=${search.format}&check_in=${search.check_in}&check_out=${search.check_out}&number_of_adults=${search.adults}&number_of_children=${search.children}&number_of_infants=${search.infants}&key=${search.apiKey}&currency=${search.currency}`,
				"method": "GET",
				"headers": {
					"cache-control": "no-cache"
				}
			}

			$.ajax(settings)
			.done(function (response) {
				let actualPrice = response.pdp_listing_booking_details[0].price.total.amount_formatted;
				updateActualPrice(parentListingDivEl, actualPrice);
			});
		}

		function updateActualPrice(parentListingDivEl, actualPrice) {
			console.log($(parentListingDivEl).find('span:contains("Per")'));
			window.blabla = parentListingDivEl;
			$($(parentListingDivEl)
				.find('span:contains("Per")')[3])
				.text(function (i, old) { return `${old} (Total: ${actualPrice})`; });
		}
		// ----------------------------------------------------------

	}
	}, 10);
});