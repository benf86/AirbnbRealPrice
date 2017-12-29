chrome.extension.sendMessage({}, function(response) {
	var readyStateCheckInterval = setInterval(function() {
	if (document.readyState === "complete") {
		clearInterval(readyStateCheckInterval);

		// ----------------------------------------------------------
		// This part of the script triggers when page is done loading
		console.log("Airbnb Real Prices extension loaded. Mouse-over the 'per day/month' part to update it. Limit is 1 / second so you don't get banned.");

		var searchDefaults = {
			format: 'for_web_with_date',
			apiKey: JSON.parse($('meta[content*="api_config"]').attr('content')).api_config.key,
			currency: 'EUR'
		}

		function parseQueryParams() {
			return window.location.href
				.split('?')[1]
				.split('&')
				.reduce(function (cur, next) {
					let mySplit = next.split('=');
					cur[mySplit[0]] = mySplit[1];
					return cur;
				}, searchDefaults);
		}



		function updateListing(listingId) {
			return !listingId
			? null
			: getActualPrice(Object.assign({}, parseQueryParams(), { listing_id: listingId }));
		}

		function getActualPrice(searchData) {
			let parentListingDivEl = $(`#listing-${searchData.listing_id}`);
			var settings = {
				"async": true,
				"crossDomain": true,
				"url": `https://www.airbnb.com/api/v2/pdp_listing_booking_details?guests=${searchData.adults + searchData.children}&listing_id=${searchData.listing_id}&_format=${searchData.format}&check_in=${searchData.checkin}&check_out=${searchData.checkout}&number_of_adults=${searchData.adults}&number_of_children=${searchData.children}&number_of_infants=${searchData.infants}&key=${searchData.apiKey}&currency=${searchData.currency}`,
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
			window.blabla = parentListingDivEl;
			$($(parentListingDivEl)
				.find('span:contains("Per")')[3])
				.text(function (i, old) { return `${old} (Total: ${actualPrice})`; });
		}

		function setListener() {
			$('body').mouseover(function handleEvent (event) {
				if (~['per night', 'per day', 'per month', 'per year'].indexOf(event.target.textContent.toLowerCase())) {
					let i = 0;
					let el = event.target;

					while (!~el.id.indexOf('listing') && i < 100) {
						el = el.parentElement
						i += 1;
					}
					console.log(`Updating: ${el.id}`);
					updateListing(el.id.split('-')[1]);

					$('body').off('mouseover', handleEvent);
					setTimeout(function () {
						setListener();
					}, 1000);
				}
			});
		}

		setListener();
		// ----------------------------------------------------------

	}
	}, 10);
});